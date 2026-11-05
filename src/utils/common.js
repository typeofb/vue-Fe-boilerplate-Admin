import {toRaw} from 'vue';

/**
 * 범용 유틸 (빈 값 체크, 깊은 복사, debounce/throttle 등)
 */

/** null / undefined / '' / 빈 배열 / 빈 객체 → true (0, false 는 값으로 취급) */
export const isEmpty = (value) => {
    if (value === null || value === undefined) return true;
    if (typeof value === 'string') return value.trim() === '';
    if (Array.isArray(value)) return value.length === 0;
    if (value instanceof Date) return Number.isNaN(value.getTime());
    if (typeof value === 'object') return Object.keys(value).length === 0;
    return false;
};

export const isNotEmpty = (value) => !isEmpty(value);

/** 깊은 복사 (Date, Map, Set, 순환참조 지원 / reactive 객체도 가능 / 함수 포함 시 JSON 방식으로 대체) */
export const deepClone = (value) => {
    if (value === null || typeof value !== 'object') return value;
    try {
        return structuredClone(toRaw(value));
    } catch {
        return JSON.parse(JSON.stringify(value));
    }
};

/** 검색 파라미터에서 빈 값 제거 (서버에 'undefined', '' 가 전달되지 않도록) */
export const cleanParams = (params = {}) => Object.fromEntries(Object.entries(params).filter(([, v]) => !isEmpty(v)));

/**
 * @param {Function} fn
 * @param {number} [wait=300]
 */
export const debounce = (fn, wait = 300) => {
    let timer = null;
    const debounced = (...args) => {
        clearTimeout(timer);
        timer = setTimeout(() => fn(...args), wait);
    };
    debounced.cancel = () => clearTimeout(timer);
    return debounced;
};

/**
 * @param {Function} fn
 * @param {number} [wait=300]
 */
export const throttle = (fn, wait = 300) => {
    let last = 0;
    let timer = null;
    return (...args) => {
        const now = Date.now();
        const remaining = wait - (now - last);
        if (remaining <= 0) {
            clearTimeout(timer);
            timer = null;
            last = now;
            fn(...args);
        } else if (!timer) {
            timer = setTimeout(() => {
                last = Date.now();
                timer = null;
                fn(...args);
            }, remaining);
        }
    };
};

export const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

/** 고유 ID (DOM id, key 용) */
export const uid = (prefix = 'uid') => `${prefix}-${Math.random().toString(36).slice(2, 10)}`;

/** 옵션 배열에서 value 로 label 찾기 */
export const findLabel = (options = [], value, fallback = '-') =>
    options.find((o) => o.value === value)?.label ?? fallback;
