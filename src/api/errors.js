/**
 * API 에러 표준화
 *  - 모든 API 실패는 ApiError 로 reject 됩니다. (axios 에러, 업무 에러(code != 성공) 모두)
 *
 *  try { await userApi.create(form) }
 *  catch (e) { if (e.code === 'DUPLICATE_LOGIN_ID') ... }
 */
export class ApiError extends Error {
    /**
     * @param {Object} params
     * @param {string} params.message
     * @param {number|null} [params.status]   - HTTP status
     * @param {string|number|null} [params.code] - 서버 업무 코드
     * @param {*} [params.data]
     * @param {*} [params.cause]
     * @param {boolean} [params.isCanceled]   - AbortController 로 취소됨
     * @param {boolean} [params.isDuplicate]  - 중복 요청 차단됨
     * @param {boolean} [params.isNetwork]    - 네트워크/타임아웃
     */
    constructor({
        message,
        status = null,
        code = null,
        data = null,
        cause = null,
        isCanceled = false,
        isDuplicate = false,
        isNetwork = false,
    }) {
        super(message);
        this.name = 'ApiError';
        this.status = status;
        this.code = code;
        this.data = data;
        this.cause = cause;
        this.isCanceled = isCanceled;
        this.isDuplicate = isDuplicate;
        this.isNetwork = isNetwork;
        /** 공통 처리(토스트 등)가 이미 되었는지 - 전역 에러 핸들러에서 중복 노출 방지 */
        this.handled = false;
    }
}

export const ERROR_MESSAGES = {
    DEFAULT: '요청 처리 중 오류가 발생했습니다.',
    NETWORK: '네트워크 연결을 확인해 주세요.',
    TIMEOUT: '요청 시간이 초과되었습니다. 잠시 후 다시 시도해 주세요.',
    400: '잘못된 요청입니다.',
    401: '인증 정보가 올바르지 않습니다.',
    403: '접근 권한이 없습니다.',
    404: '요청한 정보를 찾을 수 없습니다.',
    409: '이미 처리되었거나 충돌이 발생했습니다.',
    413: '업로드 가능한 용량을 초과했습니다.',
    SERVER: '서버 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.',
    SESSION_EXPIRED: '로그인 세션이 만료되었습니다. 다시 로그인해 주세요.',
};
