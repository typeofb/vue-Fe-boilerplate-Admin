<template>
    <v-menu v-model="menu" :close-on-content-click="false" :disabled="disabled || readonly" min-width="auto">
        <template #activator="{props: activatorProps}">
            <v-text-field
                v-bind="{...activatorProps, ...$attrs}"
                :model-value="modelValue"
                :label="label"
                :placeholder="placeholder"
                :rules="mergedRules"
                :disabled="disabled"
                :clearable="clearable && !readonly"
                prepend-inner-icon="mdi-calendar-blank-outline"
                readonly
                @click:clear="emit('update:modelValue', '')"
            >
                <template v-if="label" #label>
                    <span> {{ label }}<span v-if="required" class="required-mark">*</span> </span>
                </template>
            </v-text-field>
        </template>
        <v-date-picker
            :model-value="pickerValue"
            :min="min || undefined"
            :max="max || undefined"
            color="primary"
            show-adjacent-months
            hide-header
            @update:model-value="onPick"
        />
    </v-menu>
</template>

<script setup>
/**
 * 공통 날짜 선택 (v-model: 'YYYY-MM-DD' 문자열)
 *  <BaseDatePicker v-model="form.birth" label="생년월일" :max="today" />
 */
import {computed, ref} from 'vue';
import dayjs from '@/plugins/dayjs';
import {DATE_FORMAT} from '@/config';
import {rules as ruleSet} from '@/utils/validators';

defineOptions({name: 'BaseDatePicker', inheritAttrs: false});

const props = defineProps({
    modelValue: {type: String, default: ''},
    label: {type: String, default: undefined},
    placeholder: {type: String, default: DATE_FORMAT.DATE},
    /** 선택 가능 최소/최대 'YYYY-MM-DD' */
    min: {type: String, default: ''},
    max: {type: String, default: ''},
    required: {type: Boolean, default: false},
    rules: {type: Array, default: () => []},
    clearable: {type: Boolean, default: true},
    disabled: {type: Boolean, default: false},
    readonly: {type: Boolean, default: false},
});

const emit = defineEmits(['update:modelValue']);
const menu = ref(false);

const pickerValue = computed(() => (props.modelValue ? dayjs(props.modelValue).toDate() : null));

const onPick = (date) => {
    emit('update:modelValue', date ? dayjs(date).format(DATE_FORMAT.DATE) : '');
    menu.value = false;
};

const mergedRules = computed(() =>
    props.required ? [ruleSet.requiredSelect(props.label), ...props.rules] : props.rules,
);
</script>
