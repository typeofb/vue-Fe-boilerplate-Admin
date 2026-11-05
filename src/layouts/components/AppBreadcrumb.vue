<template>
    <v-breadcrumbs v-if="items.length > 1" :items="items" density="compact" class="app-breadcrumb">
        <template #prepend>
            <v-icon icon="mdi-home-outline" size="small" />
        </template>
        <template #divider>
            <v-icon icon="mdi-chevron-right" size="x-small" />
        </template>
    </v-breadcrumbs>
</template>

<script setup>
/** 브레드크럼 (route.matched 의 meta.title 기반 자동 생성) */
import {computed} from 'vue';
import {useMenu} from '@/composables/useMenu';

defineOptions({name: 'AppBreadcrumb'});

const {breadcrumbs} = useMenu();
const items = computed(() => breadcrumbs.value);
</script>

<style scoped lang="scss">
.app-breadcrumb {
    padding: 0 0 $spacer-3;
    font-size: $font-size-sm;
    color: rgba(var(--v-theme-on-surface), 0.6);
}
</style>
