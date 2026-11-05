<template>
    <v-dialog :model-value="!!current" :width="current?.width || 420" persistent @keydown.esc="onCancel">
        <v-card v-if="current" class="dialog-host">
            <v-card-text class="dialog-host__body">
                <v-icon :icon="icon" :color="iconColor" size="40" class="mb-3" />
                <div v-if="current.title" class="dialog-host__title">{{ current.title }}</div>
                <!-- 메시지는 텍스트로만 출력 (XSS 방지), 줄바꿈(\n)은 유지 -->
                <div class="dialog-host__message">{{ current.message }}</div>
            </v-card-text>
            <v-card-actions class="dialog-host__actions">
                <v-btn
                    v-if="current.type === 'confirm'"
                    variant="outlined"
                    color="secondary"
                    min-width="96"
                    @click="onCancel"
                >
                    {{ current.cancelText }}
                </v-btn>
                <v-btn v-focus :color="current.color" min-width="96" @click="onConfirm">
                    {{ current.confirmText }}
                </v-btn>
            </v-card-actions>
        </v-card>
    </v-dialog>
</template>

<script setup>
/**
 * 함수형 Alert / Confirm 렌더러 (App.vue 에 1개만 배치)
 *  사용은 utils/dialog.js 의 alert(), confirm() 참고
 */
import {computed} from 'vue';
import {storeToRefs} from 'pinia';
import {useDialogStore} from '@/stores/dialog.store';

defineOptions({name: 'DialogHost'});

const dialogStore = useDialogStore();
const {current} = storeToRefs(dialogStore);

const icon = computed(() => {
    if (current.value?.icon) return current.value.icon;
    if (current.value?.color === 'error') return 'mdi-alert-circle-outline';
    return current.value?.type === 'confirm' ? 'mdi-help-circle-outline' : 'mdi-information-outline';
});
const iconColor = computed(() => current.value?.color || 'primary');

const onConfirm = () => dialogStore.close(true);
const onCancel = () => dialogStore.close(current.value?.type === 'alert');
</script>

<style scoped lang="scss">
.dialog-host {
    &__body {
        padding: $spacer-6 $spacer-5 $spacer-4 !important;
        text-align: center;
    }

    &__title {
        margin-bottom: $spacer-2;
        font-size: $font-size-lg;
        font-weight: 700;
    }

    &__message {
        font-size: $font-size-base;
        line-height: 1.6;
        word-break: keep-all;
        white-space: pre-line;
    }

    &__actions {
        justify-content: center;
        gap: $spacer-2;
        padding: 0 $spacer-5 $spacer-5;
    }
}
</style>
