import {useUserStore} from '@/stores/user.store';

/**
 * 버튼/요소 단위 권한 디렉티브
 *
 *  <v-btn v-permission="'USER_EDIT'">수정</v-btn>             권한 없으면 숨김
 *  <v-btn v-permission="['USER_EDIT', 'USER_DELETE']">        하나라도 있으면 노출
 *  <v-btn v-permission.disable="'USER_DELETE'">삭제</v-btn>   권한 없으면 비활성화
 *  <div v-permission:role="'ADMIN'">관리자 전용</div>          역할 기준
 *
 *  ※ DOM 을 직접 제거하면 Vue 의 patch 와 충돌할 수 있어 display:none 으로 처리합니다.
 *    렌더링 자체를 막아야 하면 v-if="userStore.hasPermission('...')" 를 사용하세요.
 *  ※ 화면 제어일 뿐이므로 서버에서도 반드시 권한을 검사해야 합니다.
 */
const isAllowed = (binding) => {
    const store = useUserStore();
    return binding.arg === 'role' ? store.hasRole(binding.value) : store.hasPermission(binding.value);
};

const apply = (el, binding) => {
    const allowed = isAllowed(binding);

    if (binding.modifiers.disable) {
        el.classList.toggle('v-btn--disabled', !allowed);
        el.toggleAttribute('disabled', !allowed);
        el.style.pointerEvents = allowed ? '' : 'none';
        return;
    }

    if (allowed) {
        if (el.__permissionDisplay !== undefined) {
            el.style.display = el.__permissionDisplay;
            delete el.__permissionDisplay;
        }
    } else if (el.__permissionDisplay === undefined) {
        el.__permissionDisplay = el.style.display;
        el.style.display = 'none';
    }
};

export default {
    mounted: apply,
    updated: apply,
};
