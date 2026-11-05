import {STORAGE_PREFIX} from '@/config';

/**
 * localStorage / sessionStorage 안전 래퍼
 *  - 키 prefix 자동 부여, JSON 직렬화, 만료(ttl) 지원
 *  - 시크릿 모드 / 저장소 차단 환경에서도 예외로 앱이 멈추지 않도록 처리
 */
const createStorage = (getStore) => {
    const key = (k) => `${STORAGE_PREFIX}:${k}`;

    return {
        /** @param {string} k @param {*} [defaultValue] */
        get(k, defaultValue = null) {
            try {
                const raw = getStore().getItem(key(k));
                if (raw === null) return defaultValue;
                const {value, expires} = JSON.parse(raw);
                if (expires && Date.now() > expires) {
                    getStore().removeItem(key(k));
                    return defaultValue;
                }
                return value;
            } catch {
                return defaultValue;
            }
        },
        /** @param {string} k @param {*} value @param {number} [ttlMs] 만료(ms) */
        set(k, value, ttlMs) {
            try {
                const payload = {value, expires: ttlMs ? Date.now() + ttlMs : null};
                getStore().setItem(key(k), JSON.stringify(payload));
            } catch {
                /* noop */
            }
        },
        remove(k) {
            try {
                getStore().removeItem(key(k));
            } catch {
                /* noop */
            }
        },
        /** prefix 가 붙은 키만 삭제 */
        clear() {
            try {
                const store = getStore();
                Object.keys(store)
                    .filter((k) => k.startsWith(`${STORAGE_PREFIX}:`))
                    .forEach((k) => store.removeItem(k));
            } catch {
                /* noop */
            }
        },
    };
};

export const local = createStorage(() => window.localStorage);
export const session = createStorage(() => window.sessionStorage);

export default local;
