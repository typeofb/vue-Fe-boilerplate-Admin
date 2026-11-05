# Vue 3 Admin Boilerplate

관리자(Admin) 신규 프로젝트용 Vue 3.3.4 공통 템플릿입니다.
`vue-Fe-boilerplate-User` 와 같은 스택을 사용하고, 관리자 화면에 필요한 공통 기능(인증/권한, API 모듈, 목록/폼 패턴, 공통 UI)을 담았습니다.

- Node.js `v22.14.0` (`.nvmrc`)
- Vue `3.3.4` / Vite 6 / Vuetify `3.7.19` / Pinia `2.1.7` / Vue Router `4.5.1` / Axios 1.x / dayjs

> Vue 3.3.4 호환을 위해 일부 라이브러리 버전을 **고정**했습니다.
> (Vuetify 3.8+, Pinia 2.2+/3.x, Vue Router 4.6+, vue-dompurify-html 5.3+ 는 Vue ^3.4~3.5 를 요구)
> `npm audit` 의 `@vue/server-renderer` 경고는 SSR 전용 취약점이라 이 SPA 와는 관계없습니다. Vue 를 3.5 로 올리면 함께 해소됩니다.

## 실행

```bash
npm install
npm run dev          # http://localhost:8610  (.env.localhost, Mock API 사용)
npm run dev:dev      # 개발 서버 API 로 로컬 실행 (.env.development)
npm run build:dev    # 개발 빌드
npm run build:stg    # 스테이징 빌드
npm run build        # 운영 빌드
npm run lint         # ESLint 자동 수정
npm run format       # Prettier
```

Mock 계정 (백엔드 없이 확인): `admin / admin1234!` (전체 권한), `manager / manager1234!` (조회 권한만)

## 환경 변수

| 파일 | 모드 | 용도 |
| --- | --- | --- |
| `.env` | 공통 | 모든 모드의 기본값 |
| `.env.localhost` | `localhost` | 로컬 개발 (프록시, Mock) |
| `.env.development` | `development` | 개발 서버 |
| `.env.staging` | `staging` | 스테이징 |
| `.env.production` | `production` | 운영 |
| `.env.local`, `.env.*.local` | - | 개인 PC 전용 값 (git 제외) |

> 로컬 모드 이름을 `local` 이 아닌 `localhost` 로 둔 이유: Vite 는 `.env.local` 을 **모든 모드에서** 읽는 개인 설정 파일로 취급합니다.
> 로컬 모드 파일을 `.env.local` 로 만들면 운영 빌드에도 로컬 값이 섞입니다.

| 키 | 설명 |
| --- | --- |
| `VITE_APP_TITLE` | 브라우저/사이드바 타이틀 |
| `VITE_PORT` | 개발 서버 포트 |
| `VITE_API_BASE_URL` | API base URL (프록시 사용 시 `/api`) |
| `VITE_PROXY_TARGET` | 개발 서버 프록시 대상 (`/api/**` → target, `/api` 제거) |
| `VITE_API_TIMEOUT` | 요청 타임아웃(ms) |
| `VITE_STORAGE_PREFIX` | 쿠키/스토리지 키 prefix (같은 도메인 프로젝트 간 충돌 방지) |
| `VITE_IDLE_TIMEOUT_MIN` | 미사용 시 자동 로그아웃(분), 0 이면 끔 |
| `VITE_USE_MOCK` | `true` 면 `src/mocks` 사용 (운영 빌드에서는 코드가 제거됨) |
| `VITE_SENTRY_DSN` | 에러 모니터링 DSN (`plugins/error-handler.js` 참고) |

`VITE_` 값은 번들에 그대로 노출됩니다. 비밀 키를 넣지 마세요.

## 폴더 구조

