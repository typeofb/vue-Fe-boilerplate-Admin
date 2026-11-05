import DOMPurify from 'dompurify';

/**
 * XSS 방지
 *  - 템플릿: v-html 대신 v-dompurify-html 디렉티브 사용 (eslint vue/no-v-html: error)
 *  - 스크립트에서 HTML 문자열을 다뤄야 할 때 sanitizeHtml() 사용
 */
export const sanitizeHtml = (html = '', options = {}) =>
    DOMPurify.sanitize(html, {USE_PROFILES: {html: true}, ...options});

/** 태그 제거 후 텍스트만 */
export const stripTags = (html = '') => DOMPurify.sanitize(html, {ALLOWED_TAGS: []});

/** 텍스트를 HTML 로 출력할 때 특수문자 이스케이프 */
export const escapeHtml = (text = '') =>
    String(text)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
