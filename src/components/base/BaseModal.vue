<template>
    <v-dialog
        :model-value="modelValue"
        :width="width"
        :max-width="maxWidth"
        :persistent="persistent"
        :fullscreen="fullscreen || mobile"
        :scrollable="scrollable"
        @update:model-value="onUpdate"
        @after-leave="emit('closed')"
    >
        <v-card class="base-modal">
            <v-card-title class="base-modal__title">
                <slot name="title">{{ title }}</slot>
                <v-spacer />
                <v-btn
                    v-if="!hideClose"
                    icon="mdi-close"
                    variant="text"
                    size="small"
                    aria-label="닫기"
                    @click="close"
                />
            </v-card-title>
            <v-divider />

            <v-card-text class="base-modal__body">
                <slot />
            </v-card-text>

            <template v-if="$slots.actions || !hideFooter">
                <v-divider />
                <v-card-actions class="base-modal__actions">
                    <slot name="actions" :close="close">
                        <v-spacer />
                        <BaseButton variant="outlined" color="secondary" @click="close">{{ cancelText }}</BaseButton>
                        <BaseButton v-if="confirmText" :loading="loading" @click="emit('confirm')">
                            {{ confirmText }}
                        </BaseButton>
                    </slot>
                </v-card-actions>
            </template>
        </v-card>
    </v-dialog>
</template>

<script setup>
/**
 * 공통 모달 틀
 *
 *  <BaseModal v-model="modal.isOpen.value" title="회원 상세" width="720" confirm-text="저장"
 *             :loading="saving" @confirm="onSave">
 *      ...내용
 *  </BaseModal>
 *
 *  - actions 슬롯으로 하단 버튼 영역 교체 가능 (slot props: close)
 *  - 모바일에서는 자동 fullscreen
 */
import {useDisplay} from 'vuetify';

defineOptions({name: 'BaseModal'});

const props = defineProps({
    modelValue: {type: Boolean, default: false},
    title: {type: String, default: ''},
    width: {type: [String, Number], default: 600},
    maxWidth: {type: [String, Number], default: '95vw'},
    persistent: {type: Boolean, default: true},
    fullscreen: {type: Boolean, default: false},
    scrollable: {type: Boolean, default: true},
    hideClose: {type: Boolean, default: false},
    hideFooter: {type: Boolean, default: false},
    confirmText: {type: String, default: ''},
    cancelText: {type: String, default: '닫기'},
    loading: {type: Boolean, default: false},
});

const emit = defineEmits(['update:modelValue', 'confirm', 'close', 'closed']);
const {mobile} = useDisplay();

const close = () => {
    if (props.loading) return;
    emit('update:modelValue', false);
    emit('close');
};

const onUpdate = (value) => {
    if (!value) close();
};
</script>

<style scoped lang="scss">
.base-modal__title {
    display: flex;
    align-items: center;
    padding: $spacer-3 $spacer-4;
    font-size: $font-size-lg;
    font-weight: 700;
}

.base-modal__body {
    padding: $spacer-5 $spacer-4 !important;
}

.base-modal__actions {
    gap: $spacer-2;
    padding: $spacer-3 $spacer-4;
}
</style>
