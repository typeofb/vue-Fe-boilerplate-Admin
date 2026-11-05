import {useToast} from 'vue-toast-notification';
import 'vue-toast-notification/dist/theme-sugar.css';

/**
 * 토스트 메시지
 *  - 사용: import {toast} from '@/utils'; toast.success('저장되었습니다.');
 *  - 컴포넌트 밖(axios 인터셉터 등)에서도 사용 가능
 */
const $toast = useToast({
    position: 'top-right',
    duration: 3000,
    dismissible: true,
    queue: false,
});

// 같은 메시지가 짧은 시간에 연속 노출되는 것 방지 (동시 요청 여러 개가 같은 에러를 받을 때)
let lastMessage = '';
let lastAt = 0;
const open = (type, message, options = {}) => {
    if (!message) return;
    const now = Date.now();
    if (message === lastMessage && now - lastAt < 1000) return;
    lastMessage = message;
    lastAt = now;
    $toast.open({type, message, ...options});
};

const toast = {
    success: (message, options) => open('success', message, options),
    error: (message, options) => open('error', message, {duration: 5000, ...options}),
    warning: (message, options) => open('warning', message, options),
    info: (message, options) => open('info', message, options),
    clear: () => $toast.clear(),
};

export default toast;
