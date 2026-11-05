<template>
    <v-overlay
        :model-value="visible"
        persistent
        scrim="rgba(0, 0, 0, 0.15)"
        class="align-center justify-center"
        z-index="3000"
    >
        <v-progress-circular indeterminate color="primary" size="56" width="5" />
    </v-overlay>
</template>

<script setup>
/**
 * 전역 로딩 오버레이 (appStore.isLoading)
 *  - 짧은 요청(200ms 미만)은 깜빡임 방지를 위해 표시하지 않음
 */
import {onBeforeUnmount, ref, watch} from 'vue';
import {useAppStore} from '@/stores/app.store';

defineOptions({name: 'GlobalLoading'});

const DELAY = 200;
const appStore = useAppStore();
const visible = ref(false);
let timer = null;

watch(
    () => appStore.isLoading,
    (loading) => {
        clearTimeout(timer);
        if (loading) {
            timer = setTimeout(() => (visible.value = true), DELAY);
        } else {
            visible.value = false;
        }
    },
);

onBeforeUnmount(() => clearTimeout(timer));
</script>
