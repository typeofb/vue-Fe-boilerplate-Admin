import {computed, ref} from 'vue';
import {defineStore} from 'pinia';
import {authApi, cancelAllRequests} from '@/api';
import {accessToken, clearTokens, setTokens} from '@/utils/token';
import {useCodeStore} from './code.store';

/**
 * 로그인 사용자 / 권한 / 토큰
 *
 *  - roles       : 화면(메뉴) 접근 제어   → route meta.roles: ['ADMIN']
 *  - permissions : 기능(버튼) 단위 제어   → route meta.permission / v-permission / <BaseButton permission>
 */
export const useUserStore = defineStore('user', () => {
    /** @type {import('vue').Ref<import('@/types').AuthUser|null>} */
    const user = ref(null);

    const isLoggedIn = computed(() => !!accessToken.value);
    const roles = computed(() => user.value?.roles ?? []);
    const permissions = computed(() => user.value?.permissions ?? []);

    /** 지정 역할 중 하나라도 가지고 있으면 true (미지정 시 true) */
    const hasRole = (required) => {
        const list = [].concat(required ?? []).filter(Boolean);
        return list.length === 0 || list.some((r) => roles.value.includes(r));
    };

    /** 지정 권한 중 하나라도 가지고 있으면 true (미지정 시 true) */
    const hasPermission = (required) => {
        const list = [].concat(required ?? []).filter(Boolean);
        return list.length === 0 || list.some((p) => permissions.value.includes(p));
    };

    /** 라우트 meta 기준 접근 가능 여부 */
    const canAccess = (meta = {}) => hasRole(meta.roles) && hasPermission(meta.permission);

    // ---------------- actions ----------------
    let fetchMePromise = null;

    /** 내 정보 조회 (동시 호출 시 1회만 요청) */
    const fetchMe = () => {
        if (!fetchMePromise) {
            fetchMePromise = authApi
                .me()
                .then((data) => {
                    user.value = data;
                    return true;
                })
                .catch(() => false)
                .finally(() => {
                    fetchMePromise = null;
                });
        }
        return fetchMePromise;
    };

    /** 라우터 가드용: 토큰은 있는데 사용자 정보가 없으면(새로고침) 조회 */
    const ensureUser = async () => {
        if (!isLoggedIn.value) return false;
        if (user.value) return true;
        return fetchMe();
    };

    /** @param {{loginId: string, password: string}} payload */
    const login = async (payload) => {
        reset();
        const tokens = await authApi.login(payload);
        setTokens(tokens);
        const ok = await fetchMe();
        if (!ok) {
            reset();
            throw new Error('사용자 정보를 불러오지 못했습니다.');
        }
        return user.value;
    };

    /** 로컬 상태만 초기화 (서버 호출 없음) */
    const reset = () => {
        cancelAllRequests();
        clearTokens();
        user.value = null;
        useCodeStore().clear();
    };

    const logout = async () => {
        if (isLoggedIn.value) {
            await authApi.logout().catch(() => null);
        }
        reset();
    };

    return {
        user,
        isLoggedIn,
        roles,
        permissions,
        hasRole,
        hasPermission,
        canAccess,
        fetchMe,
        ensureUser,
        login,
        logout,
        reset,
    };
});
