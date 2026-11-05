/**
 * 마운트 시 자동 포커스
 *  <BaseInput v-focus />           (Vuetify 컴포넌트 내부 input 까지 탐색)
 *  <input v-focus="isEditing" />   값이 true 일 때만
 */
const focusInner = (el) => {
    const target = el.matches?.('input, textarea, select') ? el : el.querySelector('input, textarea, select');
    target?.focus();
};

export default {
    mounted(el, binding) {
        if (binding.value === false) return;
        // 다이얼로그 transition 이후 포커스 되도록 지연
        setTimeout(() => focusInner(el), 50);
    },
    updated(el, binding) {
        if (binding.value && !binding.oldValue) focusInner(el);
    },
};
