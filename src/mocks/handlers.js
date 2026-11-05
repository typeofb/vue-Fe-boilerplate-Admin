/**
 * Mock 데이터 / 핸들러
 *  - 계정: admin / admin1234!   (ADMIN, 전체 권한)
 *          manager / manager1234! (MANAGER, 조회만 가능 → 메뉴/버튼 권한 확인용)
 *  - accessToken 유효시간 60초 → 1분 후 API 호출 시 refresh 자동 재발급 흐름 확인 가능
 */
const ACCESS_TTL = 60 * 1000;

const ok = (data, message = 'OK') => ({status: 200, data: {code: '0000', message, data}});
const fail = (status, code, message) => ({status, data: {code, message, data: null}});

// ---------------------------------------------------------------- 계정
const accounts = [
    {
        id: 1,
        loginId: 'admin',
        password: 'admin1234!',
        name: '관리자',
        roles: ['ADMIN'],
        permissions: ['USER_VIEW', 'USER_EDIT', 'USER_DELETE', 'USER_EXCEL'],
    },
    {
        id: 2,
        loginId: 'manager',
        password: 'manager1234!',
        name: '매니저',
        roles: ['MANAGER'],
        permissions: ['USER_VIEW'],
    },
];

const issueTokens = (accountId) => ({
    accessToken: `mock-access.${accountId}.${Date.now() + ACCESS_TTL}`,
    refreshToken: `mock-refresh.${accountId}`,
});

/** 토큰 검증 → account | 401 응답 */
const auth = (token) => {
    const [type, id, exp] = (token || '').split('.');
    if (type !== 'mock-access') return {error: fail(401, 'AUTH_REQUIRED', '로그인이 필요합니다.')};
    if (Date.now() > Number(exp)) return {error: fail(401, 'AUTH_TOKEN_EXPIRED', '토큰이 만료되었습니다.')};
    const account = accounts.find((a) => a.id === Number(id));
    return account ? {account} : {error: fail(401, 'AUTH_REQUIRED', '로그인이 필요합니다.')};
};

const guard = (permission, fn) => (req) => {
    const {account, error} = auth(req.token);
    if (error) return error;
    if (permission && !account.permissions.includes(permission)) {
        return fail(403, 'FORBIDDEN', '해당 기능에 대한 권한이 없습니다.');
    }
    return fn(req, account);
};

// ---------------------------------------------------------------- 공통코드
const codes = {
    USER_STATUS: [
        {code: 'ACTIVE', name: '정상', sort: 1},
        {code: 'DORMANT', name: '휴면', sort: 2},
        {code: 'LOCKED', name: '잠금', sort: 3},
        {code: 'WITHDRAWN', name: '탈퇴', sort: 4},
    ],
    USER_GRADE: [
        {code: 'BASIC', name: '일반'},
        {code: 'SILVER', name: '실버'},
        {code: 'GOLD', name: '골드'},
        {code: 'VIP', name: 'VIP'},
    ],
};

// ---------------------------------------------------------------- 회원
const LAST_NAMES = ['김', '이', '박', '최', '정', '강', '조', '윤', '장', '임'];
const FIRST_NAMES = ['민준', '서연', '도윤', '하은', '시우', '지유', '주원', '서윤', '예준', '지민', '하준', '수아'];
const statusCodes = codes.USER_STATUS.map((c) => c.code);
const gradeCodes = codes.USER_GRADE.map((c) => c.code);
const pad = (n) => String(n).padStart(2, '0');

let users = Array.from({length: 87}, (_, i) => {
    const id = i + 1;
    const joined = new Date(Date.now() - id * 86400000 * 3);
    return {
        id,
        loginId: `user${String(id).padStart(3, '0')}`,
        name: LAST_NAMES[id % LAST_NAMES.length] + FIRST_NAMES[id % FIRST_NAMES.length],
        email: `user${id}@example.com`,
        phone: `010${String(10000000 + id * 7919).slice(0, 8)}`,
        status: statusCodes[id % 7 === 0 ? 2 : id % 5 === 0 ? 1 : 0],
        grade: gradeCodes[id % gradeCodes.length],
        point: (id * 1370) % 100000,
        smsYn: id % 3 === 0 ? 'N' : 'Y',
        joinedAt: `${joined.getFullYear()}-${pad(joined.getMonth() + 1)}-${pad(joined.getDate())}`,
        memo: '',
    };
});
let nextId = users.length + 1;

const filterUsers = (q) => {
    let list = [...users];
    if (q.keyword) {
        const kw = String(q.keyword).toLowerCase();
        list = list.filter((u) => [u.name, u.loginId, u.email, u.phone].some((v) => v.toLowerCase().includes(kw)));
    }
    if (q.status) list = list.filter((u) => u.status === q.status);
    if (q.grade) list = list.filter((u) => u.grade === q.grade);
    if (q.startDate) list = list.filter((u) => u.joinedAt >= q.startDate);
    if (q.endDate) list = list.filter((u) => u.joinedAt <= q.endDate);
    if (q.sort) {
        const [key, order] = q.sort.split(',');
        list.sort((a, b) => (a[key] > b[key] ? 1 : a[key] < b[key] ? -1 : 0) * (order === 'desc' ? -1 : 1));
    } else {
        list.sort((a, b) => b.id - a.id);
    }
    return list;
};

