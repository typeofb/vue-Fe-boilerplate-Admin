import {ROLES} from '@/config';

/**
 * 라우트 정의 (= 메뉴 정의)
 *
 * meta
 *  - title        : 페이지 타이틀 / 메뉴명 / 브레드크럼
 *  - icon         : 메뉴 아이콘 (mdi)
 *  - public       : true 면 비로그인 접근 허용 (기본은 로그인 필요)
 *  - guestOnly    : 로그인 상태에서 접근 시 홈으로 (로그인 화면 등)
 *  - roles        : 접근 가능 역할 (하나라도 있으면 허용)  예) [ROLES.ADMIN]
 *  - permission   : 접근 필요 권한 코드                    예) 'USER_VIEW'
 *  - hidden       : 메뉴에서 숨김 (등록/상세 화면)
 *  - activeMenu   : hidden 화면에서 활성화할 메뉴 경로
 *  - keepAlive    : 화면 캐싱 (컴포넌트 name 과 route name 을 동일하게)
 *
 * 규칙
 *  - route name: PascalCase (컴포넌트 name 과 동일)  / path: kebab-case
 *  - 화면 컴포넌트: views/{domain}/{Name}View.vue, 반드시 lazy import
 *  - 그룹 메뉴는 component 없이 children 만 둡니다.
 */
export default [
    {
        path: '/',
        name: 'DefaultLayout',
        component: () => import('@/layouts/DefaultLayout.vue'),
        redirect: {name: 'Dashboard'},
        children: [
            {
                path: 'dashboard',
                name: 'Dashboard',
                component: () => import('@/views/dashboard/DashboardView.vue'),
                meta: {title: '대시보드', icon: 'mdi-view-dashboard-outline'},
            },
            {
                path: 'user',
                meta: {title: '회원관리', icon: 'mdi-account-group-outline'},
                redirect: {name: 'UserList'},
                children: [
                    {
                        path: 'list',
                        name: 'UserList',
                        component: () => import('@/views/user/UserListView.vue'),
                        meta: {title: '회원 목록', permission: 'USER_VIEW', keepAlive: true},
                    },
                    {
                        path: 'form/:id?',
                        name: 'UserForm',
                        component: () => import('@/views/user/UserFormView.vue'),
                        meta: {
                            title: '회원 등록/수정',
                            permission: 'USER_EDIT',
                            hidden: true,
                            activeMenu: '/user/list',
                        },
                    },
                ],
            },
            {
                path: 'system',
                meta: {title: '시스템', icon: 'mdi-cog-outline', roles: [ROLES.ADMIN]},
                redirect: {name: 'ComponentSample'},
                children: [
                    {
                        path: 'components',
                        name: 'ComponentSample',
                        component: () => import('@/views/sample/ComponentSampleView.vue'),
                        meta: {title: '공통 컴포넌트', roles: [ROLES.ADMIN]},
                    },
                ],
            },
        ],
    },
    {
        path: '/auth',
        component: () => import('@/layouts/AuthLayout.vue'),
        meta: {public: true},
        children: [
            {
                path: 'login',
                name: 'Login',
                component: () => import('@/views/auth/LoginView.vue'),
                meta: {title: '로그인', public: true, guestOnly: true},
            },
        ],
    },
    {
        path: '/error',
        component: () => import('@/layouts/BlankLayout.vue'),
        meta: {public: true},
        children: [
            {
                path: '403',
                name: 'Forbidden',
                component: () => import('@/views/error/ForbiddenView.vue'),
                meta: {title: '접근 권한 없음', public: true},
            },
            {
                path: '500',
                name: 'ServerError',
                component: () => import('@/views/error/ServerErrorView.vue'),
                meta: {title: '오류', public: true},
            },
        ],
    },
    {
        path: '/:pathMatch(.*)*',
        component: () => import('@/layouts/BlankLayout.vue'),
        meta: {public: true},
        children: [
            {
                path: '',
                name: 'NotFound',
                component: () => import('@/views/error/NotFoundView.vue'),
                meta: {title: '페이지를 찾을 수 없음', public: true},
            },
        ],
    },
];
