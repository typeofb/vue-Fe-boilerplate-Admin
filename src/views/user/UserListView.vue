<template>
    <div>
        <div class="page-header">
            <h2 class="page-header__title">회원 목록</h2>
            <div class="d-flex ga-2">
                <BaseButton
                    permission="USER_EXCEL"
                    variant="outlined"
                    color="success"
                    prepend-icon="mdi-microsoft-excel"
                    :loading="downloading"
                    @click="onDownload"
                >
                    엑셀 다운로드
                </BaseButton>
                <BaseButton permission="USER_EDIT" prepend-icon="mdi-plus" :to="{name: 'UserForm'}"
                    >회원 등록</BaseButton
                >
            </div>
        </div>

        <!-- 검색 조건 -->
        <BaseSearchForm :loading="table.loading" @search="table.search" @reset="table.reset">
            <v-col cols="12" sm="6" md="4">
                <BaseInput
                    v-model.trim="table.searchForm.keyword"
                    label="검색어"
                    placeholder="이름, 아이디, 이메일, 휴대폰"
                    clearable
                />
            </v-col>
            <v-col cols="12" sm="6" md="2">
                <BaseSelect v-model="table.searchForm.status" :items="statusOptions" label="상태" all-label="전체" />
            </v-col>
            <v-col cols="12" sm="6" md="2">
                <BaseSelect v-model="table.searchForm.grade" :items="gradeOptions" label="등급" all-label="전체" />
            </v-col>
            <template #more>
                <v-col cols="12" md="8">
                    <BaseDateRangePicker
                        v-model:start="table.searchForm.startDate"
                        v-model:end="table.searchForm.endDate"
                        label="가입일"
                    />
                </v-col>
            </template>
        </BaseSearchForm>

        <!-- 목록 -->
        <v-card border class="pa-4">
            <BaseDataTable
                v-bind="table.bind"
                v-model:selected="table.selected"
                :headers="headers"
                :show-select="userStore.hasPermission('USER_DELETE')"
                v-on="table.on"
                @click:row="onRowClick"
            >
                <template #toolbar="{selected}">
                    <BaseButton
                        permission="USER_DELETE"
                        color="error"
                        variant="tonal"
                        size="small"
                        prepend-icon="mdi-delete-outline"
                        :disabled="!selected.length"
                        @click="onDelete"
                    >
                        선택 삭제 ({{ selected.length }})
                    </BaseButton>
                </template>

                <template #[`item.no`]="{index}">{{ table.startNo - index }}</template>
                <template #[`item.name`]="{item}">{{ maskName(item.name) }}</template>
                <template #[`item.phone`]="{item}">{{ maskPhone(item.phone) }}</template>
                <template #[`item.status`]="{item}">
                    <v-chip size="small" variant="tonal" :color="STATUS_COLOR[item.status]">
                        {{ statusName(item.status) }}
                    </v-chip>
                </template>
                <template #[`item.grade`]="{item}">{{ gradeName(item.grade) }}</template>
                <template #[`item.point`]="{item}">{{ formatNumber(item.point) }}</template>
                <template #[`item.joinedAt`]="{item}">{{ formatDate(item.joinedAt) }}</template>
                <template #[`item.actions`]="{item}">
                    <v-btn
                        v-permission="'USER_EDIT'"
                        icon="mdi-pencil-outline"
                        variant="text"
                        size="small"
                        aria-label="수정"
                        @click.stop="goEdit(item.id)"
                    />
                </template>
            </BaseDataTable>
        </v-card>
    </div>
</template>

<script setup>
/**
 * 목록 화면 표준 예시
 *  useTable(검색/정렬/페이징/선택) + BaseSearchForm + BaseDataTable + 공통코드 + 권한 버튼 + 엑셀 다운로드
 */
import {onActivated, ref} from 'vue';
import {useRouter} from 'vue-router';
import {userApi} from '@/api';
import {useCommonCode, useConfirm, useTable} from '@/composables';
import {useUserStore} from '@/stores/user.store';
import {formatDate, formatNumber} from '@/utils/format';
import {maskName, maskPhone} from '@/utils/mask';

// keep-alive 를 위해 route name 과 동일하게
defineOptions({name: 'UserList'});

const STATUS_COLOR = {ACTIVE: 'success', DORMANT: 'warning', LOCKED: 'error', WITHDRAWN: 'secondary'};

const router = useRouter();
const userStore = useUserStore();
const {confirmAction} = useConfirm();
const {options: statusOptions, getName: statusName} = useCommonCode('USER_STATUS');
const {options: gradeOptions, getName: gradeName} = useCommonCode('USER_GRADE');

const table = useTable(userApi.getList, {
    defaultSearch: {keyword: '', status: null, grade: null, startDate: '', endDate: ''},
    defaultSort: [],
});

const headers = [
    {title: 'No', key: 'no', sortable: false, width: 70, align: 'center'},
    {title: '아이디', key: 'loginId', sortable: true},
    {title: '이름', key: 'name', sortable: true},
    {title: '이메일', key: 'email', sortable: false},
    {title: '휴대폰', key: 'phone', sortable: false},
    {title: '상태', key: 'status', sortable: true, align: 'center', width: 100},
    {title: '등급', key: 'grade', sortable: true, align: 'center', width: 90},
    {title: '포인트', key: 'point', sortable: true, align: 'end', width: 110},
    {title: '가입일', key: 'joinedAt', sortable: true, align: 'center', width: 120},
    {title: '', key: 'actions', sortable: false, align: 'end', width: 60},
];

const goEdit = (id) => router.push({name: 'UserForm', params: {id}});

const onRowClick = (_event, {item}) => {
    if (userStore.hasPermission('USER_EDIT')) goEdit(item.id);
};

const onDelete = () => {
    const ids = [...table.selected];
    return confirmAction(`선택한 ${ids.length}건을 삭제하시겠습니까?`, () => userApi.remove(ids), {
        title: '회원 삭제',
        color: 'error',
        confirmText: '삭제',
        successMessage: '삭제되었습니다.',
        onSuccess: () => table.refresh({removedCount: ids.length}),
    });
};

const downloading = ref(false);
const onDownload = async () => {
    downloading.value = true;
    try {
        await userApi.downloadExcel(table.getParams());
    } catch {
        /* 인터셉터에서 처리 */
    } finally {
        downloading.value = false;
    }
};

// keep-alive 복귀 시(등록/수정 후) 현재 조건으로 재조회
let firstActivation = true;
onActivated(() => {
    if (firstActivation) {
        firstActivation = false;
        return;
    }
    table.fetch();
});
</script>
