<template>
    <v-app-bar :height="56" flat border="b" class="app-header">
        <v-app-bar-nav-icon aria-label="메뉴 열기/접기" @click="onToggleMenu" />

        <v-app-bar-title class="app-header__title">{{ pageTitle }}</v-app-bar-title>

        <template #append>
            <v-btn
                :icon="appStore.isDark ? 'mdi-weather-sunny' : 'mdi-weather-night'"
                variant="text"
                :aria-label="appStore.isDark ? '라이트 모드' : '다크 모드'"
                @click="appStore.toggleTheme"
            />

            <v-menu location="bottom end">
                <template #activator="{props: menuProps}">
                    <v-btn v-bind="menuProps" variant="text" class="ml-1" append-icon="mdi-chevron-down">
                        <v-avatar size="28" color="primary" class="mr-2">
                            <span class="text-caption font-weight-bold">{{ initial }}</span>
                        </v-avatar>
                        <span class="d-none d-sm-inline">{{ userStore.user?.name }}</span>
                    </v-btn>
                </template>
                <v-list density="compact" min-width="200">
                    <v-list-item :subtitle="userStore.user?.loginId" :title="userStore.user?.name" />
                    <v-list-item>
                        <v-chip v-for="role in userStore.roles" :key="role" size="x-small" class="mr-1">
                            {{ role }}
                        </v-chip>
                    </v-list-item>
                    <v-divider class="my-1" />
                    <v-list-item prepend-icon="mdi-logout" title="로그아웃" @click="onLogout" />
                </v-list>
            </v-menu>
        </template>
    </v-app-bar>
</template>

<script setup>
import {computed} from 'vue';
import {useRoute, useRouter} from 'vue-router';
import {useDisplay} from 'vuetify';
import {useAppStore} from '@/stores/app.store';
import {useUserStore} from '@/stores/user.store';
import {confirm} from '@/utils/dialog';

defineOptions({name: 'AppHeader'});

const route = useRoute();
const router = useRouter();
const appStore = useAppStore();
const userStore = useUserStore();
const {mobile} = useDisplay();

const pageTitle = computed(() => route.meta.title || '');
const initial = computed(() => userStore.user?.name?.slice(0, 1) || '?');

// 모바일: 사이드바 열기/닫기, PC: 아이콘 모드 전환
const onToggleMenu = () => (mobile.value ? appStore.toggleDrawer() : appStore.toggleRail());

const onLogout = async () => {
    if (!(await confirm('로그아웃 하시겠습니까?'))) return;
    await userStore.logout();
    router.replace({name: 'Login'});
};
</script>

<style scoped lang="scss">
.app-header {
    &__title {
        font-size: $font-size-lg;
        font-weight: $font-weight-bold;
    }
}
</style>