```
src/
├─ main.js                  # 진입점: 플러그인, 에러 핸들러, mock, 세션 만료 처리, 라우터
├─ App.vue                  # v-app + DialogHost(Alert/Confirm) + GlobalLoading + 테마 반영
├─ api/
│  ├─ http.js               # axios 인스턴스, 인터셉터, 토큰 재발급, request 헬퍼(get/post/upload/download)
│  ├─ request-manager.js    # 중복 요청 방지, AbortController 취소
│  ├─ errors.js             # ApiError, 표준 에러 메시지
│  └─ {domain}.api.js       # 도메인별 API (auth, user, code)
├─ assets/scss/
│  ├─ abstracts/            # 변수, 믹스인 (모든 SFC 에 자동 주입)
│  ├─ _reset.scss, main.scss
│  └─ vuetify-settings.scss # Vuetify SASS 변수
├─ components/
│  ├─ base/                 # Base* 공통 컴포넌트 (전역 등록)
│  └─ feedback/             # DialogHost, GlobalLoading
├─ composables/             # useApi, useTable, usePagination, useModal, useConfirm, useCommonCode, useIdleTimeout, useMenu
├─ config/index.js          # 앱 상수 (응답 코드, 페이징, 업로드 제한, 역할)
├─ directives/              # v-permission, v-click-outside, v-focus, v-number-only, v-max-length
├─ layouts/                 # DefaultLayout(Header/Sidebar/Footer), AuthLayout, BlankLayout
├─ mocks/                   # Mock API (axios adapter)
├─ plugins/                 # vuetify, dayjs, error-handler
├─ router/                  # routes(= 메뉴 정의), guards
├─ stores/                  # user, app, code, dialog
├─ types/index.js           # 공통 타입 (JSDoc)
├─ utils/                   # format, mask, file, validators, storage, token, toast, dialog, sanitize, common
└─ views/                   # auth, dashboard, user(목록/폼 예시), sample(컴포넌트 예시), error(403/404/500)
```

## 네이밍 컨벤션

| 대상 | 규칙 | 예 |
| --- | --- | --- |
| 화면 컴포넌트 | `views/{domain}/{Name}View.vue` | `views/user/UserListView.vue` |
| 공통 컴포넌트 | `components/base/Base{Name}.vue` (전역 등록) | `BaseDataTable.vue` |
| 화면 전용 컴포넌트 | `views/{domain}/components/{Name}.vue` | `UserHistoryTable.vue` |
| composable | `use{Name}.js` | `useTable.js` |
| 스토어 | `{name}.store.js` / `use{Name}Store` | `useUserStore` |
| API | `{domain}.api.js` / `{domain}Api` | `userApi.getList()` |
| 라우트 | name: PascalCase, path: kebab-case | `UserList`, `/user/list` |
| 상수 | UPPER_SNAKE_CASE | `PAGINATION.DEFAULT_SIZE` |
| 템플릿 | 컴포넌트 PascalCase, props/attr kebab-case | `<BaseInput max-length>` |

코드 스타일: 4 spaces, single quote, 세미콜론, printWidth 120 (`.prettierrc.json`)

## 커밋 컨벤션 (Husky + lint-staged + commitlint)

```
feat(user): 회원 목록 엑셀 다운로드 추가
fix(api): 토큰 재발급 중 동시 요청 누락 수정
```

type: `feat` `fix` `docs` `style` `refactor` `perf` `test` `build` `ci` `chore` `revert`

커밋 전 변경 파일에 ESLint, Prettier 가 자동 실행됩니다.
Husky 는 git 저장소에서만 동작하므로 `git init` 후 `npm install`(또는 `npm run prepare`)을 한 번 더 실행하세요.

## API 통신

### 응답 포맷 (백엔드와 합의)

```json
{ "code": "0000", "message": "OK", "data": {} }
```

- 성공 코드는 `config/index.js` 의 `RESPONSE_CODE.SUCCESS_CODES` 에서 관리합니다.
- HTTP 200 이어도 `code` 가 성공이 아니면 에러(`ApiError`)로 처리하고 `message` 를 토스트로 띄웁니다.
- 목록 응답 `data`: `{ list, totalCount, page, size }` / 요청: `page`, `size`, `sort=field,asc`

### 사용

```js
import {request} from '@/api';

// 도메인 API 파일(api/order.api.js)에서만 URL 을 다룹니다.
export const orderApi = {
    getList: (params, options) => request.get('/orders', params, options),
    create: (payload) => request.post('/orders', payload),
    download: (params) => request.download('/orders/excel', params, {filename: '주문.xlsx'}),
    upload: (files, onProgress) => request.upload('/orders/files', {files}, {onProgress}),
};
```

`request.*` 는 표준 응답의 `data` 만 반환합니다. 실패하면 `ApiError` 로 reject 됩니다.
에러 토스트는 공통 처리되므로 화면에서는 보통 `try/catch` 로 로딩 해제만 하면 됩니다.

