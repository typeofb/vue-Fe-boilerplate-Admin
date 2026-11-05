<template>
    <div class="base-date-range">
        <div class="range-fields">
            <BaseDatePicker
                :model-value="start"
                :label="label ? `${label} 시작` : '시작일'"
                :max="end || max"
                :min="min"
                :required="required"
                :disabled="disabled"
                @update:model-value="emit('update:start', $event)"
            />
            <span class="range-sep">~</span>
            <BaseDatePicker
                :model-value="end"
                :label="label ? `${label} 종료` : '종료일'"
                :min="start || min"
                :max="max"
                :required="required"
                :disabled="disabled"
                @update:model-value="emit('update:end', $event)"
            />
        </div>
        <v-btn-toggle
            v-if="presets.length"
            :model-value="activePreset"
            density="compact"
            variant="outlined"
            divided
            class="range-presets"
        >
            <v-btn
                v-for="p in presetItems"
                :key="p.value"
                :value="p.value"
                size="small"
                :disabled="disabled"
                @click="applyPreset(p.value)"
            >
                {{ p.label }}
            </v-btn>
        </v-btn-toggle>
    </div>
</template>

<script setup>
/**
 * 기간 선택 (시작일 ~ 종료일 + 빠른 선택)
 *  <BaseDateRangePicker v-model:start="search.startDate" v-model:end="search.endDate" label="가입일" />
 *  <BaseDateRangePicker v-model:start="s" v-model:end="e" :presets="['today', '1w', '1m']" />
 *
 *  - 시작일 > 종료일 선택 불가 (min/max 상호 제한)
 */
import {computed} from 'vue';
import {getDateRange} from '@/utils/format';
import BaseDatePicker from './BaseDatePicker.vue';

defineOptions({name: 'BaseDateRangePicker'});

const PRESET_LABELS = {today: '오늘', '1w': '1주일', '1m': '1개월', '3m': '3개월', '6m': '6개월', '1y': '1년'};

const props = defineProps({
    start: {type: String, default: ''},
    end: {type: String, default: ''},
    label: {type: String, default: ''},
    min: {type: String, default: ''},
    max: {type: String, default: ''},
    /** 빠른 선택 버튼 ([] 이면 숨김) */
    presets: {type: Array, default: () => ['today', '1w', '1m', '3m']},
    required: {type: Boolean, default: false},
    disabled: {type: Boolean, default: false},
});

const emit = defineEmits(['update:start', 'update:end']);

const presetItems = computed(() => props.presets.map((v) => ({value: v, label: PRESET_LABELS[v] || v})));

/** 현재 기간이 프리셋과 일치하면 해당 버튼 활성 표시 */
const activePreset = computed(() =>
    props.presets.find((p) => {
        const [s, e] = getDateRange(p);
        return s === props.start && e === props.end;
    }),
);

const applyPreset = (preset) => {
    const [s, e] = getDateRange(preset);
    emit('update:start', s);
    emit('update:end', e);
};
</script>

<style scoped lang="scss">
.base-date-range {
    display: flex;
    flex-wrap: wrap;
    gap: $spacer-2;
    align-items: center;
}

.range-fields {
    display: flex;
    flex: 1 1 320px;
    gap: $spacer-2;
    align-items: center;
}

.range-sep {
    color: rgba(var(--v-theme-on-surface), 0.6);
}

.range-presets {
    height: 40px !important;
}
</style>
