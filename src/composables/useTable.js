import {computed, onMounted, reactive, ref, shallowRef} from 'vue';
import {cleanParams, deepClone} from '@/utils/common';
import {PAGINATION} from '@/config';
import {usePagination} from './usePagination';

/**
 * 목록 화면 공통 패턴 (검색조건 + 정렬 + 페이징 + 선택)
 *
 *  const table = useTable(userApi.getList, {
 *      defaultSearch: {keyword: '', status: null, startDate: '', endDate: ''},
 *  });
 *
 *  <BaseSearchForm @search="table.search" @reset="table.reset">
 *      <BaseInput v-model="table.searchForm.keyword" />
 *  </BaseSearchForm>
 *  <BaseDataTable v-bind="table.bind" v-on="table.on" v-model:selected="table.selected" :headers="headers" />
 *
 *  - 반환값은 reactive 객체이므로 템플릿에서 table.items 처럼 바로 사용합니다.
 *  - 서버 응답 형식: { list, totalCount } (다르면 options.transform 으로 변환)
 *
 * @param {(params: Object, options?: import('@/types').RequestOptions) => Promise<any>} fetchFn
 * @param {Object} [options]
 * @param {Object} [options.defaultSearch]     검색조건 초기값 (초기화 시 이 값으로 복원)
 * @param {number} [options.size]              페이지 크기
 * @param {{key: string, order: 'asc'|'desc'}[]} [options.defaultSort]
 * @param {boolean} [options.immediate=true]   마운트 시 자동 조회
 * @param {(params: Object) => Object} [options.beforeFetch] 요청 파라미터 가공
 * @param {(res: any) => {list: any[], totalCount: number}} [options.transform]
 */
export function useTable(fetchFn, options = {}) {
    const {
        defaultSearch = {},
        size = PAGINATION.DEFAULT_SIZE,
        defaultSort = [],
        immediate = true,
        beforeFetch = (p) => p,
        transform = (res) => ({list: res?.list ?? [], totalCount: res?.totalCount ?? 0}),
    } = options;

    const pager = usePagination({size});
    const searchForm = reactive(deepClone(defaultSearch));
    /** 마지막으로 "검색" 버튼을 누른 시점의 조건 (페이지 이동 시 이 조건 유지) */
    let appliedSearch = deepClone(defaultSearch);

    const items = shallowRef([]);
    const loading = ref(false);
    const selected = ref([]);
    const sortBy = ref(deepClone(defaultSort));
    let callId = 0;

    const buildParams = () => {
        const sort = sortBy.value[0];
        return cleanParams(
            beforeFetch({
                ...appliedSearch,
                ...pager.toParams(),
                sort: sort ? `${sort.key},${sort.order}` : undefined,
            }),
        );
    };

    const fetch = async () => {
        const id = ++callId;
        loading.value = true;
        try {
            const res = await fetchFn(buildParams(), {loading: false, cancelPrevious: true, cancelOnRouteChange: true});
            if (id !== callId) return;
            const {list, totalCount} = transform(res);
            items.value = list;
            pager.totalCount.value = totalCount;
            selected.value = [];
        } catch {
            // 에러 토스트는 인터셉터에서 처리
        } finally {
            if (id === callId) loading.value = false;
        }
    };

    /** 검색 버튼: 현재 입력값을 적용하고 1페이지부터 */
    const search = () => {
        appliedSearch = deepClone(searchForm);
        pager.reset();
        return fetch();
    };

    /** 초기화 버튼: 검색조건 / 정렬 / 페이지 초기화 후 재조회 */
    const reset = () => {
        Object.keys(searchForm).forEach((k) => delete searchForm[k]);
        Object.assign(searchForm, deepClone(defaultSearch));
        sortBy.value = deepClone(defaultSort);
        return search();
    };

    /** 저장/삭제 후 현재 페이지 다시 조회 (마지막 페이지 데이터가 모두 삭제되면 이전 페이지로) */
    const refresh = async ({removedCount = 0} = {}) => {
        const remaining = items.value.length - removedCount;
        if (remaining <= 0 && pager.page.value > PAGINATION.PAGE_START) pager.page.value -= 1;
        return fetch();
    };

    const changePage = (page) => {
        pager.page.value = page;
        fetch();
    };

    const changeSize = (newSize) => {
        pager.size.value = newSize;
        pager.reset();
        fetch();
    };

    const changeSort = (sort) => {
        sortBy.value = sort;
        pager.reset();
        fetch();
    };

    if (immediate) onMounted(fetch);

    const table = reactive({
        searchForm,
        items,
        loading,
        selected,
        sortBy,
        page: pager.page,
        size: pager.size,
        totalCount: pager.totalCount,
        totalPages: pager.totalPages,
        startNo: pager.startNo,
        fetch,
        search,
        reset,
        refresh,
        changePage,
        changeSize,
        changeSort,
        getParams: buildParams,
        /** <BaseDataTable v-bind="table.bind"> */
        bind: computed(() => ({
            items: items.value,
            loading: loading.value,
            page: pager.page.value,
            size: pager.size.value,
            totalCount: pager.totalCount.value,
            sortBy: sortBy.value,
        })),
        /** <BaseDataTable v-on="table.on"> */
        on: {
            'update:page': changePage,
            'update:size': changeSize,
            'update:sortBy': changeSort,
        },
    });

    return table;
}
