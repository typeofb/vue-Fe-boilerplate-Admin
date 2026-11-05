import {createApp} from 'vue';
import App from './App.vue';
import router from './router';
import {registerPlugins} from './plugins';
import {setupErrorHandler} from './plugins/error-handler';
import {http, setAuthFailureHandler} from './api';
import {useUserStore} from './stores/user.store';
import {alert} from './utils/dialog';
import {ERROR_MESSAGES} from './api/errors';
import './assets/scss/main.scss';

async function bootstrap() {
    const app = createApp(App);

    registerPlugins(app);
    setupErrorHandler(app, router);

    // Mock API (VITE_USE_MOCK=true): 빌드 시 값이 정적으로 치환되어 false 면 mock 코드가 번들에서 제거됩니다.
    if (import.meta.env.VITE_USE_MOCK === 'true') {
        const {setupMock} = await import('./mocks');
        setupMock(http);
    }

    // 토큰 재발급 실패(세션 만료) 시: 로컬 상태 정리 → 로그인 화면 이동 → 안내
    setAuthFailureHandler(async () => {
        useUserStore().reset();
        const current = router.currentRoute.value;
        if (current.name !== 'Login') {
            await router.replace({name: 'Login', query: {redirect: current.fullPath}});
            alert(ERROR_MESSAGES.SESSION_EXPIRED);
        }
    });

    app.use(router);
    await router.isReady().catch(() => null);
    app.mount('#app');
}

bootstrap();
