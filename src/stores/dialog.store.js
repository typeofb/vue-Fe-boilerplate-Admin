import {computed, ref} from 'vue';
import {defineStore} from 'pinia';

/**
 * 함수형 Alert / Confirm 큐
 *  - utils/dialog.js 의 alert(), confirm() 이 open() 을 호출
 *  - components/feedback/DialogHost.vue 가 current 를 렌더링
 *  - 여러 개가 동시에 호출되면 순서대로 하나씩 노출
 */
let seq = 0;

export const useDialogStore = defineStore('dialog', () => {
    const queue = ref([]);
    const current = computed(() => queue.value[0] || null);

    /** @returns {Promise<boolean>} */
    const open = (options) =>
        new Promise((resolve) => {
            queue.value.push({
                id: ++seq,
                type: 'alert',
                title: '',
                confirmText: '확인',
                cancelText: '취소',
                color: 'primary',
                width: 420,
                ...options,
                resolve,
            });
        });

    const close = (result) => {
        const item = queue.value.shift();
        item?.resolve(result);
    };

    /** 로그아웃 등 화면 전환 시 남은 다이얼로그 정리 */
    const clear = () => {
        queue.value.forEach((item) => item.resolve(false));
        queue.value = [];
    };

    return {queue, current, open, close, clear};
});
