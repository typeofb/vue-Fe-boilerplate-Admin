<template>
    <v-app>
        <router-view />

        <!-- 전역 UI: 함수형 Alert/Confirm, 전역 로딩 -->
        <DialogHost />
        <GlobalLoading />
    </v-app>
</template>

<script setup>
import {watchEffect} from 'vue';
import {useTheme} from 'vuetify';
import {useAppStore} from '@/stores/app.store';
import DialogHost from '@/components/feedback/DialogHost.vue';
import GlobalLoading from '@/components/feedback/GlobalLoading.vue';

const appStore = useAppStore();
const theme = useTheme();

// 다크모드: app store 의 theme 값을 Vuetify 테마에 반영
watchEffect(() => {
    theme.global.name.value = appStore.theme;
});
</script>
