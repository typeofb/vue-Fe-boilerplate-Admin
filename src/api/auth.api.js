import {AUTH_API} from '@/config';
import {request} from './http';

/**
 * 인증 API
 *  - 응답 data 형식은 백엔드와 합의 후 수정하세요.
 */
export const authApi = {
    /**
     * @param {{loginId: string, password: string}} payload
     * @returns {Promise<{accessToken: string, refreshToken?: string}>}
     */
    login: (payload) => request.post(AUTH_API.LOGIN, payload, {skipAuth: true}),

    logout: () => request.post(AUTH_API.LOGOUT, null, {silent: true, loading: false}),

    /** @returns {Promise<import('@/types').AuthUser>} */
    me: () => request.get(AUTH_API.ME, null, {loading: false}),
};
