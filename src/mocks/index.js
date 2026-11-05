import axios, {AxiosError, CanceledError} from 'axios';
import {handlers} from './handlers';

/**
 * Mock API (axios adapter 교체 방식)
 *  - VITE_USE_MOCK=true 일 때 main.js 에서 setupMock(http) 호출
 *  - handlers 에 없는 요청은 실제 네트워크로 전달
 *  - 응답 형식/에러/지연/취소(AbortController)까지 실제와 동일하게 동작
 */
const DELAY = 300;

const matchHandler = (method, url) => {
    const path = url.split('?')[0];
    for (const h of handlers) {
        if (h.method !== method) continue;
        const keys = [];
        const pattern = new RegExp(
            `^${h.path.replace(/:(\w+)/g, (_, k) => {
                keys.push(k);
                return '([^/]+)';
            })}$`,
        );
        const m = path.match(pattern);
        if (m) {
            const params = Object.fromEntries(keys.map((k, i) => [k, decodeURIComponent(m[i + 1])]));
            return {handler: h, params};
        }
    }
    return null;
};

const parseBody = (data) => {
    if (!data || typeof data !== 'string') return data;
    try {
        return JSON.parse(data);
    } catch {
        return data;
    }
};

const getHeader = (headers, name) => headers?.get?.(name) ?? headers?.[name] ?? headers?.[name.toLowerCase()];

export const setupMock = (http) => {
    const realAdapter = axios.getAdapter(http.defaults.adapter);

    http.defaults.adapter = (config) => {
        const method = (config.method || 'get').toLowerCase();
        const matched = matchHandler(method, config.url || '');
        if (!matched) return realAdapter(config);

        return new Promise((resolve, reject) => {
            const timer = setTimeout(async () => {
                try {
                    const result = await matched.handler.handle({
                        params: matched.params,
                        query: config.params || {},
                        body: parseBody(config.data),
                        token: (getHeader(config.headers, 'Authorization') || '').replace(/^Bearer\s+/i, ''),
                    });
                    const {status = 200, data, headers = {}} = result;
                    const response = {data, status, statusText: String(status), headers, config, request: {}};

                    if (status >= 200 && status < 300) {
                        resolve(response);
                    } else {
                        reject(
                            new AxiosError(
                                `Request failed with status code ${status}`,
                                status >= 500 ? AxiosError.ERR_BAD_RESPONSE : AxiosError.ERR_BAD_REQUEST,
                                config,
                                {},
                                response,
                            ),
                        );
                    }
                } catch (e) {
                    reject(e);
                }
            }, DELAY);

            config.signal?.addEventListener?.('abort', () => {
                clearTimeout(timer);
                reject(new CanceledError(null, null, config));
            });
        });
    };

    console.warn('[mock] Mock API 사용 중 (VITE_USE_MOCK=true)');
};
