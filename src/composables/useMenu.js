import {computed} from 'vue';
import {useRoute, useRouter} from 'vue-router';
import {useUserStore} from '@/stores/user.store';

/**
 * 라우트 정의 → 사이드바 메뉴 / 브레드크럼
 *
 *  - 메뉴는 router/routes.js 의 meta 로부터 생성됩니다. (메뉴 정의를 한 곳에서 관리)
 *      meta.title  : 메뉴명 / 페이지 타이틀
 *      meta.icon   : mdi 아이콘
 *      meta.hidden : 메뉴에서 숨김 (상세/등록 화면 등)
 *      meta.roles / meta.permission : 권한 없는 메뉴는 자동으로 숨김
 *      meta.activeMenu : 숨김 화면에서 활성화할 메뉴 경로 (예: 상세 → 목록 메뉴 활성)
 *
 *  - 서버에서 메뉴를 받는 경우: userStore.user.menus 등으로 필터 조건을 추가하거나
 *    buildMenus 의 입력을 서버 메뉴로 교체하세요.
 */
const joinPath = (parent, path) => {
    if (path.startsWith('/')) return path;
    return `${parent.replace(/\/$/, '')}/${path}`.replace(/\/+/g, '/');
};

const buildMenus = (routes, parentPath, canAccess) =>
    routes
        .filter((r) => r.meta?.title && !r.meta?.hidden && canAccess(r.meta))
        .map((r) => {
            const path = joinPath(parentPath, r.path);
            const isGroup = !!r.children?.length;
            const children = isGroup ? buildMenus(r.children, path, canAccess) : [];
            return {
                title: r.meta.title,
                icon: r.meta.icon,
                path,
                name: r.name,
                isGroup,
                children: children.length ? children : null,
            };
        })
        // 하위 메뉴가 모두 권한 없음으로 숨겨진 그룹은 제거
        .filter((m) => !m.isGroup || m.children);

export function useMenu() {
    const router = useRouter();
    const route = useRoute();
    const userStore = useUserStore();

    // canAccess 가 사용자 roles/permissions 를 읽으므로 로그인 사용자가 바뀌면 자동 재계산
    const menus = computed(() => {
        const layout = router.options.routes.find((r) => r.name === 'DefaultLayout');
        return layout ? buildMenus(layout.children || [], layout.path, userStore.canAccess) : [];
    });

    /** 현재 활성 메뉴 경로 */
    const activePath = computed(() => route.meta.activeMenu || route.path);

    const breadcrumbs = computed(() =>
        route.matched
            .filter((r) => r.meta?.title && r.name !== 'DefaultLayout')
            .map((r, i, arr) => ({
                title: r.meta.title,
                to: i < arr.length - 1 && r.components ? {path: r.path} : undefined,
                disabled: i === arr.length - 1,
            })),
    );

    return {menus, activePath, breadcrumbs};
}
