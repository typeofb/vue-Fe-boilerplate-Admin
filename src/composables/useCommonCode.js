import {computed, ref} from 'vue';
import {useCodeStore} from '@/stores/code.store';

/**
 * 공통코드 → 셀렉트 옵션
 *
 *  const {options: statusOptions, getName: statusName} = useCommonCode('USER_STATUS', {all: true});
 *  <BaseSelect v-model="form.status" :items="statusOptions" />
 *  <td>{{ statusName(item.status) }}</td>
 *
 * @param {string} group 코드 그룹
 * @param {{all?: boolean|string, filter?: (code: import('@/types').CommonCode) => boolean}} [options]
 *        all: true → '전체' 옵션 추가 (문자열이면 해당 라벨)
 */
export function useCommonCode(group, {all = false, filter} = {}) {
    const store = useCodeStore();
    const loading = ref(true);

    store.fetchCodes(group).finally(() => {
        loading.value = false;
    });

    const codes = computed(() => {
        const list = store.getCodes(group);
        return filter ? list.filter(filter) : list;
    });

    /** @type {import('vue').ComputedRef<import('@/types').Option[]>} */
    const options = computed(() => {
        const list = codes.value.map((c) => ({label: c.name, value: c.code}));
        if (!all) return list;
        return [{label: typeof all === 'string' ? all : '전체', value: null}, ...list];
    });

    const getName = (code, fallback = '-') => store.getName(group, code, fallback);

    return {codes, options, getName, loading};
}
