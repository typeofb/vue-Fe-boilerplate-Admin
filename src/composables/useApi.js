import {onBeforeUnmount, ref, shallowRef} from 'vue';

/**
 * API 호출 상태 묶음 (data / loading / error)
 *
 *  const {data, loading, execute} = useApi(userApi.getDetail);
 *  await execute(id);
 *
 *  const {loading: saving, execute: save} = useApi(userApi.create, {
 *      onSuccess: () => toast.success('저장되었습니다.'),
 *  });
 *
 *  - 에러 토스트는 http 인터셉터에서 이미 처리되므로 기본적으로 다시 throw 하지 않습니다.
 *    (execute 는 실패 시 undefined 반환. 직접 분기하려면 throwOnError: true)
 *  - 연속 호출 시 마지막 호출 결과만 반영 (이전 응답이 늦게 와도 덮어쓰지 않음)
 *
 * @template T
 * @param {(...args: any[]) => Promise<T>} apiFn
 * @param {{immediate?: boolean, args?: any[], initialData?: T, throwOnError?: boolean,
 *          onSuccess?: (data: T) => void, onError?: (e: Error) => void}} [options]
 */
export function useApi(apiFn, options = {}) {
    const {immediate = false, args = [], initialData = null, throwOnError = false, onSuccess, onError} = options;

    const data = shallowRef(initialData);
    const error = shallowRef(null);
    const loading = ref(false);
    let callId = 0;
    let unmounted = false;

    const execute = async (...params) => {
        const id = ++callId;
        loading.value = true;
        error.value = null;
        try {
            const result = await apiFn(...params);
            if (id !== callId || unmounted) return result;
            data.value = result;
            onSuccess?.(result);
            return result;
        } catch (e) {
            if (id === callId && !unmounted) {
                error.value = e;
                if (!e?.isCanceled) onError?.(e);
            }
            if (throwOnError) throw e;
            return undefined;
        } finally {
            if (id === callId && !unmounted) loading.value = false;
        }
    };

    const reset = () => {
        data.value = initialData;
        error.value = null;
    };

    onBeforeUnmount(() => {
        unmounted = true;
    });

    if (immediate) execute(...args);

    return {data, error, loading, execute, reset};
}
