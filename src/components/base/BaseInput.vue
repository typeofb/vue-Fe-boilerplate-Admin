<template>
    <component :is="textarea ? VTextarea : VTextField" v-bind="$attrs" :label="label" :rules="mergedRules">
        <template v-if="label" #label>
            <span> {{ label }}<span v-if="required" class="required-mark" aria-hidden="true">*</span> </span>
        </template>
        <template v-for="(_, name) in $slots" #[name]="slotProps">
            <slot :name="name" v-bind="slotProps || {}" />
        </template>
    </component>
</template>

<script setup>
/**
 * 공통 입력 (v-text-field / v-textarea 래퍼)
 *
 *  <BaseInput v-model="form.name" label="이름" required :rules="[rules.maxLength(20)]" />
 *  <BaseInput v-model="form.memo" label="메모" textarea rows="3" counter="500" />
 *  <BaseInput v-model="form.phone" label="휴대폰" v-number-only :rules="[rules.mobile()]" />
 *
 *  - required: 라벨에 * 표시 + 필수 규칙 자동 추가
 *  - variant / density 등 기본값은 plugins/vuetify.js defaults 에서 일괄 관리
 */
import {computed} from 'vue';
import {VTextarea, VTextField} from 'vuetify/components';
import {rules as ruleSet} from '@/utils/validators';

defineOptions({name: 'BaseInput', inheritAttrs: false});

const props = defineProps({
    label: {type: String, default: undefined},
    required: {type: Boolean, default: false},
    rules: {type: Array, default: () => []},
    textarea: {type: Boolean, default: false},
});

const mergedRules = computed(() => (props.required ? [ruleSet.required(props.label), ...props.rules] : props.rules));
</script>
