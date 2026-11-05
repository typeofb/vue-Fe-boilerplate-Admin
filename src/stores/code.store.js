import {reactive} from 'vue';
import {defineStore} from 'pinia';
import {codeApi} from '@/api/code.api';

/**
 * 공통코드 캐시
 *  - 그룹 단위로 1회 조회 후 메모리 캐싱 (로그아웃 시 clear)
 *  - 동시에 같은 그룹을 요청하면 진행 중인 Promise 를 공유
 *  - 화면에서는 useCommonCode() composable 사용을 권장
 */
const CACHE_TTL = 1000 * 60 * 30; // 30분

export const useCodeStore = defineStore('code', () => {
    /** @type {Record<string, import('@/types').CommonCode[]>} */
    const codes = reactive({});
    const fetchedAt = {};
    const inflight = new Map();

    const isFresh = (group) => codes[group] && Date.now() - (fetchedAt[group] || 0) < CACHE_TTL;

    /**
     * @param {string} group
     * @param {{force?: boolean}} [options]
     * @returns {Promise<import('@/types').CommonCode[]>}
     */
    const fetchCodes = (group, {force = false} = {}) => {
        if (!force && isFresh(group)) return Promise.resolve(codes[group]);
        if (inflight.has(group)) return inflight.get(group);

        const promise = codeApi
            .getCodes(group)
            .then((list) => {
                codes[group] = Array.isArray(list) ? list : [];
                fetchedAt[group] = Date.now();
                return codes[group];
            })
            .catch(() => codes[group] || [])
            .finally(() => inflight.delete(group));

        inflight.set(group, promise);
        return promise;
    };

    /** 여러 그룹 병렬 조회 */
    const fetchGroups = (groups = []) => Promise.all(groups.map((g) => fetchCodes(g)));

    const getCodes = (group) => codes[group] || [];

    /** 코드 → 코드명 */
    const getName = (group, code, fallback = '-') => getCodes(group).find((c) => c.code === code)?.name ?? fallback;

    /** 셀렉트 옵션 형식으로 변환 {label, value} */
    const toOptions = (group) => getCodes(group).map((c) => ({label: c.name, value: c.code}));

    const clear = () => {
        Object.keys(codes).forEach((k) => delete codes[k]);
        Object.keys(fetchedAt).forEach((k) => delete fetchedAt[k]);
        inflight.clear();
    };

    return {codes, fetchCodes, fetchGroups, getCodes, getName, toOptions, clear};
});
