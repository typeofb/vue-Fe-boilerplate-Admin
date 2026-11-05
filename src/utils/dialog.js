import {useDialogStore} from '@/stores/dialog.store';

/**
 * 함수형 Alert / Confirm
 *  - 렌더링은 App.vue 의 <DialogHost /> 가 담당 (stores/dialog.store.js 큐)
 *
 *  await alert('저장되었습니다.');
 *  if (!(await confirm('삭제하시겠습니까?'))) return;
 *  await confirm('정말 삭제하시겠습니까?', {title: '삭제', confirmText: '삭제', color: 'error'});
 */

/**
 * @typedef {Object} DialogOptions
 * @property {string} [title]
 * @property {string} [confirmText]
 * @property {string} [cancelText]
 * @property {string} [color]      - 확인 버튼 색상 (primary, error ...)
 * @property {string} [icon]       - mdi 아이콘
 * @property {number} [width]
 */

/** @param {string} message @param {DialogOptions} [options] @returns {Promise<void>} */
export const alert = (message, options = {}) =>
    useDialogStore()
        .open({type: 'alert', message, ...options})
        .then(() => undefined);

/** @param {string} message @param {DialogOptions} [options] @returns {Promise<boolean>} */
export const confirm = (message, options = {}) => useDialogStore().open({type: 'confirm', message, ...options});
