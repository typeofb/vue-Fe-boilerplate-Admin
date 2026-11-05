<template>
    <footer class="app-footer">
        <span>© {{ year }} {{ APP_TITLE }}</span>
        <span v-if="version" class="app-footer__version">v{{ version }}</span>
    </footer>
</template>

<script setup>
import {APP_TITLE} from '@/config';

defineOptions({name: 'AppFooter'});

const year = new Date().getFullYear();
const version = import.meta.env.VITE_APP_VERSION || '';
</script>

<style scoped lang="scss">
.app-footer {
    display: flex;
    gap: $spacer-2;
    align-items: center;
    justify-content: center;
    height: 48px;
    font-size: $font-size-xs;
    color: rgba(var(--v-theme-on-surface), 0.5);

    &__version {
        opacity: 0.8;
    }
}
</style>
