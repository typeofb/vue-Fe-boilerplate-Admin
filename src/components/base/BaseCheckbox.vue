<template>
    <!-- 그룹: options 지정 시 (v-model = 선택된 value 배열) -->
    <v-input
        v-if="options"
        :model-value="modelValue"
        :rules="mergedRules"
        :disabled="disabled"
        class="base-checkbox-group"
    >
        <div class="d-flex flex-wrap align-center" :class="{'flex-column align-start': !inline}">
            <span v-if="label" class="group-label">
                {{ label }}<span v-if="required" class="required-mark">*</span>
            </span>
            <v-checkbox
                v-if="checkAll"
                :model-value="isAllChecked"
                :indeterminate="isIndeterminate"
                label="전체"
                :disabled="disabled"
                class="mr-3"
                hide-details
                @update:model-value="toggleAll"
            />
            <v-checkbox
                v-for="opt in options"
                :key="String(opt.value)"
                :model-value="modelValue"
                :value="opt.value"
                :label="opt.label"
                :disabled="disabled || opt.disabled"
                class="mr-3"
                hide-details
                multiple
                @update:model-value="emit('update:modelValue', $event)"
            />
        </div>
    </v-input>

    <!-- 단일: true/false 또는 true-value / false-value ('Y'/'N') -->
    <v-checkbox
        v-else
        v-bind="$attrs"
        :model-value="modelValue"
        :label="label"
        :disabled="disabled"
        @update:model-value="emit('update:modelValue', $event)"
    />
</template>

<script setup>
/**
 * 공통 체크박스 (단일 / 그룹)
 *
 *  <BaseCheckbox v-model="form.agree" label="동의" />
 *  <BaseCheckbox v-model="form.useYn" label="사용" true-value="Y" false-value="N" />
 *  <BaseCheckbox v-model="search.types" :options="typeOptions" label="유형" check-all />
 */
import {computed} from 'vue';
import {rules as ruleSet} from '@/utils/validators';

defineOptions({name: 'BaseCheckbox', inheritAttrs: false});

const props = defineProps({
    modelValue: {type: [Array, Boolean, String, Number], default: undefined},
    /** @type {import('vue').PropType<import('@/types').Option[]>} */
    options: {type: Array, default: undefined},
    label: {type: String, default: undefined},
    inline: {type: Boolean, default: true},
    checkAll: {type: Boolean, default: false},
    required: {type: Boolean, default: false},
    rules: {type: Array, default: () => []},
    disabled: {type: Boolean, default: false},
});

const emit = defineEmits(['update:modelValue']);

const selectedList = computed(() => (Array.isArray(props.modelValue) ? props.modelValue : []));
const enabledValues = computed(() => (props.options || []).filter((o) => !o.disabled).map((o) => o.value));
const isAllChecked = computed(
    () => enabledValues.value.length > 0 && enabledValues.value.every((v) => selectedList.value.includes(v)),
);
const isIndeterminate = computed(() => !isAllChecked.value && selectedList.value.length > 0);

const toggleAll = (checked) => emit('update:modelValue', checked ? [...enabledValues.value] : []);

const mergedRules = computed(() =>
    props.required ? [ruleSet.requiredSelect(props.label), ...props.rules] : props.rules,
);
</script>

<style scoped lang="scss">
.group-label {
    margin-right: $spacer-4;
    font-size: $font-size-sm;
    color: rgba(var(--v-theme-on-surface), 0.7);
}
</style>
