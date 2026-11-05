import {isEmpty} from './common';

/**
 * 폼 유효성 검사 (Vuetify rules 방식으로 통일)
 *
 *  - 규칙 함수: (value) => true | '에러 메시지'
 *  - 사용: <BaseInput v-model="form.email" label="이메일" :rules="[rules.required(), rules.email()]" />
 *  - 폼 제출: const {valid} = await formRef.value.validate(); if (!valid) return;
 *
 *  메시지는 MESSAGES 한 곳에서 관리합니다. (다국어 도입 시 이 부분만 i18n 으로 교체)
 */

// ---------------- 정규식 ----------------
export const REGEX = {
    email: /^[\w.+-]+@[\w-]+(\.[\w-]+)+$/,
    mobile: /^01[016789]-?\d{3,4}-?\d{4}$/,
    tel: /^(0\d{1,2})-?\d{3,4}-?\d{4}$/,
    number: /^-?\d+$/,
    decimal: /^-?\d+(\.\d+)?$/,
    alphaNum: /^[a-zA-Z0-9]+$/,
    loginId: /^[a-zA-Z][a-zA-Z0-9_]{3,19}$/,
    url: /^https?:\/\/[^\s/$.?#].[^\s]*$/i,
};

// ---------------- 메시지 표준 ----------------
export const MESSAGES = {
    required: (label) => (label ? `${label}을(를) 입력해 주세요.` : '필수 입력 항목입니다.'),
    requiredSelect: (label) => (label ? `${label}을(를) 선택해 주세요.` : '필수 선택 항목입니다.'),
    email: '올바른 이메일 형식이 아닙니다.',
    mobile: '올바른 휴대폰 번호 형식이 아닙니다.',
    tel: '올바른 전화번호 형식이 아닙니다.',
    bizNo: '유효하지 않은 사업자등록번호입니다.',
    loginId: '아이디는 영문으로 시작하는 4~20자의 영문, 숫자, _ 만 사용할 수 있습니다.',
    password: '비밀번호는 영문, 숫자, 특수문자를 포함한 8~20자로 입력해 주세요.',
    passwordMatch: '비밀번호가 일치하지 않습니다.',
    number: '숫자만 입력해 주세요.',
    minLength: (n) => `${n}자 이상 입력해 주세요.`,
    maxLength: (n) => `${n}자 이하로 입력해 주세요.`,
    min: (n) => `${n} 이상 입력해 주세요.`,
    max: (n) => `${n} 이하로 입력해 주세요.`,
    url: '올바른 URL 형식이 아닙니다.',
    dateRange: '시작일은 종료일보다 이후일 수 없습니다.',
};

// ---------------- 순수 검증 함수 (화면 밖에서도 사용) ----------------
export const isEmail = (v) => REGEX.email.test(String(v));
export const isMobile = (v) => REGEX.mobile.test(String(v));

/** 사업자등록번호 체크섬 검증 (10자리) */
export const isBizNo = (value) => {
    const n = String(value).replace(/\D/g, '');
    if (n.length !== 10) return false;
    const weights = [1, 3, 7, 1, 3, 7, 1, 3, 5];
    let sum = weights.reduce((acc, w, i) => acc + Number(n[i]) * w, 0);
    sum += Math.floor((Number(n[8]) * 5) / 10);
    return (10 - (sum % 10)) % 10 === Number(n[9]);
};

/** 비밀번호 정책: 8~20자, 영문/숫자/특수문자 각 1개 이상, 동일문자 3회 연속 금지 */
export const isValidPassword = (value = '') => {
    const v = String(value);
    if (v.length < 8 || v.length > 20) return false;
    if (!/[a-zA-Z]/.test(v) || !/\d/.test(v) || !/[^a-zA-Z0-9\s]/.test(v)) return false;
    if (/(.)\1\1/.test(v)) return false;
    return true;
};

// ---------------- Vuetify rules ----------------
// 값이 비어 있으면 형식 검사는 통과시킵니다. (필수 여부는 required 로만 판단)
const optional = (check, message) => (v) => isEmpty(v) || check(v) || message;

export const rules = {
    required: (label) => (v) => !isEmpty(v) || MESSAGES.required(label),
    requiredSelect: (label) => (v) => !isEmpty(v) || MESSAGES.requiredSelect(label),
    email: () => optional(isEmail, MESSAGES.email),
    mobile: () => optional(isMobile, MESSAGES.mobile),
    tel: () => optional((v) => REGEX.tel.test(v), MESSAGES.tel),
    bizNo: () => optional(isBizNo, MESSAGES.bizNo),
    loginId: () => optional((v) => REGEX.loginId.test(v), MESSAGES.loginId),
    password: () => optional(isValidPassword, MESSAGES.password),
    /** @param {() => string} getTarget 비교 대상 값 getter */
    match:
        (getTarget, message = MESSAGES.passwordMatch) =>
        (v) =>
            v === getTarget() || message,
    number: () => optional((v) => REGEX.number.test(String(v)), MESSAGES.number),
    minLength: (n) => optional((v) => String(v).length >= n, MESSAGES.minLength(n)),
    maxLength: (n) => optional((v) => String(v).length <= n, MESSAGES.maxLength(n)),
    min: (n) => optional((v) => Number(v) >= n, MESSAGES.min(n)),
    max: (n) => optional((v) => Number(v) <= n, MESSAGES.max(n)),
    url: () => optional((v) => REGEX.url.test(v), MESSAGES.url),
    /** 커스텀: rules.custom((v) => v !== 'admin', '사용할 수 없는 값입니다.') */
    custom: (fn, message) => (v) => fn(v) || message,
};

export default rules;
