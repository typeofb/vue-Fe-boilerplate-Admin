import {alert, confirm} from '@/utils/dialog';
import toast from '@/utils/toast';

/**
 * 확인 → 실행 → 결과 알림 패턴
 *
 *  const {confirmAction} = useConfirm();
 *  await confirmAction('삭제하시겠습니까?', () => userApi.remove(ids), {
 *      successMessage: '삭제되었습니다.',
 *      onSuccess: () => table.refresh({removedCount: ids.length}),
 *  });
 */
export function useConfirm() {
    /**
     * @param {string} message
     * @param {() => Promise<any>} action
     * @param {{title?: string, color?: string, confirmText?: string,
     *          successMessage?: string, onSuccess?: (result: any) => void}} [options]
     * @returns {Promise<boolean>} 실행 성공 여부
     */
    const confirmAction = async (message, action, options = {}) => {
        const {successMessage, onSuccess, ...dialogOptions} = options;
        if (!(await confirm(message, dialogOptions))) return false;
        try {
            const result = await action();
            if (successMessage) toast.success(successMessage);
            onSuccess?.(result);
            return true;
        } catch {
            return false; // 에러 토스트는 인터셉터에서 처리
        }
    };

    return {alert, confirm, confirmAction};
}
