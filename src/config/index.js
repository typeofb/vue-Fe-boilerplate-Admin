/**
 * 앱 전역 상수
 *  - 환경별로 달라지는 값은 .env.* 에, 코드 레벨 상수는 이 파일에 둡니다.
 */
const env = import.meta.env;

export const APP_TITLE = env.VITE_APP_TITLE || 'Admin';
export const STORAGE_PREFIX = env.VITE_STORAGE_PREFIX || 'app';

export const API_CONFIG = {
    BASE_URL: env.VITE_API_BASE_URL || '/api',
    TIMEOUT: Number(env.VITE_API_TIMEOUT) || 30000,
    USE_MOCK: env.VITE_USE_MOCK === 'true',
};

/**
 * 백엔드와 합의한 응답 포맷: { code, message, data }
 *  - SUCCESS_CODES 에 포함된 code 만 성공으로 처리합니다.
 */
export const RESPONSE_CODE = {
    SUCCESS_CODES: ['0000', 'SUCCESS', 200],
};

/** 인증 관련 API 경로 (토큰 재발급 로직에서 사용) */
export const AUTH_API = {
    LOGIN: '/auth/login',
    LOGOUT: '/auth/logout',
    REFRESH: '/auth/refresh',
    ME: '/auth/me',
};

/** 목록/페이징 기본값 - 서버와 page 시작값(0 or 1) 을 반드시 맞추세요. */
export const PAGINATION = {
    PAGE_START: 1,
    DEFAULT_SIZE: 10,
    SIZE_OPTIONS: [10, 20, 50, 100],
};

export const DATE_FORMAT = {
    DATE: 'YYYY-MM-DD',
    DATETIME: 'YYYY-MM-DD HH:mm',
    DATETIME_SEC: 'YYYY-MM-DD HH:mm:ss',
    MONTH: 'YYYY-MM',
};

/** 파일 업로드 기본 제한 */
export const UPLOAD = {
    MAX_SIZE_MB: 10,
    IMAGE_EXTENSIONS: ['jpg', 'jpeg', 'png', 'gif', 'webp'],
    DOCUMENT_EXTENSIONS: ['pdf', 'doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx', 'hwp', 'txt', 'zip'],
};

export const IDLE_TIMEOUT_MIN = Number(env.VITE_IDLE_TIMEOUT_MIN) || 0;

/** 역할 (서버 role 값과 동일하게 유지) */
export const ROLES = {
    ADMIN: 'ADMIN',
    MANAGER: 'MANAGER',
};
