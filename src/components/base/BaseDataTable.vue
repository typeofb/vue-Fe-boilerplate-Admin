<template>
    <div class="base-data-table">
        <div v-if="$slots.toolbar || title" class="base-data-table__toolbar">
            <div class="text-subtitle-1 font-weight-bold">{{ title }}</div>
            <v-spacer />
            <slot name="toolbar" :selected="selected" />
        </div>

        <v-data-table-server
            v-bind="$attrs"
            :headers="headers"
            :items="items"
            :items-length="totalCount"
            :loading="loading"
            :page="page"
            :items-per-page="size"
            :sort-by="sortBy"
            :show-select="showSelect"
            :item-value="itemValue"
            :model-value="selected"
            :height="height"
            :fixed-header="!!height"
            :must-sort="false"
            hide-default-footer
            class="base-data-table__table"
            @update:sort-by="emit('update:sortBy', $event)"
            @update:model-value="emit('update:selected', $event)"
        >
            <template #no-data>
                <BaseEmpty :message="emptyText" compact />
            </template>
            <template #loading>
                <v-skeleton-loader type="table-row@5" />
            </template>
            <template v-for="(_, name) in $slots" #[name]="slotProps">
                <slot :name="name" v-bind="slotProps || {}" />
            </template>
        </v-data-table-server>

        <BasePagination
            v-if="!hidePagination"
            :page="page"
            :size="size"
            :total-count="totalCount"
            :size-options="sizeOptions"
            @update:page="emit('update:page', $event)"
            @update:size="emit('update:size', $event)"
        />
    </div>
</template>

<script setup>
/**
 * 공통 데이터 테이블 (서버 페이징 / 정렬 / 체크박스 선택 / 빈 데이터 / 로딩)
 *
 *  const table = useTable(userApi.getList, {defaultSearch});
 *  const headers = [
 *      {title: '이름', key: 'name', sortable: true},
 *      {title: '상태', key: 'status', align: 'center', width: 100},
 *      {title: '', key: 'actions', sortable: false, align: 'end'},
 *  ];
 *
 *  <BaseDataTable v-bind="table.bind" v-on="table.on" v-model:selected="table.selected"
 *                 :headers="headers" show-select @click:row="onRowClick">
 *      <template #item.status="{item}">{{ statusName(item.status) }}</template>
 *  </BaseDataTable>
 *
 *  - v-data-table-server 의 슬롯(item.xxx, header.xxx 등)은 그대로 사용할 수 있습니다.
 *  - 정렬값 형식: [{key: 'name', order: 'asc'}]
 */
import {PAGINATION} from '@/config';
import BaseEmpty from './BaseEmpty.vue';
import BasePagination from './BasePagination.vue';

defineOptions({name: 'BaseDataTable', inheritAttrs: false});

defineProps({
    title: {type: String, default: ''},
    headers: {type: Array, required: true},
    items: {type: Array, default: () => []},
    loading: {type: Boolean, default: false},
    totalCount: {type: Number, default: 0},
    page: {type: Number, default: PAGINATION.PAGE_START},
    size: {type: Number, default: PAGINATION.DEFAULT_SIZE},
    sizeOptions: {type: Array, default: () => PAGINATION.SIZE_OPTIONS},
    sortBy: {type: Array, default: () => []},
    selected: {type: Array, default: () => []},
    showSelect: {type: Boolean, default: false},
    /** 선택/key 기준 필드 */
    itemValue: {type: [String, Function], default: 'id'},
    height: {type: [String, Number], default: undefined},
    hidePagination: {type: Boolean, default: false},
    emptyText: {type: String, default: '조회된 데이터가 없습니다.'},
});

const emit = defineEmits(['update:page', 'update:size', 'update:sortBy', 'update:selected']);
</script>

<style scoped lang="scss">
.base-data-table {
    &__toolbar {
        display: flex;
        flex-wrap: wrap;
        gap: $spacer-2;
        align-items: center;
        margin-bottom: $spacer-3;
    }

    &__table {
        border: 1px solid rgba(var(--v-border-color), var(--v-border-opacity));
        border-radius: $border-radius;

        :deep(th) {
            font-weight: 700 !important;
            white-space: nowrap;
            background: rgba(var(--v-theme-on-surface), 0.03);
        }
    }
}
</style>
