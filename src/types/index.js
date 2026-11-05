/**
 * 공통 타입 정의 (JSDoc)
 *  - JS 프로젝트에서도 IDE 자동완성/타입 힌트를 받기 위해 사용합니다.
 *  - 사용 예: @type {import('@/types').PageResponse<import('@/types').AuthUser>}
 */

/**
 * 표준 API 응답
 * @template T
 * @typedef {Object} ApiResponse
 * @property {string|number} code    - 결과 코드 (config RESPONSE_CODE.SUCCESS_CODES 참고)
 * @property {string} message        - 사용자 노출 가능한 메시지
 * @property {T} data                - 실제 데이터
 */

/**
 * 목록 요청 파라미터
 * @typedef {Object} PageRequest
 * @property {number} page           - 페이지 번호 (PAGINATION.PAGE_START 부터)
 * @property {number} size           - 페이지 크기
 * @property {string} [sort]         - 정렬 'field,asc' | 'field,desc'
 */

/**
 * 목록 응답 (ApiResponse.data)
 * @template T
 * @typedef {Object} PageResponse
 * @property {T[]} list
 * @property {number} totalCount
 * @property {number} page
 * @property {number} size
 */

/**
 * 공통코드
 * @typedef {Object} CommonCode
 * @property {string} code
 * @property {string} name
 * @property {number} [sort]
 * @property {'Y'|'N'} [useYn]
 */

/**
 * 셀렉트/라디오 옵션 (컴포넌트 표준)
 * @typedef {Object} Option
 * @property {string} label
 * @property {string|number|boolean|null} value
 * @property {boolean} [disabled]
 */

/**
 * 로그인 사용자
 * @typedef {Object} AuthUser
 * @property {string|number} id
 * @property {string} loginId
 * @property {string} name
 * @property {string[]} roles
 * @property {string[]} permissions
 */

/**
 * http 요청 확장 옵션 (axios config 에 함께 전달)
 * @typedef {Object} RequestOptions
 * @property {boolean} [loading=true]              - 전역 로딩 표시
 * @property {boolean} [silent=false]              - 공통 에러 토스트 생략
 * @property {boolean} [preventDuplicate]          - 동일 요청 진행 중 재요청 차단 (GET 외 기본 true)
 * @property {boolean} [cancelPrevious=false]      - 동일 요청 진행 중이면 이전 요청 취소 (검색 등)
 * @property {boolean} [cancelOnRouteChange=false] - 화면 이동 시 자동 취소
 * @property {boolean} [skipAuth=false]            - Authorization 헤더 생략
 * @property {boolean} [raw=false]                 - 응답 언랩 없이 axios response 반환
 */

export {};
