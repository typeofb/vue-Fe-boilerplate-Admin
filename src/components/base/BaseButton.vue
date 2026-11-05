<template>
    <v-btn
        v-if="visible"
        v-bind="$attrs"
        :loading="loading"
        :disabled="disabled || loading || !allowed"
        :color="color"
        :size="size"
    >
        <slot />
        <template v-for="(_, name) in passSlots" #[name]="slotProps">
            <slot :name="name" v-bind="slotProps || {}" />
        </template>
    </v-btn>
</template>

<script setup>
/**
 * 공통 버튼 (권한 / 로딩 상태)
 *
 *  <BaseButton permission="USER_EDIT" @click="onEdit">수정</BaseButton>
 *  <BaseButton permission="USER_DELETE" permission-mode="disable" color="error">삭제</BaseButton>
 *  <BaseButton :loading="saving" @click="onSave">저장</BaseButton>
 *
 *  그 외 v-btn props(variant, prepend-icon, to ...) 는 그대로 전달됩니다.
 */
import {computed, useSlots} from 'vue';
import {useUserStore} from '@/stores/user.store';

defineOptions({name: 'BaseButton', inheritAttrs: false});

const props = defineProps({
    /** 필요한 권한 코드 (배열이면 하나라도 있으면 허용) */
    permission: {type: [String, Array], default: null},
    /** 권한 없을 때: hide(숨김) | disable(비활성) */
    permissionMode: {type: String, default: 'hide', validator: (v) => ['hide', 'disable'].includes(v)},
    loading: {type: Boolean, default: false},
    disabled: {type: Boolean, default: false},
    color: {type: String, default: 'primary'},
    size: {type: String, default: 'default'},
});

const slots = useSlots();
const userStore = useUserStore();

const allowed = computed(() => userStore.hasPermission(props.permission));
const visible = computed(() => allowed.value || props.permissionMode === 'disable');
const passSlots = computed(() => Object.fromEntries(Object.entries(slots).filter(([name]) => name !== 'default')));
</script>
