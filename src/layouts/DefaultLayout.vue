<template>
    <AppSidebar />
    <AppHeader />

    <v-main class="default-layout">
        <div class="default-layout__content">
            <AppBreadcrumb />

            <router-view v-slot="{Component, route: viewRoute}">
                <!-- meta.keepAlive: true 인 화면은 캐싱 (목록 → 상세 → 목록 복귀 시 검색조건 유지) -->
                <keep-alive :include="cachedViews">
                    <component :is="Component" :key="viewRoute.meta.keepAlive ? viewRoute.name : viewRoute.fullPath" />
                </keep-alive>
            </router-view>
        </div>
        <AppFooter />
    </v-main>
</template>

<script setup>
/**
 * 기본 레이아웃 (Header + Sidebar + Content + Footer)
 *  - 인증이 필요한 업무 화면은 모두 이 레이아웃의 children 으로 등록 (router/routes.js)
 */
import {computed} from 'vue';
import {useRouter} from 'vue-router';
import {IDLE_TIMEOUT_MIN} from '@/config';
import {useIdleTimeout} from '@/composables/useIdleTimeout';
import {useUserStore} from '@/stores/user.store';
import {alert} from '@/utils/dialog';
import toast from '@/utils/toast';
import AppHeader from './components/AppHeader.vue';
import AppSidebar from './components/AppSidebar.vue';
import AppFooter from './components/AppFooter.vue';
import AppBreadcrumb from './components/AppBreadcrumb.vue';

defineOptions({name: 'DefaultLayout'});

const router = useRouter();
const userStore = useUserStore();

/** keep-alive 대상: 컴포넌트 name 과 route name 을 동일하게 맞춰 주세요. */
const cachedViews = computed(() =>
    router
        .getRoutes()
        .filter((r) => r.meta?.keepAlive && r.name)
        .map((r) => String(r.name)),
);

// 세션 타임아웃 (VITE_IDLE_TIMEOUT_MIN, 0 이면 미사용)
if (IDLE_TIMEOUT_MIN > 0) {
    useIdleTimeout({
        timeoutMin: IDLE_TIMEOUT_MIN,
        warnBeforeSec: 60,
        onWarn: (sec) => toast.warning(`${sec}초 후 자동 로그아웃됩니다. 계속 사용하시려면 화면을 움직여 주세요.`),
        onTimeout: async () => {
            await userStore.logout();
            await router.replace({name: 'Login', query: {redirect: router.currentRoute.value.fullPath}});
            alert(`${IDLE_TIMEOUT_MIN}분 동안 사용하지 않아 자동 로그아웃되었습니다.`);
        },
    });
}
</script>

<style scoped lang="scss">
.default-layout {
    min-height: 100vh;
    background: rgb(var(--v-theme-background));

    &__content {
        max-width: $content-max-width;
        min-height: calc(100vh - #{$header-height} - 48px);
        padding: $content-padding;
        margin: 0 auto;

        @include mobile {
            padding: $content-padding-mobile;
        }
    }
}
</style>
