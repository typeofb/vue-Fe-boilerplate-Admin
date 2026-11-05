import {ref, shallowRef} from 'vue';

/**
 * 모달 열림 상태 + 전달 데이터 + 결과 반환
 *
 *  const editModal = useModal();
 *  editModal.open({id: 1});                         // 열기 (payload 전달)
 *  const result = await editModal.open({id: 1});    // 닫힐 때 결과 받기
 *  editModal.close(true);                           // 결과와 함께 닫기
 *
 *  <BaseModal v-model="editModal.isOpen.value" title="수정">
 *      {{ editModal.payload.value?.id }}
 *  </BaseModal>
 */
export function useModal() {
    const isOpen = ref(false);
    const payload = shallowRef(null);
    let resolver = null;

    /** @returns {Promise<any>} close(result) 로 전달된 값 */
    const open = (data = null) => {
        payload.value = data;
        isOpen.value = true;
        return new Promise((resolve) => {
            resolver = resolve;
        });
    };

    const close = (result) => {
        isOpen.value = false;
        resolver?.(result);
        resolver = null;
    };

    return {isOpen, payload, open, close};
}
