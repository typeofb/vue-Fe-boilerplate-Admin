<template>
    <div class="error-page">
        <div class="error-page__code">{{ code }}</div>
        <h1 class="error-page__title">{{ title }}</h1>
        <p class="error-page__desc">
            <slot>{{ description }}</slot>
        </p>
        <div class="error-page__actions">
            <v-btn variant="outlined" prepend-icon="mdi-arrow-left" @click="goBack">이전 화면</v-btn>
            <v-btn color="primary" prepend-icon="mdi-home-outline" :to="{path: '/'}">홈으로</v-btn>
        </div>
    </div>
</template>

<script setup>
/** 에러 페이지 공통 틀 (403 / 404 / 500) */
import {useRouter} from 'vue-router';

defineOptions({name: 'ErrorTemplate'});

defineProps({
    code: {type: [String, Number], required: true},
    title: {type: String, required: true},
    description: {type: String, default: ''},
});

const router = useRouter();
const goBack = () => (window.history.length > 1 ? router.back() : router.replace('/'));
</script>

<style scoped lang="scss">
.error-page {
    @include flex-center;

    flex-direction: column;
    min-height: 100vh;
    padding: $spacer-6;
    text-align: center;

    &__code {
        font-size: 6rem;
        font-weight: 800;
        line-height: 1;
        color: rgb(var(--v-theme-primary));
        opacity: 0.85;
    }

    &__title {
        margin-top: $spacer-4;
        font-size: $font-size-2xl;
        font-weight: $font-weight-bold;
    }

    &__desc {
        margin-top: $spacer-2;
        color: rgba(var(--v-theme-on-surface), 0.6);
        white-space: pre-line;
    }

    &__actions {
        display: flex;
        gap: $spacer-2;
        margin-top: $spacer-6;
    }
}
</style>
