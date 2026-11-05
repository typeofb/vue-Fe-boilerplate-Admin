<template>
    <v-radio-group v-bind="$attrs" :inline="inline" :rules="mergedRules">
        <template v-if="label" #label>
            <span class="group-label"> {{ label }}<span v-if="required" class="required-mark">*</span> </span>
        </template>
        <v-radio
            v-for="opt in mergedOptions"
            :key="String(opt.value)"
            :label="opt.label"
            :value="opt.value"
            :disabled="opt.disabled"
        />
    </v-radio-group>
</template>

<script setup>
/**
 * 공통 라디오 그룹
 *  <BaseRadioGroup v-model="form.gender" :options="[{label: '남', value: 'M'}, {label: '여', value: 'F'}]" label="성별" />
 *  <BaseRadioGroup v-model="search.useYn" :options="ynOptions" all-label="전체" />
 */
import {computed} from 'vue';
import {rules as ruleSet} from '@/utils/validators';

defineOptions({name: 'BaseRadioGroup', inheritAttrs: false});

const props = defineProps({
    /** @type {import('vue').PropType<import('@/types').Option[]>} */
    options: {type: Array, default: () => []},
    label: {type: String, default: undefined},
    inline: {type: Boolean, default: true},
    allLabel: {type: String, default: ''},
    required: {type: Boolean, default: false},
    rules: {type: Array, default: () => []},
});

const mergedOptions = computed(() =>
    props.allLabel ? [{label: props.allLabel, value: null}, ...props.options] : props.options,
);
const mergedRules = computed(() =>
    props.required ? [ruleSet.requiredSelect(props.label), ...props.rules] : props.rules,
);
</script>

<style scoped lang="scss">
.group-label {
    font-size: $font-size-sm;
}
</style>
