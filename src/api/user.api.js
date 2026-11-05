import {request} from './http';

/**
 * 회원 API (도메인별 API 모듈 예시)
 *
 * 규칙
 *  - 파일명: {domain}.api.js / export 이름: {domain}Api
 *  - 메서드명: getList / getDetail / create / update / remove / download...
 *  - URL, 파라미터 가공은 이 파일에서만 → 화면은 비즈니스 로직에 집중
 */
const BASE = '/users';

export const userApi = {
    /**
     * @param {import('@/types').PageRequest & {keyword?: string, status?: string}} params
     * @param {import('@/types').RequestOptions} [options]
     * @returns {Promise<import('@/types').PageResponse<Object>>}
     */
    getList: (params, options) => request.get(BASE, params, options),

    getDetail: (id) => request.get(`${BASE}/${id}`),

    create: (payload) => request.post(BASE, payload),

    update: (id, payload) => request.put(`${BASE}/${id}`, payload),

    /** @param {Array<string|number>} ids */
    remove: (ids) => request.delete(BASE, null, {data: {ids}}),

    checkLoginId: (loginId) => request.get(`${BASE}/check-login-id`, {loginId}, {loading: false}),

    /** 검색 조건 그대로 엑셀(CSV) 다운로드 */
    downloadExcel: (params) => request.download(`${BASE}/excel`, params, {filename: '회원목록.csv'}),

    /** 첨부 업로드 */
    uploadFiles: (id, files, onProgress) => request.upload(`${BASE}/${id}/files`, {files}, {onProgress}),
};
