/**
 * 요소 바깥 클릭 감지
 *  <div v-click-outside="close">...</div>
 *  ※ Vuetify 컴포넌트(v-menu 등)는 자체 처리하므로 커스텀 드롭다운 등에 사용
 */
export default {
    mounted(el, binding) {
        el.__clickOutside = (event) => {
            if (!(el === event.target || el.contains(event.target))) {
                binding.value?.(event);
            }
        };
        // 디렉티브가 붙는 순간의 클릭 이벤트로 바로 닫히지 않도록 다음 tick 에 등록
        setTimeout(() => document.addEventListener('click', el.__clickOutside, true));
    },
    beforeUnmount(el) {
        document.removeEventListener('click', el.__clickOutside, true);
        delete el.__clickOutside;
    },
};
