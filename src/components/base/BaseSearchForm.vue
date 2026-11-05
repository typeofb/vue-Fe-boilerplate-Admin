<template>
    <v-card class="base-search-form" border>
        <v-form @submit.prevent="emit('search')">
            <v-card-text class="pb-2">
                <v-row dense>
                    <slot />
                    <template v-if="expanded">
                        <slot name="more" />
                    </template>
                </v-row>
            </v-card-text>
            <v-card-actions class="base-search-form__actions">
                <v-btn
                    v-if="$slots.more"
                    variant="text"
                    size="small"
                    :append-icon="expanded ? 'mdi-chevron-up' : 'mdi-chevron-down'"
                    @click="expanded = !expanded"
                >
                    상세검색
                </v-btn>
                <v-spacer />
                <slot name="actions" />
                <v-btn variant="outlined" color="secondary" prepend-icon="mdi-refresh" @click="emit('reset')">
                    초기화
                </v-btn>
                <v-btn type="submit" color="primary" prepend-icon="mdi-magnify" :loading="loading">검색</v-btn>
            </v-card-actions>
        </v-form>
    </v-card>
</template>

<script setup>
/**
 * 검색 조건 영역 틀 (검색 / 초기화 버튼 + Enter 검색 + 상세검색 접기)
 *
 *  <BaseSearchForm :loading="table.loading" @search="table.search" @reset="table.reset">
 *      <v-col cols="12" md="3"><BaseInput v-model="table.searchForm.keyword" label="검색어" /></v-col>
 *      <template #more>
 *          <v-col cols="12" md="6"><BaseDateRangePicker v-model:start="..." v-model:end="..." /></v-col>
 *      </template>
 *  </BaseSearchForm>
 */
import {ref} from 'vue';

defineOptions({name: 'BaseSearchForm'});

const props = defineProps({
    loading: {type: Boolean, default: false},
    /** 상세검색(more 슬롯) 기본 펼침 */
    defaultExpanded: {type: Boolean, default: true},
});

const emit = defineEmits(['search', 'reset']);
const expanded = ref(props.defaultExpanded);
</script>

<style scoped lang="scss">
.base-search-form {
    margin-bottom: $spacer-4;

    &__actions {
        flex-wrap: wrap;
        gap: $spacer-2;
        padding: $spacer-2 $spacer-4 $spacer-3;
    }
}
</style>
