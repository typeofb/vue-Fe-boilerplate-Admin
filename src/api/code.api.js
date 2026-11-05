import {request} from './http';

/**
 * 공통코드 API
 */
export const codeApi = {
    /**
     * @param {string} groupCode 예) USER_STATUS
     * @returns {Promise<import('@/types').CommonCode[]>}
     */
    getCodes: (groupCode) => request.get(`/codes/${groupCode}`, null, {loading: false}),

    /** 여러 그룹 한 번에 조회 → { USER_STATUS: [...], ROLE: [...] } */
    getCodesByGroups: (groupCodes) => request.get('/codes', {groups: groupCodes.join(',')}, {loading: false}),
};
