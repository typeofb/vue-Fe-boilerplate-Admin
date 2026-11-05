import {createVuetify} from 'vuetify';
import {ko} from 'vuetify/locale';
import '@mdi/font/css/materialdesignicons.css';
import 'vuetify/styles';

/**
 * Vuetify 설정 (UI 라이브러리 테마 커스터마이징)
 *  - 색상: themes.light / themes.dark (SCSS 변수 _variables.scss 와 맞춰 주세요)
 *  - defaults: 모든 컴포넌트의 기본 props → 화면마다 variant/density 를 반복 지정하지 않도록
 */
const brand = {
    primary: '#2563eb',
    secondary: '#475569',
    success: '#16a34a',
    warning: '#f59e0b',
    error: '#dc2626',
    info: '#0ea5e9',
};

export default createVuetify({
    locale: {
        locale: 'ko',
        fallback: 'ko',
        messages: {ko},
    },
    date: {
        locale: {ko: 'ko-KR'},
    },
    theme: {
        defaultTheme: 'light',
        themes: {
            light: {
                dark: false,
                colors: {
                    ...brand,
                    background: '#f4f6fa',
                    surface: '#ffffff',
                },
            },
            dark: {
                dark: true,
                colors: {
                    ...brand,
                    primary: '#60a5fa',
                    background: '#0f172a',
                    surface: '#1e293b',
                },
            },
        },
    },
    defaults: {
        global: {
            ripple: false,
        },
        VTextField: {variant: 'outlined', density: 'compact', color: 'primary', hideDetails: 'auto'},
        VTextarea: {variant: 'outlined', density: 'compact', color: 'primary', hideDetails: 'auto'},
        VSelect: {variant: 'outlined', density: 'compact', color: 'primary', hideDetails: 'auto'},
        VAutocomplete: {variant: 'outlined', density: 'compact', color: 'primary', hideDetails: 'auto'},
        VCheckbox: {density: 'compact', color: 'primary', hideDetails: 'auto'},
        VRadioGroup: {density: 'compact', color: 'primary', hideDetails: 'auto'},
        VSwitch: {density: 'compact', color: 'primary', hideDetails: 'auto', inset: true},
        VBtn: {variant: 'flat', class: 'text-none'},
        VCard: {elevation: 0, rounded: 'lg'},
        VDataTableServer: {density: 'comfortable', hover: true},
        VDataTable: {density: 'comfortable', hover: true},
        VTooltip: {location: 'top'},
    },
});