### 요청 옵션

| 옵션 | 기본값 | 설명 |
| --- | --- | --- |
| `loading` | `true` | 전역 로딩 오버레이 표시 |
| `silent` | `false` | 공통 에러 토스트 생략 (화면에서 직접 처리) |
| `preventDuplicate` | GET 외 `true` | 같은 요청이 진행 중이면 차단 (버튼 연타 방지) |
| `cancelPrevious` | `false` | 같은 요청이 진행 중이면 이전 요청 취소 (검색) |
| `cancelOnRouteChange` | `false` | 화면 이동 시 취소 (`useTable` 은 기본 사용) |
| `skipAuth` | `false` | Authorization 헤더 생략 |
| `raw` | `false` | axios response 그대로 반환 |
| `signal` | - | 직접 만든 `AbortController.signal` 로 취소 |

### 공통 에러 처리

| 상황 | 처리 |
| --- | --- |
| 업무 에러 (code ≠ 성공) | 서버 `message` 토스트 |
| 401 | refresh 토큰으로 재발급 후 원래 요청 재시도. 재발급 중 들어온 요청은 같은 refresh Promise 를 기다렸다가 함께 재시도. 실패하면 로그아웃, 로그인 화면 이동, 세션 만료 안내 |
| 403 / 404 / 409 / 413 | 서버 메시지, 없으면 표준 메시지 |
| 5xx | "서버 오류가 발생했습니다." |
| 네트워크 / 타임아웃 | "네트워크 연결을 확인해 주세요." / "요청 시간이 초과되었습니다." |
| 취소 / 중복 차단 | 조용히 reject (`error.isCanceled`, `error.isDuplicate`) |

## 인증 / 권한

- **토큰 저장**: accessToken 은 쿠키(`secure`, `SameSite=Lax`)에 저장합니다. refreshToken 은 **서버가 HttpOnly 쿠키로 내려주는 방식**을 권장하고, body 로 받으면 쿠키에 저장합니다. localStorage 는 XSS 에 약해 쓰지 않습니다.
- **라우터 가드** (`router/guards.js`): 기본은 로그인 필요입니다. `meta.public` 인 화면만 비로그인으로 열 수 있습니다. 새로고침하면 `/auth/me` 로 사용자를 복원하고, 권한이 없으면 403 으로 이동합니다.
- **역할(Role)**: `meta.roles: ['ADMIN']` 은 화면과 메뉴 단위 제어입니다.
- **권한(Permission)**: `meta.permission: 'USER_VIEW'` 는 화면 단위, 아래 방식은 버튼 단위 제어입니다.

```vue
<BaseButton permission="USER_EDIT">수정</BaseButton>
<BaseButton permission="USER_DELETE" permission-mode="disable">삭제</BaseButton>
<v-btn v-permission="'USER_EDIT'">수정</v-btn>
<div v-permission:role="'ADMIN'">관리자 전용</div>
<template v-if="userStore.hasPermission('USER_EXCEL')">...</template>
```

화면 제어는 보조 수단입니다. 서버도 반드시 권한을 검사해야 합니다.

- **세션 타임아웃**: `VITE_IDLE_TIMEOUT_MIN` 동안 입력이 없으면 1분 전에 경고하고 자동 로그아웃합니다. 탭이 여러 개면 활동 시간을 공유합니다.

## 라우팅 / 메뉴

`router/routes.js` 의 meta 가 **메뉴, 페이지 타이틀, 브레드크럼, 권한**의 단일 기준입니다.

```js
{
    path: 'order',
    meta: {title: '주문관리', icon: 'mdi-cart-outline', roles: ['ADMIN']}, // 그룹 메뉴 (component 없음)
    children: [
        {path: 'list', name: 'OrderList', component: () => import('@/views/order/OrderListView.vue'),
         meta: {title: '주문 목록', permission: 'ORDER_VIEW', keepAlive: true}},
        {path: 'detail/:id', name: 'OrderDetail', component: () => import('@/views/order/OrderDetailView.vue'),
         meta: {title: '주문 상세', hidden: true, activeMenu: '/order/list'}},
    ],
}
```