const validateUser = (body, id) => {
    if (!body?.loginId || !body?.name) return fail(400, 'INVALID_PARAM', '필수 항목을 입력해 주세요.');
    if (users.some((u) => u.loginId === body.loginId && u.id !== id)) {
        return fail(200, 'DUPLICATE_LOGIN_ID', '이미 사용 중인 아이디입니다.'); // HTTP 200 + 업무 에러 예시
    }
    return null;
};

// ---------------------------------------------------------------- handlers
export const handlers = [
    // ---- 인증 ----
    {
        method: 'post',
        path: '/auth/login',
        handle: ({body}) => {
            const account = accounts.find((a) => a.loginId === body?.loginId && a.password === body?.password);
            if (!account) return fail(401, 'AUTH_INVALID', '아이디 또는 비밀번호가 올바르지 않습니다.');
            return ok(issueTokens(account.id));
        },
    },
    {
        method: 'post',
        path: '/auth/refresh',
        handle: ({body}) => {
            const [type, id] = (body?.refreshToken || '').split('.');
            if (type !== 'mock-refresh') return fail(401, 'AUTH_REFRESH_INVALID', '세션이 만료되었습니다.');
            console.warn('[mock] accessToken 재발급');
            return ok(issueTokens(Number(id)));
        },
    },
    {method: 'post', path: '/auth/logout', handle: () => ok(null)},
    {
        method: 'get',
        path: '/auth/me',
        handle: guard(null, (_req, account) => {
            // eslint-disable-next-line no-unused-vars
            const {password, ...me} = account;
            return ok(me);
        }),
    },

    // ---- 공통코드 ----
    {
        method: 'get',
        path: '/codes/:group',
        handle: guard(null, ({params}) => ok(codes[params.group] || [])),
    },

    // ---- 회원 ----
    {
        method: 'get',
        path: '/users',
        handle: guard('USER_VIEW', ({query}) => {
            const list = filterUsers(query);
            const page = Number(query.page) || 1;
            const size = Number(query.size) || 10;
            return ok({list: list.slice((page - 1) * size, page * size), totalCount: list.length, page, size});
        }),
    },
    {
        method: 'get',
        path: '/users/excel',
        handle: guard('USER_EXCEL', ({query}) => {
            const rows = filterUsers(query);
            const header = ['ID', '아이디', '이름', '이메일', '휴대폰', '상태', '가입일'];
            const csv = [header, ...rows.map((u) => [u.id, u.loginId, u.name, u.email, u.phone, u.status, u.joinedAt])]
                .map((r) => r.map((v) => `"${String(v).replace(/"/g, '""')}"`).join(','))
                .join('\r\n');
            return {
                status: 200,
                data: new Blob(['﻿' + csv], {type: 'text/csv;charset=utf-8'}),
                headers: {'content-disposition': `attachment; filename*=UTF-8''${encodeURIComponent('회원목록.csv')}`},
            };
        }),
    },
    {
        method: 'get',
        path: '/users/check-login-id',
        handle: guard(null, ({query}) => ok({available: !users.some((u) => u.loginId === query.loginId)})),
    },
    {
        method: 'get',
        path: '/users/:id',
        handle: guard('USER_VIEW', ({params}) => {
            const user = users.find((u) => u.id === Number(params.id));
            return user ? ok({...user, files: []}) : fail(404, 'NOT_FOUND', '회원 정보를 찾을 수 없습니다.');
        }),
    },
    {
        method: 'post',
        path: '/users',
        handle: guard('USER_EDIT', ({body}) => {
            const invalid = validateUser(body);
            if (invalid) return invalid;
            const user = {
                ...body,
                id: nextId++,
                point: 0,
                joinedAt: new Date().toISOString().slice(0, 10),
            };
            delete user.password;
            delete user.passwordConfirm;
            users.unshift(user);
            return ok({id: user.id}, '등록되었습니다.');
        }),
    },
    {
        method: 'put',
        path: '/users/:id',
        handle: guard('USER_EDIT', ({params, body}) => {
            const id = Number(params.id);
            const index = users.findIndex((u) => u.id === id);
            if (index < 0) return fail(404, 'NOT_FOUND', '회원 정보를 찾을 수 없습니다.');
            const invalid = validateUser(body, id);
            if (invalid) return invalid;
            // eslint-disable-next-line no-unused-vars
            const {password, passwordConfirm, ...rest} = body;
            users[index] = {...users[index], ...rest, id};
            return ok({id});
        }),
    },
    {
        method: 'delete',
        path: '/users',
        handle: guard('USER_DELETE', ({body}) => {
            const ids = (body?.ids || []).map(Number);
            users = users.filter((u) => !ids.includes(u.id));
            return ok({deleted: ids.length});
        }),
    },
    {
        method: 'post',
        path: '/users/:id/files',
        handle: guard('USER_EDIT', () => ok({uploaded: true})),
    },
];
