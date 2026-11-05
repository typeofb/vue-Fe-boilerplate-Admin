import {APP_TITLE} from '@/config';
import {cancelRouteRequests} from '@/api/request-manager';
import {useUserStore} from '@/stores/user.store';
import {useDialogStore} from '@/stores/dialog.store';

/**
 * 라우터 가드
 *  1) 비로그인 → 로그인 화면 (redirect 쿼리로 원래 경로 보존)
 *  2) 새로고침 → 토큰으로 사용자 정보 복원
 *  3) 권한(roles / permission) 없음 → 403
 *  4) 페이지 타이틀 자동 설정
 */
export const setupGuards = (router) => {
    router.beforeEach(async (to, from) => {
        // 이전 화면의 목록 조회 등 불필요해진 요청 취소
        if (from.name) cancelRouteRequests();

        const userStore = useUserStore();
        const isPublic = to.matched.some((r) => r.meta?.public);

        if (isPublic) {
            if (to.meta.guestOnly && userStore.isLoggedIn && (await userStore.ensureUser())) {
                return {path: '/'};
            }
            return true;
        }

        // 1) 로그인 필요
        const loginRoute = {name: 'Login', query: to.fullPath !== '/' ? {redirect: to.fullPath} : undefined};
        if (!userStore.isLoggedIn) return loginRoute;

        // 2) 사용자 정보 복원
        if (!(await userStore.ensureUser())) {
            userStore.reset();
            return loginRoute;
        }

        // 3) 권한 (부모 그룹 meta 까지 모두 검사)
        const allowed = to.matched.every((r) => userStore.canAccess(r.meta));
        if (!allowed) return {name: 'Forbidden', query: {from: to.fullPath}};

        return true;
    });

    router.afterEach((to) => {
        const title = [...to.matched].reverse().find((r) => r.meta?.title)?.meta.title;
        document.title = title ? `${title} | ${APP_TITLE}` : APP_TITLE;

        // 화면 이동 시 열려 있던 함수형 다이얼로그 정리
        useDialogStore().clear();
    });

    // 배포 후 이전 청크 파일을 찾지 못하는 경우 (lazy import 실패) → 새로고침 1회
    router.onError((error, to) => {
        const isChunkError =
            /Failed to fetch dynamically imported module|Importing a module script failed|error loading dynamically imported module/i.test(
                error?.message || '',
            );
        if (isChunkError && !sessionStorage.getItem('chunk-reload')) {
            sessionStorage.setItem('chunk-reload', '1');
            window.location.assign(to.fullPath);
            return;
        }
        sessionStorage.removeItem('chunk-reload');
        console.error('[router]', error);
        router.replace({name: 'ServerError'});
    });

    router.isReady().then(() => sessionStorage.removeItem('chunk-reload'));
};
