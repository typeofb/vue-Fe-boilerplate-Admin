import js from '@eslint/js';
import pluginVue from 'eslint-plugin-vue';
import prettierConfig from 'eslint-config-prettier';
import globals from 'globals';

/**
 * ESLint (flat config)
 *  - 코드 품질은 ESLint, 포맷은 Prettier 가 담당 (eslint-config-prettier 로 충돌 규칙 off)
 */
export default [
    {
        ignores: ['dist/**', 'node_modules/**', 'public/**', 'coverage/**'],
    },
    js.configs.recommended,
    ...pluginVue.configs['flat/recommended'],
    {
        files: ['**/*.{js,vue}'],
        languageOptions: {
            ecmaVersion: 'latest',
            sourceType: 'module',
            globals: {
                ...globals.browser,
                ...globals.node,
            },
        },
        rules: {
            // ---- 일반 ----
            'no-console': ['warn', {allow: ['warn', 'error']}],
            'no-debugger': 'warn',
            'no-unused-vars': ['warn', {argsIgnorePattern: '^_', varsIgnorePattern: '^_', caughtErrors: 'none'}],
            'prefer-const': 'warn',
            eqeqeq: ['error', 'always', {null: 'ignore'}],

            // ---- Vue 네이밍 컨벤션 ----
            // 컴포넌트 파일/이름: PascalCase, 템플릿 사용: PascalCase
            'vue/multi-word-component-names': ['error', {ignores: ['App']}],
            'vue/component-name-in-template-casing': [
                'error',
                'PascalCase',
                {
                    registeredComponentsOnly: false,
                    ignores: ['/^v-/', 'router-view', 'router-link', 'keep-alive', 'transition', 'component'],
                },
            ],
            'vue/component-definition-name-casing': ['error', 'PascalCase'],
            // props: camelCase 선언 / 템플릿은 kebab-case
            'vue/prop-name-casing': ['error', 'camelCase'],
            'vue/attribute-hyphenation': ['error', 'always'],
            // 이벤트: kebab-case 또는 update:xxx
            'vue/custom-event-name-casing': ['error', 'camelCase', {ignores: ['/^update:/', '/^click:/']}],
            'vue/require-default-prop': 'off',
            'vue/no-v-html': 'error', // XSS: v-dompurify-html 사용
            'vue/block-order': ['error', {order: ['template', 'script', 'style']}],
        },
    },
    prettierConfig,
];
