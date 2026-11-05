<template>
    <div class="base-pagination">
        <div class="base-pagination__total">
            총 <strong>{{ formatNumber(totalCount, {fallback: '0'}) }}</strong
            >건
        </div>

        <v-pagination
            :model-value="page"
            :length="totalPages"
            :total-visible="mobile ? 3 : totalVisible"
            density="comfortable"
            size="small"
            rounded="circle"
            active-color="primary"
            show-first-last-page
            class="base-pagination__pages"
            @update:model-value="emit('update:page', $event)"
        />

        <div class="base-pagination__size">
            <v-select
                v-if="!hideSize"
                :model-value="size"
                :items="sizeItems"
                item-title="label"
                item-value="value"
                density="compact"
                hide-details
                aria-label="페이지당 건수"
                @update:model-value="emit('update:size', $event)"
            />
        </div>
    </div>
</template>

<script setup>
/**
 * 페이지네이션 (총 건수 + 페이지 + 페이지 크기)
 *  <BasePagination :page="page" :size="size" :total-count="total" @update:page="..." @update:size="..." />
 *  (BaseDataTable 에 내장되어 있으므로 목록이 아닌 곳(카드 리스트 등)에서 단독 사용)
 */
import {computed} from 'vue';
import {useDisplay} from 'vuetify';
import {PAGINATION} from '@/config';
import {formatNumber} from '@/utils/format';

defineOptions({name: 'BasePagination'});

const props = defineProps({
    page: {type: Number, default: PAGINATION.PAGE_START},
    size: {type: Number, default: PAGINATION.DEFAULT_SIZE},
    totalCount: {type: Number, default: 0},
    sizeOptions: {type: Array, default: () => PAGINATION.SIZE_OPTIONS},
    totalVisible: {type: Number, default: 7},
    hideSize: {type: Boolean, default: false},
});

const emit = defineEmits(['update:page', 'update:size']);
const {mobile} = useDisplay();

const totalPages = computed(() => Math.max(1, Math.ceil(props.totalCount / props.size)));
const sizeItems = computed(() => props.sizeOptions.map((v) => ({label: `${v}개씩`, value: v})));
</script>

<style scoped lang="scss">
.base-pagination {
    display: grid;
    grid-template-columns: 1fr auto 1fr;
    gap: $spacer-2;
    align-items: center;
    padding: $spacer-3 0;

    &__total {
        font-size: $font-size-sm;
        color: rgba(var(--v-theme-on-surface), 0.7);
    }

    &__size {
        display: flex;
        justify-content: flex-end;

        :deep(.v-select) {
            max-width: 120px;
        }
    }

    @include mobile {
        grid-template-columns: 1fr auto;

        &__pages {
            grid-row: 2;
            grid-column: 1 / -1;
        }
    }
}
</style>
