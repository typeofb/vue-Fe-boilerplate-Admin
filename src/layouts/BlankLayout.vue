<template>
    <v-main class="blank-layout">
        <router-view />
    </v-main>
</template>

<script setup>
/**
 * 빈 레이아웃 (에러 페이지, 팝업 창, 인쇄용 화면 등)
 */
defineOptions({name: 'BlankLayout'});
</script>

<style scoped lang="scss">
.blank-layout {
    min-height: 100vh;
    background: rgb(var(--v-theme-background));
}
</style>
