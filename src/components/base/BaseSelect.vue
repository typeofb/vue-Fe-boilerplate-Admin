<template>
    <v-select
        v-bind="$attrs"
        :items="mergedItems"
        item-title="label"
        item-value="value"
        :label="label"
        :rules="mergedRules"
        :no-data-text="noDataText"
    >
        <template v-if="label" #label>
            <span> {{ label }}<span v-if="required" class="required-mark" aria-hidden="true">*</span> </span>
        </template>
        <template v-for="(_, name) in $slots" #[name]="slotProps">
            <slot :name="name" v-bind="slotProps || {}" />
        </template>
    </v-select>
</template>

<script setup>
/**
 * 공통 셀렉트
 *  - items 는 {label, value} 형식으로 통일 (useCommonCode().options 와 동일)
 *
 *  <BaseSelect v-model="search.status" :items="statusOptions" label="상태" all-label="전체" />
 *  <BaseSelect v-model="form.roles" :items="roleOptions" label="역할" multiple chips required />
 */
import {computed} from 'vue';
import {rules as ruleSet} from '@/utils/validators';

defineOptions({name: 'BaseSelect', inheritAttrs: false});

const props = defineProps({
    /** @type {import('vue').PropType<import('@/types').Option[]>} */
    items: {type: Array, default: () => []},
    label: {type: String, default: undefined},
    required: {type: Boolean, default: false},
    rules: {type: Array, default: () => []},
    /** 지정 시 맨 앞에 value=null 인 '전체' 옵션 추가 */
    allLabel: {type: String, default: ''},
    noDataText: {type: String, default: '선택 항목이 없습니다.'},
});

const mergedItems = computed(() =>
    props.allLabel ? [{label: props.allLabel, value: null}, ...props.items] : props.items,
);
const mergedRules = computed(() =>
    props.required ? [ruleSet.requiredSelect(props.label), ...props.rules] : props.rules,
);
</script>
