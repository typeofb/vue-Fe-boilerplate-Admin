import {toast} from '@/utils';

/**
 * 전역 에러 처리 + 모니터링 연동 지점
 *
 *  - app.config.errorHandler : 컴포넌트 렌더/라이프사이클/이벤트 핸들러 에러
 *  - unhandledrejection      : await 누락 등 처리되지 않은 Promise 에러
 *  - API 에러는 http 인터셉터에서 이미 토스트를 띄웠으므로 (error.handled) 중복 노출하지 않습니다.
 *
 * Sentry 연동 방법
 *  1) npm i @sentry/vue
 *  2) .env.* 에 VITE_SENTRY_DSN 설정
 *  3) 아래 initMonitoring 주석 해제
 */
const isIgnorable = (error) => error?.isCanceled || error?.isDuplicate;

/** 모니터링 서비스로 에러 전송 */
export const reportError = (error, context = {}) => {
    if (isIgnorable(error)) return;
    if (import.meta.env.DEV) {
        console.error('[Error]', error, context);
    }
    // Sentry.captureException(error, {extra: context});
};

// eslint-disable-next-line no-unused-vars
const initMonitoring = async (app, router) => {
    const dsn = import.meta.env.VITE_SENTRY_DSN;
    if (!dsn) return;
    // const Sentry = await import('@sentry/vue');
    // Sentry.init({
    //     app,
    //     dsn,
    //     environment: import.meta.env.MODE,
    //     integrations: [Sentry.browserTracingIntegration({router})],
    //     tracesSampleRate: 0.1,
    // });
};

export const setupErrorHandler = (app, router) => {
    initMonitoring(app, router);

    app.config.errorHandler = (error, instance, info) => {
        reportError(error, {info, component: instance?.$options?.name || instance?.$options?.__name});
        if (!error?.handled && !isIgnorable(error)) {
            toast.error('화면 처리 중 오류가 발생했습니다.');
        }
    };

    if (import.meta.env.DEV) {
        app.config.warnHandler = (msg, _instance, trace) => console.warn(`[Vue warn] ${msg}${trace}`);
    }

    window.addEventListener('unhandledrejection', (event) => {
        const error = event.reason;
        if (isIgnorable(error) || error?.handled) {
            event.preventDefault();
            return;
        }
        reportError(error, {type: 'unhandledrejection'});
    });

    window.addEventListener('error', (event) => {
        reportError(event.error || event.message, {type: 'window.error'});
    });
};
