import dayjs from '@/plugins/dayjs';
import {DATE_FORMAT} from '@/config';

/**
 * 표시용 포맷 함수 (날짜, 숫자, 금액, 전화번호, 사업자번호, 파일 크기)
 *  - 값이 없으면 fallback('-') 을 반환해 템플릿에서 바로 사용 가능
 */

// ---------------- 날짜 ----------------
export const formatDate = (value, format = DATE_FORMAT.DATE, fallback = '-') => {
    if (!value) return fallback;
    const d = dayjs(value);
    return d.isValid() ? d.format(format) : fallback;
};

export const formatDateTime = (value, fallback = '-') => formatDate(value, DATE_FORMAT.DATETIME, fallback);

/** '3분 전', '2일 전' */
export const fromNow = (value, fallback = '-') => (value ? dayjs(value).fromNow() : fallback);

/**
 * 기간 프리셋 → [시작일, 종료일] ('YYYY-MM-DD')
 * @param {'today'|'1w'|'1m'|'3m'|'6m'|'1y'} preset
 */
export const getDateRange = (preset, base = dayjs()) => {
    const end = dayjs(base);
    const map = {
        today: end,
        '1w': end.subtract(1, 'week'),
        '1m': end.subtract(1, 'month'),
        '3m': end.subtract(3, 'month'),
        '6m': end.subtract(6, 'month'),
        '1y': end.subtract(1, 'year'),
    };
    return [(map[preset] || end).format(DATE_FORMAT.DATE), end.format(DATE_FORMAT.DATE)];
};

// ---------------- 숫자 / 금액 ----------------
/** 1234567.8 → '1,234,567.8' */
export const formatNumber = (value, {fallback = '-', fractionDigits} = {}) => {
    if (value === null || value === undefined || value === '') return fallback;
    const num = Number(String(value).replace(/,/g, ''));
    if (Number.isNaN(num)) return fallback;
    return num.toLocaleString(
        'ko-KR',
        fractionDigits !== undefined ? {maximumFractionDigits: fractionDigits} : undefined,
    );
};

/** 15000 → '15,000원' */
export const formatCurrency = (value, unit = '원', fallback = '-') => {
    const formatted = formatNumber(value, {fallback: null, fractionDigits: 0});
    return formatted === null ? fallback : `${formatted}${unit}`;
};

/** '1,234' → 1234 */
export const unformatNumber = (value) => {
    const num = Number(String(value ?? '').replace(/[^\d.-]/g, ''));
    return Number.isNaN(num) ? 0 : num;
};

export const formatPercent = (value, digits = 1, fallback = '-') =>
    value === null || value === undefined || value === '' ? fallback : `${Number(value).toFixed(digits)}%`;

// ---------------- 문자열 ----------------
/** 01012345678 → 010-1234-5678 / 0212345678 → 02-1234-5678 */
export const formatPhone = (value, fallback = '-') => {
    if (!value) return fallback;
    const n = String(value).replace(/\D/g, '');
    if (n.startsWith('02')) return n.replace(/^(02)(\d{3,4})(\d{4})$/, '$1-$2-$3');
    if (n.length === 8) return n.replace(/^(\d{4})(\d{4})$/, '$1-$2'); // 1588-0000
    return n.replace(/^(\d{3})(\d{3,4})(\d{4})$/, '$1-$2-$3');
};

/** 1234567890 → 123-45-67890 */
export const formatBizNo = (value, fallback = '-') => {
    if (!value) return fallback;
    return String(value)
        .replace(/\D/g, '')
        .replace(/^(\d{3})(\d{2})(\d{5})$/, '$1-$2-$3');
};

/** 1536000 → '1.46 MB' */
export const formatFileSize = (bytes, fallback = '-') => {
    if (bytes === null || bytes === undefined || Number.isNaN(Number(bytes))) return fallback;
    if (bytes === 0) return '0 B';
    const units = ['B', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), units.length - 1);
    return `${(bytes / 1024 ** i).toFixed(i === 0 ? 0 : 2)} ${units[i]}`;
};

/** Y/N → 사용/미사용 */
export const formatYn = (value, [yes, no] = ['사용', '미사용']) => (value === 'Y' || value === true ? yes : no);
