<template>
    <div class="base-empty" :class="{'base-empty--compact': compact}">
        <v-icon :icon="icon" :size="compact ? 32 : 48" class="base-empty__icon" />
        <p class="base-empty__text">
            <slot>{{ message }}</slot>
        </p>
        <div v-if="$slots.actions" class="mt-3">
            <slot name="actions" />
        </div>
    </div>
</template>

<script setup>
/**
 * 빈 상태 표시 (목록 없음, 검색 결과 없음 등)
 *  <BaseEmpty message="검색 결과가 없습니다." />
 */
defineOptions({name: 'BaseEmpty'});

defineProps({
    message: {type: String, default: '데이터가 없습니다.'},
    icon: {type: String, default: 'mdi-database-off-outline'},
    compact: {type: Boolean, default: false},
});
</script>

<style scoped lang="scss">
.base-empty {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: $spacer-8 $spacer-4;
    color: rgba(var(--v-theme-on-surface), 0.5);

    &--compact {
        padding: $spacer-4;
    }

    &__text {
        margin-top: $spacer-2;
        font-size: $font-size-sm;
    }
}
</style>
