import {ApiError} from './errors';

/**
 * 진행 중인 요청 관리 (중복 요청 방지 / 요청 취소)
 *
 *  - preventDuplicate (GET 외 기본 true) : 같은 요청이 진행 중이면 새 요청을 차단 → 버튼 연타 방지
 *  - cancelPrevious                     : 같은 요청이 진행 중이면 이전 요청을 취소 → 검색어 연속 입력 등
 *  - cancelOnRouteChange                : 화면 이동 시 취소 (router 에서 cancelRouteRequests 호출)
 *  - 직접 취소: const controller = new AbortController(); request.get(url, params, {signal: controller.signal})
 */

/** @type {Map<string, Set<{controller: AbortController|null, cancelOnRouteChange: boolean}>>} */
const pending = new Map();

const stringify = (value) => {
    if (value === undefined || value === null) return '';
    if (typeof FormData !== 'undefined' && value instanceof FormData) return '[FormData]';
    if (typeof value === 'string') return value;
    try {
        return JSON.stringify(value);
    } catch {
        return '';
    }
};

export const getRequestKey = (config) => {
    const method = (config.method || 'get').toLowerCase();
    return [method, config.url, stringify(config.params), method === 'get' ? '' : stringify(config.data)].join('|');
};

export const addPending = (config) => {
    const key = getRequestKey(config);
    const entries = pending.get(key) || new Set();
    const method = (config.method || 'get').toLowerCase();
    const preventDuplicate = config.preventDuplicate ?? method !== 'get';

    if (entries.size > 0 && !config._retry) {
        if (config.cancelPrevious) {
            entries.forEach((entry) => entry.controller?.abort());
            entries.clear();
        } else if (preventDuplicate) {
            throw new ApiError({message: '이미 처리 중인 요청입니다.', isDuplicate: true});
        }
    }

    // 호출부에서 signal 을 넘기지 않은 경우에만 직접 관리 (취소 가능하도록)
    let controller = null;
    if (!config.signal || config._managedSignal) {
        controller = new AbortController();
        config.signal = controller.signal;
        config._managedSignal = true;
    }

    const entry = {controller, cancelOnRouteChange: !!config.cancelOnRouteChange};
    entries.add(entry);
    pending.set(key, entries);
    config._pendingKey = key;
    config._pendingEntry = entry;
};

export const removePending = (config) => {
    if (!config?._pendingKey) return;
    const entries = pending.get(config._pendingKey);
    if (entries) {
        entries.delete(config._pendingEntry);
        if (entries.size === 0) pending.delete(config._pendingKey);
    }
    config._pendingKey = null;
    config._pendingEntry = null;
};

/** 진행 중인 모든 요청 취소 (로그아웃 시) */
export const cancelAllRequests = () => {
    pending.forEach((entries) => entries.forEach((entry) => entry.controller?.abort()));
    pending.clear();
};

/** cancelOnRouteChange 로 표시된 요청만 취소 (화면 이동 시) */
export const cancelRouteRequests = () => {
    pending.forEach((entries, key) => {
        entries.forEach((entry) => {
            if (!entry.cancelOnRouteChange) return;
            entry.controller?.abort();
            entries.delete(entry);
        });
        if (entries.size === 0) pending.delete(key);
    });
};
