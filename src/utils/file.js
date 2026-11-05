/**
 * 파일 다운로드 / 검증 유틸
 */

/**
 * Content-Disposition 헤더에서 파일명 추출
 *  - filename*=UTF-8''%ED%95%9C%EA%B8%80.xlsx (RFC 5987) 우선
 *  - filename="한글.xlsx" / filename=report.xlsx
 */
export const parseFilename = (contentDisposition, fallback = 'download') => {
    if (!contentDisposition) return fallback;

    const utf8 = /filename\*\s*=\s*(?:UTF-8|utf-8)''([^;]+)/i.exec(contentDisposition);
    if (utf8?.[1]) {
        try {
            return decodeURIComponent(utf8[1].trim().replace(/^"|"$/g, ''));
        } catch {
            /* fallthrough */
        }
    }

    const plain = /filename\s*=\s*("?)([^";]+)\1/i.exec(contentDisposition);
    if (plain?.[2]) {
        try {
            return decodeURIComponent(plain[2].trim());
        } catch {
            return plain[2].trim();
        }
    }
    return fallback;
};

/** Blob 을 파일로 저장 */
export const saveBlob = (blob, filename = 'download') => {
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.style.display = 'none';
    document.body.appendChild(a);
    a.click();
    a.remove();
    // 일부 브라우저에서 click 직후 revoke 하면 다운로드가 취소되므로 지연
    setTimeout(() => window.URL.revokeObjectURL(url), 1000);
};

/** URL 로 바로 다운로드 (인증이 필요 없는 정적 파일) */
export const downloadByUrl = (url, filename = '') => {
    const a = document.createElement('a');
    a.href = url;
    if (filename) a.download = filename;
    a.target = '_blank';
    a.rel = 'noopener';
    document.body.appendChild(a);
    a.click();
    a.remove();
};

/** 'report.final.XLSX' → 'xlsx' */
export const getExtension = (filename = '') => {
    const idx = filename.lastIndexOf('.');
    return idx > -1 ? filename.slice(idx + 1).toLowerCase() : '';
};

/**
 * 업로드 파일 검증
 * @param {File} file
 * @param {{maxSizeMB?: number, extensions?: string[]}} options
 * @returns {string|null} 오류 메시지 (통과 시 null)
 */
export const validateFile = (file, {maxSizeMB, extensions} = {}) => {
    if (extensions?.length) {
        const ext = getExtension(file.name);
        if (!extensions.map((e) => e.toLowerCase()).includes(ext)) {
            return `허용되지 않는 파일 형식입니다. (${extensions.join(', ')})`;
        }
    }
    if (maxSizeMB && file.size > maxSizeMB * 1024 * 1024) {
        return `파일 크기는 ${maxSizeMB}MB 이하만 가능합니다. (${file.name})`;
    }
    return null;
};

/** Blob(JSON) 을 객체로 - 파일 다운로드 API 가 에러를 JSON 으로 내려줄 때 사용 */
export const blobToJson = async (blob) => {
    try {
        return JSON.parse(await blob.text());
    } catch {
        return null;
    }
};