- 권한이 없는 메뉴는 사이드바에서 자동으로 숨겨집니다.
- `keepAlive: true` 를 쓰려면 화면 컴포넌트의 `defineOptions({name})` 을 route name 과 같게 맞추세요. 목록 → 상세 → 목록으로 돌아와도 검색 조건이 유지됩니다.
- 레이아웃: `DefaultLayout`(업무 화면), `AuthLayout`(로그인), `BlankLayout`(에러, 팝업, 인쇄)
- 배포 후 예전 청크를 불러오지 못하면 1회 새로고침합니다.
- 서버에서 메뉴를 받는 경우: `composables/useMenu.js` 의 `buildMenus` 입력을 서버 메뉴로 바꾸거나 필터 조건을 추가하세요.

## 목록 / 폼 화면 패턴

새 화면은 `views/user/UserListView.vue`, `UserFormView.vue` 를 복사해서 시작하세요.

```vue
<script setup>
const table = useTable(orderApi.getList, {defaultSearch: {keyword: '', status: null}});
const {options: statusOptions, getName: statusName} = useCommonCode('ORDER_STATUS');
</script>

<template>
    <BaseSearchForm :loading="table.loading" @search="table.search" @reset="table.reset">
        <v-col cols="12" md="3"><BaseInput v-model="table.searchForm.keyword" label="검색어" /></v-col>
        <v-col cols="12" md="3"><BaseSelect v-model="table.searchForm.status" :items="statusOptions" all-label="전체" /></v-col>
    </BaseSearchForm>

    <BaseDataTable v-bind="table.bind" v-model:selected="table.selected" :headers="headers" show-select v-on="table.on">
        <template #[`item.status`]="{item}">{{ statusName(item.status) }}</template>
    </BaseDataTable>
</template>
```

폼 검증은 Vuetify rules 방식 하나로 씁니다. 규칙과 메시지는 `utils/validators.js` 에 있습니다.

```vue
<v-form ref="formRef">
    <BaseInput v-model="form.email" label="이메일" required :rules="[rules.email()]" />
    <BaseInput v-model="form.bizNo" v-number-only label="사업자번호" :rules="[rules.bizNo()]" />
    <BaseInput v-model="form.pw" type="password" :rules="[rules.password()]" />
    <BaseInput v-model="form.pw2" type="password" :rules="[rules.match(() => form.pw)]" />
</v-form>
<!-- const {valid} = await formRef.value.validate() -->
```

제공 규칙: `required`, `requiredSelect`, `email`, `mobile`, `tel`, `bizNo`(체크섬), `loginId`, `password`(영문+숫자+특수 8~20자, 3연속 금지), `match`, `number`, `minLength`, `maxLength`, `min`, `max`, `url`, `custom`

## 공통 컴포넌트

| 컴포넌트 | 설명 |
| --- | --- |
| `BaseInput` | text-field / textarea, `required` 를 주면 * 표시와 필수 규칙이 붙음 |
| `BaseSelect` | `{label, value}` 옵션, `all-label` 로 '전체' 추가 |
| `BaseCheckbox` | 단일(Y/N) / 그룹(`options`, `check-all`) |
| `BaseRadioGroup` | `options` 기반 |
| `BaseDatePicker` | `'YYYY-MM-DD'` v-model, min/max |
| `BaseDateRangePicker` | `v-model:start` / `v-model:end`, 오늘·1주·1개월·3개월 빠른 선택 |
| `BaseButton` | `permission`, `permission-mode`, `loading` |
| `BaseModal` | 공통 모달 틀, 모바일에서 fullscreen, `useModal()` 과 함께 사용 |
| `BaseDataTable` | 서버 페이징, 정렬, 체크박스 선택, 빈 데이터, 스켈레톤, 툴바 슬롯 |
| `BasePagination` | 총 건수, 페이지, 페이지 크기 |
| `BaseSearchForm` | 검색/초기화 버튼, Enter 검색, 상세검색 접기 |
| `BaseFileUpload` | 드래그 앤 드롭, 확장자·용량·개수 제한, 기존 파일 표시 |
| `BaseEmpty` | 빈 상태 |

함수형 다이얼로그와 토스트는 어디서든 쓸 수 있습니다 (스토어, 인터셉터 포함).

```js
import {alert, confirm, toast} from '@/utils';

await alert('저장되었습니다.');
if (!(await confirm('삭제하시겠습니까?', {color: 'error', confirmText: '삭제'}))) return;
toast.success('삭제되었습니다.');
```

