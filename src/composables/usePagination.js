import {computed, ref} from 'vue';
import {PAGINATION} from '@/config';

/**
 * 페이지네이션 상태
 *  const pager = usePagination({size: 20});
 *  pager.page.value / pager.totalPages.value / pager.toParams()
 */
export function usePagination({page = PAGINATION.PAGE_START, size = PAGINATION.DEFAULT_SIZE} = {}) {
    const currentPage = ref(page);
    const pageSize = ref(size);
    const totalCount = ref(0);

    const totalPages = computed(() => Math.max(1, Math.ceil(totalCount.value / pageSize.value)));
    /** 목록 No. 계산용 (역순 번호) */
    const startNo = computed(() => totalCount.value - (currentPage.value - PAGINATION.PAGE_START) * pageSize.value);

    const reset = () => {
        currentPage.value = PAGINATION.PAGE_START;
    };

    const toParams = () => ({page: currentPage.value, size: pageSize.value});

    return {page: currentPage, size: pageSize, totalCount, totalPages, startNo, reset, toParams};
}
