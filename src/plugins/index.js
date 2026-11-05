import {createPinia} from 'pinia';
import VueDOMPurifyHTML from 'vue-dompurify-html';
import vuetify from './vuetify';
import directives from '@/directives';
import baseComponents from '@/components';

export const pinia = createPinia();

/** 앱 플러그인 일괄 등록 (등록 순서: pinia → vuetify → 디렉티브/컴포넌트) */
export const registerPlugins = (app) => {
    app.use(pinia)
        .use(vuetify)
        .use(VueDOMPurifyHTML) // v-dompurify-html (v-html 대신 사용)
        .use(directives)
        .use(baseComponents);
};

export {vuetify};
export {default as dayjs} from './dayjs';
