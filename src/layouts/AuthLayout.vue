<template>
    <v-main class="auth-layout">
        <div class="auth-layout__inner">
            <router-view />
        </div>
    </v-main>
</template>

<script setup>
/**
 * 로그인 레이아웃 (로그인, 비밀번호 찾기 등 비로그인 화면)
 */
defineOptions({name: 'AuthLayout'});
</script>

<style scoped lang="scss">
.auth-layout {
    min-height: 100vh;
    background:
        radial-gradient(circle at 20% 20%, rgba(var(--v-theme-primary), 0.12), transparent 40%),
        rgb(var(--v-theme-background));

    &__inner {
        @include flex-center;

        min-height: 100vh;
        padding: $spacer-4;
    }
}
</style>
