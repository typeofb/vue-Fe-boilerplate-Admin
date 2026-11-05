/**
 * 개인정보 마스킹
 *  ※ 화면 마스킹은 보조 수단입니다. 원칙적으로 서버에서 마스킹된 값을 내려주세요.
 */

/** 홍길동 → 홍*동, 홍길 → 홍*, 남궁길동 → 남**동 */
export const maskName = (name = '') => {
    if (!name) return '';
    if (name.length <= 2) return `${name[0]}*`;
    return `${name[0]}${'*'.repeat(name.length - 2)}${name[name.length - 1]}`;
};

/** 010-1234-5678 → 010-****-5678 */
export const maskPhone = (phone = '') => {
    const n = String(phone).replace(/\D/g, '');
    if (n.length < 9) return phone;
    const m = n.match(/^(02|\d{3})(\d{3,4})(\d{4})$/);
    return m ? `${m[1]}-${'*'.repeat(m[2].length)}-${m[3]}` : phone;
};

/** 900101-1234567 → 900101-1****** */
export const maskRrn = (rrn = '') => {
    const n = String(rrn).replace(/\D/g, '');
    if (n.length !== 13) return rrn;
    return `${n.slice(0, 6)}-${n[6]}******`;
};

/** 1234-5678-9012-3456 → 1234-****-****-3456 */
export const maskCard = (card = '') => {
    const n = String(card).replace(/\D/g, '');
    if (n.length < 12) return card;
    return `${n.slice(0, 4)}-****-****-${n.slice(-4)}`;
};

/** hong@example.com → ho**@example.com */
export const maskEmail = (email = '') => {
    const [id, domain] = String(email).split('@');
    if (!domain) return email;
    const visible = id.slice(0, Math.min(2, id.length));
    return `${visible}${'*'.repeat(Math.max(id.length - visible.length, 2))}@${domain}`;
};

/** 계좌번호 뒤 4자리만 노출 */
export const maskAccount = (account = '') => {
    const s = String(account);
    if (s.length <= 4) return s;
    return s.slice(0, -4).replace(/\d/g, '*') + s.slice(-4);
};
