/**
 * 입력 제어 디렉티브
 *
 *  <BaseInput v-model="form.phone" v-number-only />          숫자만
 *  <BaseInput v-model="form.price" v-number-only.decimal />   숫자 + 소수점
 *  <BaseInput v-model="form.code" v-max-length="10" />        최대 길이 (한글 IME 조합 중에도 안전)
 *
 *  v-model 과 함께 쓰기 위해 값을 바꾼 뒤 input 이벤트를 다시 발생시킵니다.
 */
const getInput = (el) => (el.matches?.('input, textarea') ? el : el.querySelector('input, textarea'));

const bindFilter = (el, filterFn) => {
    const input = getInput(el);
    if (!input) return;

    let composing = false;
    const handler = (event) => {
        if (composing || event.__filtered) return;
        const before = input.value;
        const after = filterFn(before);
        if (before !== after) {
            input.value = after;
            const e = new Event('input', {bubbles: true});
            e.__filtered = true;
            input.dispatchEvent(e);
        }
    };
    const onStart = () => {
        composing = true;
    };
    const onEnd = (e) => {
        composing = false;
        handler(e);
    };

    input.addEventListener('input', handler);
    input.addEventListener('compositionstart', onStart);
    input.addEventListener('compositionend', onEnd);
    el.__inputFilterCleanup = () => {
        input.removeEventListener('input', handler);
        input.removeEventListener('compositionstart', onStart);
        input.removeEventListener('compositionend', onEnd);
    };
};

const unbind = (el) => {
    el.__inputFilterCleanup?.();
    delete el.__inputFilterCleanup;
};

export const numberOnly = {
    mounted(el, binding) {
        const allowDecimal = binding.modifiers.decimal;
        bindFilter(el, (v) => {
            if (!allowDecimal) return v.replace(/\D/g, '');
            const cleaned = v.replace(/[^\d.]/g, '');
            const [int, ...rest] = cleaned.split('.');
            return rest.length ? `${int}.${rest.join('')}` : int;
        });
    },
    beforeUnmount: unbind,
};

export const maxLength = {
    mounted(el, binding) {
        const max = Number(binding.value) || 0;
        if (max > 0) bindFilter(el, (v) => (v.length > max ? v.slice(0, max) : v));
    },
    beforeUnmount: unbind,
};
