<template>
    <div class="base-file-upload">
        <div v-if="label" class="base-file-upload__label">
            {{ label }}<span v-if="required" class="required-mark">*</span>
        </div>

        <div
            class="base-file-upload__drop"
            :class="{'is-dragover': dragover, 'is-disabled': disabled || isFull}"
            role="button"
            tabindex="0"
            @click="openPicker"
            @keydown.enter.prevent="openPicker"
            @dragover.prevent="dragover = !disabled"
            @dragleave.prevent="dragover = false"
            @drop.prevent="onDrop"
        >
            <v-icon icon="mdi-cloud-upload-outline" size="32" />
            <p class="mt-1">파일을 끌어다 놓거나 <strong class="text-primary">클릭</strong>하여 선택하세요.</p>
            <p class="base-file-upload__hint">{{ hint }}</p>
            <input ref="inputRef" type="file" hidden :multiple="multiple" :accept="acceptAttr" @change="onChange" />
        </div>

        <!-- 업로드된(서버) 파일 + 새로 선택한 파일 -->
        <v-list v-if="existingFiles.length || modelValue.length" density="compact" class="base-file-upload__list">
            <v-list-item v-for="file in existingFiles" :key="`e-${file.id}`" prepend-icon="mdi-paperclip">
                <v-list-item-title>
                    <a v-if="file.url" :href="file.url" target="_blank" rel="noopener">{{ file.name }}</a>
                    <span v-else>{{ file.name }}</span>
                </v-list-item-title>
                <v-list-item-subtitle>{{ formatFileSize(file.size) }}</v-list-item-subtitle>
                <template #append>
                    <v-btn
                        v-if="!disabled"
                        icon="mdi-close"
                        variant="text"
                        size="x-small"
                        aria-label="삭제"
                        @click="emit('removeExisting', file)"
                    />
                </template>
            </v-list-item>
            <v-list-item v-for="(file, i) in modelValue" :key="`n-${i}-${file.name}`" prepend-icon="mdi-file-outline">
                <v-list-item-title>
                    {{ file.name }} <v-chip size="x-small" color="primary" class="ml-1">NEW</v-chip>
                </v-list-item-title>
                <v-list-item-subtitle>{{ formatFileSize(file.size) }}</v-list-item-subtitle>
                <template #append>
                    <v-btn
                        v-if="!disabled"
                        icon="mdi-close"
                        variant="text"
                        size="x-small"
                        aria-label="삭제"
                        @click="removeAt(i)"
                    />
                </template>
            </v-list-item>
        </v-list>
    </div>
</template>

<script setup>
/**
 * 파일 업로드 (드래그 앤 드롭 / 용량·확장자·개수 제한)
 *
 *  <BaseFileUpload v-model="form.files" :existing-files="detail.files" :extensions="['pdf','xlsx']"
 *                  :max-size-mb="10" :max-count="5" @remove-existing="onRemoveExisting" />
 *
 *  - v-model: 새로 선택한 File[] → 저장 시 request.upload() / toFormData() 로 전송
 *  - existingFiles: 서버에 이미 저장된 파일 [{id, name, size, url}]
 */
import {computed, ref} from 'vue';
import {UPLOAD} from '@/config';
import {formatFileSize} from '@/utils/format';
import {validateFile} from '@/utils/file';
import toast from '@/utils/toast';

defineOptions({name: 'BaseFileUpload'});

const props = defineProps({
    modelValue: {type: Array, default: () => []},
    existingFiles: {type: Array, default: () => []},
    label: {type: String, default: ''},
    multiple: {type: Boolean, default: true},
    /** 허용 확장자 (소문자, 점 제외) */
    extensions: {type: Array, default: () => [...UPLOAD.IMAGE_EXTENSIONS, ...UPLOAD.DOCUMENT_EXTENSIONS]},
    maxSizeMb: {type: Number, default: UPLOAD.MAX_SIZE_MB},
    maxCount: {type: Number, default: 10},
    required: {type: Boolean, default: false},
    disabled: {type: Boolean, default: false},
});

const emit = defineEmits(['update:modelValue', 'removeExisting']);

const inputRef = ref(null);
const dragover = ref(false);

const totalCount = computed(() => props.existingFiles.length + props.modelValue.length);
const isFull = computed(() => totalCount.value >= props.maxCount);
const acceptAttr = computed(() => props.extensions.map((e) => `.${e}`).join(','));
const hint = computed(
    () =>
        `${props.extensions.join(', ')} / 파일당 최대 ${props.maxSizeMb}MB / 최대 ${props.maxCount}개 (${totalCount.value}/${props.maxCount})`,
);

const openPicker = () => {
    if (props.disabled || isFull.value) return;
    inputRef.value?.click();
};

const addFiles = (fileList) => {
    const files = Array.from(fileList || []);
    if (!files.length) return;

    const accepted = [];
    for (const file of files) {
        const error = validateFile(file, {maxSizeMB: props.maxSizeMb, extensions: props.extensions});
        if (error) {
            toast.warning(error);
            continue;
        }
        if (totalCount.value + accepted.length >= props.maxCount) {
            toast.warning(`파일은 최대 ${props.maxCount}개까지 첨부할 수 있습니다.`);
            break;
        }
        accepted.push(file);
    }

    if (accepted.length) {
        emit('update:modelValue', props.multiple ? [...props.modelValue, ...accepted] : accepted.slice(0, 1));
    }
};

const onChange = (e) => {
    addFiles(e.target.files);
    e.target.value = ''; // 같은 파일 다시 선택 가능하도록
};

const onDrop = (e) => {
    dragover.value = false;
    if (props.disabled) return;
    addFiles(e.dataTransfer?.files);
};

const removeAt = (index) => {
    emit(
        'update:modelValue',
        props.modelValue.filter((_, i) => i !== index),
    );
};
</script>

<style scoped lang="scss">
.base-file-upload {
    &__label {
        margin-bottom: $spacer-2;
        font-size: $font-size-sm;
    }

    &__drop {
        padding: $spacer-5 $spacer-4;
        text-align: center;
        cursor: pointer;
        border: 2px dashed rgba(var(--v-border-color), 0.3);
        border-radius: $border-radius;
        transition:
            border-color 0.2s,
            background-color 0.2s;

        &:hover,
        &:focus-visible,
        &.is-dragover {
            background: rgba(var(--v-theme-primary), 0.04);
            border-color: rgb(var(--v-theme-primary));
            outline: none;
        }

        &.is-disabled {
            cursor: not-allowed;
            opacity: 0.6;
        }
    }

    &__hint {
        margin-top: $spacer-1;
        font-size: $font-size-xs;
        color: rgba(var(--v-theme-on-surface), 0.6);
    }

    &__list {
        margin-top: $spacer-2;
        border: 1px solid rgba(var(--v-border-color), var(--v-border-opacity));
        border-radius: $border-radius;
    }
}
</style>
