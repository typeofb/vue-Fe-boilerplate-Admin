import {ref} from 'vue';
import Cookies from 'js-cookie';
import {STORAGE_PREFIX} from '@/config';

/**
 * 토큰 저장 전략
 *  - accessToken : 쿠키 (js-cookie, secure + SameSite=Lax). 새로고침 후에도 유지.
 *  - refreshToken: 서버가 HttpOnly 쿠키로 내려주는 방식을 권장합니다. (JS 에서 접근 불가 → XSS 에 안전)
 *                  서버가 응답 body 로 내려주는 경우에만 아래 쿠키에 저장합니다.
 *  - localStorage 는 XSS 시 탈취가 쉬워 토큰 저장에 사용하지 않습니다.
 *
 * accessToken 은 반응형 ref 로도 보관하여 스토어/가드가 로그인 여부를 즉시 알 수 있게 합니다.
 * (refresh 로 토큰이 바뀌어도 스토어가 자동으로 반영)
 */
const ACCESS_KEY = `${STORAGE_PREFIX}_access_token`;
const REFRESH_KEY = `${STORAGE_PREFIX}_refresh_token`;

const cookieOptions = {
    secure: import.meta.env.PROD,
    sameSite: 'Lax',
    path: '/',
};

export const accessToken = ref(Cookies.get(ACCESS_KEY) || null);

export const getAccessToken = () => accessToken.value;
export const getRefreshToken = () => Cookies.get(REFRESH_KEY) || null;

/** @param {{accessToken?: string, refreshToken?: string}} tokens */
export const setTokens = ({accessToken: access, refreshToken: refresh} = {}) => {
    if (access) {
        accessToken.value = access;
        Cookies.set(ACCESS_KEY, access, cookieOptions);
    }
    if (refresh) {
        Cookies.set(REFRESH_KEY, refresh, cookieOptions);
    }
};

export const clearTokens = () => {
    accessToken.value = null;
    Cookies.remove(ACCESS_KEY, {path: '/'});
    Cookies.remove(REFRESH_KEY, {path: '/'});
};
