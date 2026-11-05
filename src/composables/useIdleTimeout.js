import {onBeforeUnmount, onMounted, ref} from 'vue';
import {throttle} from '@/utils/common';

/**
 * 미사용(유휴) 감지 → 세션 타임아웃
 *
 *  useIdleTimeout({
 *      timeoutMin: 30,
 *      warnBeforeSec: 60,
 *      onWarn: (remainSec) => ...,   // 만료 N초 전 알림
 *      onTimeout: () => logout(),
 *  });
 *
 *  - 여러 탭에서 동시에 사용 중이면 마지막 활동 시간을 localStorage 로 공유
 */
const STORAGE_KEY = 'idle:lastActive';
const EVENTS = ['mousemove', 'mousedown', 'keydown', 'scroll', 'touchstart', 'wheel'];

export function useIdleTimeout({timeoutMin, warnBeforeSec = 60, onWarn, onTimeout} = {}) {
    const remainSec = ref(timeoutMin * 60);
    const isWarning = ref(false);
    let timer = null;

    const now = () => Date.now();
    const getLastActive = () => Number(localStorage.getItem(STORAGE_KEY)) || now();

    const markActive = throttle(() => {
        try {
            localStorage.setItem(STORAGE_KEY, String(now()));
        } catch {
            /* noop */
        }
        isWarning.value = false;
    }, 1000);

    const tick = () => {
        const elapsedSec = Math.floor((now() - getLastActive()) / 1000);
        remainSec.value = Math.max(0, timeoutMin * 60 - elapsedSec);

        if (remainSec.value <= 0) {
            stop();
            onTimeout?.();
        } else if (remainSec.value <= warnBeforeSec && !isWarning.value) {
            isWarning.value = true;
            onWarn?.(remainSec.value);
        }
    };

    const start = () => {
        if (!timeoutMin) return;
        markActive();
        EVENTS.forEach((e) => window.addEventListener(e, markActive, {passive: true}));
        timer = setInterval(tick, 1000);
    };

    const stop = () => {
        clearInterval(timer);
        timer = null;
        EVENTS.forEach((e) => window.removeEventListener(e, markActive));
    };

    onMounted(start);
    onBeforeUnmount(stop);

    return {remainSec, isWarning, reset: markActive, stop};
}
