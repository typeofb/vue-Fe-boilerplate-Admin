/**
 * 공통 컴포넌트 전역 등록
 *  - components/base/Base*.vue 파일은 import 없이 템플릿에서 바로 사용 가능
 *  - 규칙: 공통 컴포넌트는 Base 접두사 + PascalCase 파일명 (예: BaseDataTable.vue)
 *  - 화면 전용 컴포넌트는 views/{domain}/components/ 에 두고 직접 import
 */
const modules = import.meta.glob('./base/Base*.vue', {eager: true});

export default {
    install(app) {
        Object.entries(modules).forEach(([path, module]) => {
            const name = path
                .split('/')
                .pop()
                .replace(/\.vue$/, '');
            app.component(name, module.default);
        });
    },
};
