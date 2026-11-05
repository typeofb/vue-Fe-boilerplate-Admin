import axios from 'axios';
import {API_CONFIG, AUTH_API, RESPONSE_CODE} from '@/config';
import {clearTokens, getAccessToken, getRefreshToken, setTokens} from '@/utils/token';
import {blobToJson, parseFilename, saveBlob} from '@/utils/file';
import toast from '@/utils/toast';
import {useAppStore} from '@/stores/app.store';
import {ApiError, ERROR_MESSAGES} from './errors';
import {addPending, removePending} from './request-manager';

/**
 * Axios 인스턴스 + 공통 인터셉터
 *
 *  [요청]  토큰 자동 주입 → 중복 요청 검사 / AbortController 부여 → 전역 로딩 시작
 *  [응답]  로딩 종료 → 업무 코드 검사({code, message, data}) → 공통 에러 처리
 *  [401]   refresh 토큰으로 재발급 후 원 요청 재시도.
 *          재발급 중 들어온 다른 401 요청은 같은 refresh Promise 를 기다렸다가 함께 재시도 (대기열)
 *          재발급 실패 시 authFailureHandler 호출 (main.js 에서 로그아웃 + 로그인 화면 이동)
 *
 *  화면/스토어에서는 axios 대신 아래 `request` 헬퍼를 사용합니다. (data 언랩)
 */
const http = axios.create({
    baseURL: API_CONFIG.BASE_URL,
    timeout: API_CONFIG.TIMEOUT,
    withCredentials: true, // refresh 토큰 HttpOnly 쿠키 전송
    headers: {
        'Content-Type': 'application/json',
        'X-Requested-With': 'XMLHttpRequest',
    },
});

// ---------------------------------------------------------------------------
// 인증 실패 핸들러 (순환 참조 방지를 위해 main.js 에서 주입)
// ---------------------------------------------------------------------------
let authFailureHandler = null;
export const setAuthFailureHandler = (handler) => {
    authFailureHandler = handler;
};

const handleAuthFailure = () => {
    // 동시에 여러 요청이 실패해도 1회만 처리
    if (!getAccessToken()) return;
    clearTokens();
    authFailureHandler?.();
};

// ---------------------------------------------------------------------------
// 헬퍼
// ---------------------------------------------------------------------------
const isSuccessCode = (code) => RESPONSE_CODE.SUCCESS_CODES.includes(code);
const isStandardBody = (body) => body !== null && typeof body === 'object' && !(body instanceof Blob) && 'code' in body;
const isAuthUrl = (url = '') => [AUTH_API.LOGIN, AUTH_API.REFRESH].some((u) => url.endsWith(u));

const startLoading = (config) => {
    if (config.loading === false) return;
    useAppStore().startLoading();
    config._loadingStarted = true;
};

const finalize = (config) => {
    if (!config) return;
    removePending(config);
    if (config._loadingStarted) {
        config._loadingStarted = false;
        useAppStore().stopLoading();
    }
};

/** 사용자에게 에러 노출 (silent 옵션이면 생략) */
const notify = (error, config) => {
    if (config?.silent || error.isCanceled || error.isDuplicate) return;
    toast.error(error.message);
    error.handled = true;
};

const messageByStatus = (status, serverMessage) => {
    if (status >= 500) return ERROR_MESSAGES.SERVER;
    if (status === 403 || status === 404) return serverMessage || ERROR_MESSAGES[status];
    return serverMessage || ERROR_MESSAGES[status] || ERROR_MESSAGES.DEFAULT;
};

/** axios 에러 → ApiError */
const toApiError = async (error) => {
    if (axios.isCancel(error) || error.code === 'ERR_CANCELED') {
        return new ApiError({message: '요청이 취소되었습니다.', isCanceled: true, cause: error});
    }

    if (!error.response) {
        const isTimeout = error.code === 'ECONNABORTED' || error.code === 'ETIMEDOUT';
        return new ApiError({
            message: isTimeout ? ERROR_MESSAGES.TIMEOUT : ERROR_MESSAGES.NETWORK,
            code: error.code,
            isNetwork: true,
            cause: error,
        });
    }

    const {status} = error.response;
    let body = error.response.data;
    if (body instanceof Blob) body = await blobToJson(body); // 파일 다운로드 API 의 에러 응답

    return new ApiError({
        message: messageByStatus(status, body?.message),
        status,
        code: body?.code ?? null,
        data: body?.data ?? null,
        cause: error,
    });
};

// ---------------------------------------------------------------------------
// 토큰 재발급 (동시 요청 대기열)
// ---------------------------------------------------------------------------
let refreshPromise = null;

const refreshAccessToken = () => {
    if (!refreshPromise) {
        refreshPromise = http
            .post(
                AUTH_API.REFRESH,
                {refreshToken: getRefreshToken()}, // HttpOnly 쿠키 방식이면 서버는 쿠키를 사용
                {skipAuth: true, silent: true, loading: false, preventDuplicate: false},
            )
            .then((res) => {
                const tokens = res.data?.data || {};
                if (!tokens.accessToken) throw new Error('No accessToken in refresh response');
                setTokens(tokens);
                return tokens.accessToken;
            })
            .finally(() => {
                refreshPromise = null;
            });
    }
    return refreshPromise;
};

// ---------------------------------------------------------------------------
// 인터셉터
// ---------------------------------------------------------------------------
http.interceptors.request.use((config) => {
    if (!config.skipAuth) {
        const token = getAccessToken();
        if (token) config.headers.Authorization = `Bearer ${token}`;
    }
    addPending(config); // 중복 요청이면 ApiError(isDuplicate) throw
    startLoading(config);
    return config;
});