모든 컴포넌트 예시는 `시스템 > 공통 컴포넌트` 화면(ADMIN 전용)에 있습니다. **운영 배포 전에 메뉴를 제거하세요.**

## 유틸리티

| 파일 | 함수 |
| --- | --- |
| `format.js` | `formatDate`, `formatDateTime`, `fromNow`, `getDateRange`, `formatNumber`, `formatCurrency`, `unformatNumber`, `formatPercent`, `formatPhone`, `formatBizNo`, `formatFileSize`, `formatYn` |
| `mask.js` | `maskName`, `maskPhone`, `maskRrn`, `maskCard`, `maskEmail`, `maskAccount` |
| `file.js` | `parseFilename`(Content-Disposition, RFC 5987), `saveBlob`, `downloadByUrl`, `validateFile`, `getExtension` |
| `storage.js` | `local` / `session` (prefix, JSON, TTL, 예외 안전) |
| `common.js` | `isEmpty`, `deepClone`, `cleanParams`, `debounce`, `throttle`, `sleep`, `uid`, `findLabel` |
| `sanitize.js` | `sanitizeHtml`, `stripTags`, `escapeHtml` |

파일 다운로드에서 파일명을 읽으려면 서버 CORS 설정에 `Access-Control-Expose-Headers: Content-Disposition` 이 있어야 합니다.

## 상태 관리 (Pinia)

| 스토어 | 역할 |
| --- | --- |
| `useUserStore` | 사용자, roles/permissions, `login` / `logout` / `ensureUser`, `hasRole` / `hasPermission` / `canAccess` |
| `useAppStore` | 전역 로딩 카운터, 사이드바(drawer/rail), 테마(light/dark). rail 과 테마는 localStorage 에 저장 |
| `useCodeStore` | 공통코드 그룹별 캐시 (30분 TTL, 동시 요청 공유, 로그아웃 시 초기화) |
| `useDialogStore` | Alert/Confirm 큐 |

## 에러 처리 / 보안

- `app.config.errorHandler` 와 `unhandledrejection` 을 전역에서 처리합니다. API 에러는 이미 토스트로 알렸으므로 다시 띄우지 않습니다.
- Sentry 연동: `npm i @sentry/vue` 후 `plugins/error-handler.js` 의 `initMonitoring` 주석을 해제하세요.
- XSS: `v-html` 은 ESLint 에서 에러로 막혀 있습니다. 대신 `v-dompurify-html` 을 쓰세요. 다이얼로그 메시지는 텍스트로만 출력합니다.
- 로그인 후 `redirect` 쿼리는 내부 경로만 허용합니다 (open redirect 방지).
- 운영 빌드에서는 `console.log` 와 `debugger` 가 제거됩니다.

## 스타일

- 변수(`$spacer-4`, `$font-size-sm` 등)와 믹스인(`@include mobile`, `@include ellipsis`)은 모든 SFC `<style lang="scss">` 에 자동 주입됩니다.
- 테마 색은 `plugins/vuetify.js` 에서 관리합니다. 다크모드를 지원하려면 고정 색 대신 `rgb(var(--v-theme-primary))` 를 쓰세요.
- 컴포넌트 기본 props(variant, density 등)는 `plugins/vuetify.js` 의 `defaults` 에서 한 번에 바꿀 수 있습니다.

## 포함하지 않은 항목 (필요할 때 추가)

| 항목 | 방법 |
| --- | --- |
| 다국어 | `vue-i18n` 추가. 메시지는 `utils/validators.js` 의 `MESSAGES`, `api/errors.js` 의 `ERROR_MESSAGES` 부터 바꾸세요 |
| 단위 테스트 | `vitest` + `@vue/test-utils` (utils, composables 부터) |
| 탭형 다중 화면 | DefaultLayout 의 keep-alive `cachedViews` 를 열린 탭 목록으로 바꿔 확장 |
| 엑셀 업로드/다운로드(xlsx) | 서버 생성 다운로드는 `request.download` 로 처리. 클라이언트 생성이 필요하면 `exceljs` 추가 |
| 에디터 / 차트 | 화면 전용으로 `components/base` 에 래퍼를 추가 (예: `BaseEditor`, `BaseChart`) |
