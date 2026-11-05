import {computed, ref, watch} from 'vue';
import {defineStore} from 'pinia';
import {local} from '@/utils/storage';

/**
 * 앱 전역 UI 상태
 *  - 전역 로딩(카운터 방식: 동시 요청이 모두 끝나야 해제)
 *  - 사이드바 열림/축소(rail), 테마(light/dark) → localStorage 영속화
 */
export const useAppStore = defineStore('app', () => {
    // ---------------- 전역 로딩 ----------------
    const loadingCount = ref(0);
    const isLoading = computed(() => loadingCount.value > 0);

    const startLoading = () => {
        loadingCount.value += 1;
    };
    const stopLoading = () => {
        loadingCount.value = Math.max(0, loadingCount.value - 1);
    };
    const resetLoading = () => {
        loadingCount.value = 0;
    };

    // ---------------- 사이드바 ----------------
    const drawer = ref(true); // 모바일: 열림/닫힘
    const rail = ref(local.get('sidebar_rail', false)); // PC: 아이콘만 표시

    const toggleDrawer = () => {
        drawer.value = !drawer.value;
    };
    const toggleRail = () => {
        rail.value = !rail.value;
    };

    // ---------------- 테마 ----------------
    const theme = ref(local.get('theme', 'light'));
    const isDark = computed(() => theme.value === 'dark');
    const toggleTheme = () => {
        theme.value = isDark.value ? 'light' : 'dark';
    };

    watch(rail, (v) => local.set('sidebar_rail', v));
    watch(theme, (v) => local.set('theme', v));

    return {
        loadingCount,
        isLoading,
        startLoading,
        stopLoading,
        resetLoading,
        drawer,
        rail,
        toggleDrawer,
        toggleRail,
        theme,
        isDark,
        toggleTheme,
    };
});