http.interceptors.response.use(
    (response) => {
        const {config, data: body} = response;
        finalize(config);

        // 업무 에러: HTTP 200 이지만 code 가 성공이 아닌 경우
        if (isStandardBody(body) && !isSuccessCode(body.code)) {
            const error = new ApiError({
                message: body.message || ERROR_MESSAGES.DEFAULT,
                status: response.status,
                code: body.code,
                data: body.data ?? null,
            });
            notify(error, config);
            return Promise.reject(error);
        }
        return response;
    },
    async (error) => {
        // 요청 인터셉터에서 던진 에러 (중복 요청 등)
        if (error instanceof ApiError) return Promise.reject(error);

        const {config} = error;
        finalize(config);

        const status = error.response?.status;

        // 401: 토큰 재발급 후 재시도
        if (status === 401 && config && !config._retry && !config.skipAuth && !isAuthUrl(config.url)) {
            config._retry = true;
            try {
                const newToken = await refreshAccessToken();
                config.headers.Authorization = `Bearer ${newToken}`;
                return http(config);
            } catch {
                const expired = new ApiError({message: ERROR_MESSAGES.SESSION_EXPIRED, status: 401, cause: error});
                expired.handled = true; // 로그인 화면 이동으로 처리
                handleAuthFailure();
                return Promise.reject(expired);
            }
        }

        const apiError = await toApiError(error);

        // 재시도 후에도 401 → 세션 종료
        if (status === 401 && config?._retry) {
            apiError.handled = true;
            handleAuthFailure();
            return Promise.reject(apiError);
        }

        notify(apiError, config);
        return Promise.reject(apiError);
    },
);

// ---------------------------------------------------------------------------
// 요청 헬퍼 (표준 응답의 data 만 반환)
// ---------------------------------------------------------------------------
const unwrap = (response, config = {}) => {
    if (config.raw) return response;
    return isStandardBody(response.data) ? response.data.data : response.data;
};

/**
 * @typedef {import('axios').AxiosRequestConfig & import('@/types').RequestOptions} RequestConfig
 */
export const request = {
    /** @param {string} url @param {Object} [params] @param {RequestConfig} [config] */
    get: (url, params, config = {}) => http.get(url, {params, ...config}).then((r) => unwrap(r, config)),

    /** @param {string} url @param {*} [data] @param {RequestConfig} [config] */
    post: (url, data, config = {}) => http.post(url, data, config).then((r) => unwrap(r, config)),

    /** @param {string} url @param {*} [data] @param {RequestConfig} [config] */
    put: (url, data, config = {}) => http.put(url, data, config).then((r) => unwrap(r, config)),

    /** @param {string} url @param {*} [data] @param {RequestConfig} [config] */
    patch: (url, data, config = {}) => http.patch(url, data, config).then((r) => unwrap(r, config)),

    /** body 가 필요하면 config.data 사용 @param {string} url @param {Object} [params] @param {RequestConfig} [config] */
    delete: (url, params, config = {}) => http.delete(url, {params, ...config}).then((r) => unwrap(r, config)),

    /**
     * multipart 업로드
     * @param {string} url
     * @param {FormData|Object} data - Object 면 FormData 로 변환 (File[] 은 같은 key 로 append)
     * @param {RequestConfig & {onProgress?: (percent: number) => void}} [config]
     */
    upload: (url, data, {onProgress, ...config} = {}) => {
        const formData = data instanceof FormData ? data : toFormData(data);
        return http
            .post(url, formData, {
                timeout: 0,
                headers: {'Content-Type': 'multipart/form-data'},
                onUploadProgress: onProgress
                    ? (e) => e.total && onProgress(Math.round((e.loaded / e.total) * 100))
                    : undefined,
                ...config,
            })
            .then((r) => unwrap(r, config));
    },

    /**
     * 파일 다운로드 (blob + Content-Disposition 파일명 파싱)
     *  ※ 서버 CORS 설정에 Access-Control-Expose-Headers: Content-Disposition 이 필요합니다.
     * @param {string} url
     * @param {Object} [params]
     * @param {RequestConfig & {filename?: string}} [config]
     * @returns {Promise<string>} 저장된 파일명
     */
    download: async (url, params, {filename, method = 'get', ...config} = {}) => {
        const response = await http.request({url, method, params, responseType: 'blob', timeout: 0, ...config});
        const blob = response.data;

        // 200 + JSON 에러 응답 처리
        if (blob.type?.includes('application/json')) {
            const body = await blobToJson(blob);
            if (body && !isSuccessCode(body.code)) {
                const error = new ApiError({message: body.message || ERROR_MESSAGES.DEFAULT, code: body.code});
                notify(error, config);
                throw error;
            }
        }

        const name = parseFilename(response.headers['content-disposition'], filename || 'download');
        saveBlob(blob, name);
        return name;
    },
};

/** 객체 → FormData (배열은 같은 key 로 반복 append, 객체는 JSON Blob) */
export const toFormData = (data = {}) => {
    const formData = new FormData();
    Object.entries(data).forEach(([key, value]) => {
        if (value === undefined || value === null) return;
        if (Array.isArray(value)) {
            value.forEach((v) => formData.append(key, v));
        } else if (value instanceof Blob) {
            formData.append(key, value);
        } else if (typeof value === 'object') {
            formData.append(key, new Blob([JSON.stringify(value)], {type: 'application/json'}));
        } else {
            formData.append(key, value);
        }
    });
    return formData;
};

export default http;
