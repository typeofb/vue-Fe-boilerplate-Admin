<template>
    <div>
        <div class="page-header">
            <h2 class="page-header__title">공통 컴포넌트</h2>
            <span class="text-caption text-medium-emphasis">신규 화면 작성 시 참고용 (운영 배포 전 메뉴 제거)</span>
        </div>

        <!-- 입력 -->
        <v-card border class="form-section">
            <div class="form-section__title">입력 / 폼 검증</div>
            <v-form ref="formRef">
                <v-row>
                    <v-col cols="12" md="4">
                        <BaseInput v-model="form.name" label="이름 (필수)" required />
                    </v-col>
                    <v-col cols="12" md="4">
                        <BaseInput v-model="form.email" label="이메일" :rules="[rules.email()]" />
                    </v-col>
                    <v-col cols="12" md="4">
                        <BaseInput v-model="form.amount" v-number-only label="금액 (숫자만)" suffix="원" />
                        <div class="text-caption mt-1">{{ formatCurrency(form.amount) }}</div>
                    </v-col>
                    <v-col cols="12" md="4">
                        <BaseSelect v-model="form.grade" :items="gradeOptions" label="등급" required />
                    </v-col>
                    <v-col cols="12" md="4">
                        <BaseDatePicker v-model="form.date" label="날짜" required />
                    </v-col>
                    <v-col cols="12" md="4">
                        <BaseRadioGroup v-model="form.useYn" :options="ynOptions" label="사용여부" />
                    </v-col>
                    <v-col cols="12" md="8">
                        <BaseDateRangePicker v-model:start="form.startDate" v-model:end="form.endDate" label="기간" />
                    </v-col>
                    <v-col cols="12" md="4">
                        <BaseCheckbox
                            v-model="form.channels"
                            :options="channelOptions"
                            label="채널"
                            check-all
                            required
                        />
                    </v-col>
                </v-row>
            </v-form>
            <div class="form-actions">
                <BaseButton variant="outlined" color="secondary" @click="formRef.reset()">초기화</BaseButton>
                <BaseButton @click="onValidate">검증</BaseButton>
            </div>
        </v-card>

        <!-- 버튼 / 다이얼로그 / 토스트 -->
        <v-card border class="form-section">
            <div class="form-section__title">버튼 · Alert / Confirm · Toast · Modal</div>
            <div class="d-flex flex-wrap ga-2">
                <BaseButton :loading="loading" @click="simulateLoading">로딩 버튼</BaseButton>
                <BaseButton permission="NOT_EXISTS" permission-mode="disable">권한 없음(비활성)</BaseButton>
                <BaseButton permission="NOT_EXISTS">권한 없음(숨김)</BaseButton>
                <v-btn v-permission:role="'ADMIN'" variant="tonal">v-permission:role ADMIN</v-btn>
                <v-divider vertical class="mx-2" />
                <BaseButton variant="tonal" @click="onAlert">alert()</BaseButton>
                <BaseButton variant="tonal" @click="onConfirm">confirm()</BaseButton>
                <BaseButton variant="tonal" color="error" @click="onDangerConfirm">confirm(error)</BaseButton>
                <v-divider vertical class="mx-2" />
                <BaseButton variant="tonal" color="success" @click="toast.success('저장되었습니다.')"
                    >success</BaseButton
                >
                <BaseButton variant="tonal" color="error" @click="toast.error('오류가 발생했습니다.')"
                    >error</BaseButton
                >
                <BaseButton variant="tonal" color="warning" @click="toast.warning('확인이 필요합니다.')"
                    >warning</BaseButton
                >
                <BaseButton variant="tonal" color="info" @click="toast.info('안내 메시지입니다.')">info</BaseButton>
                <v-divider vertical class="mx-2" />
                <BaseButton variant="outlined" @click="onOpenModal">모달 열기</BaseButton>
            </div>
        </v-card>

        <!-- 파일 / 빈 상태 / 스켈레톤 -->
        <v-row>
            <v-col cols="12" md="6">
                <v-card border class="form-section h-100">
                    <div class="form-section__title">파일 업로드</div>
                    <BaseFileUpload
                        v-model="files"
                        :existing-files="existingFiles"
                        :extensions="['png', 'jpg', 'pdf', 'xlsx']"
                        :max-size-mb="5"
                        :max-count="3"
                        @remove-existing="(f) => (existingFiles = existingFiles.filter((e) => e.id !== f.id))"
                    />
                </v-card>
            </v-col>
            <v-col cols="12" md="6">
                <v-card border class="form-section h-100">
                    <div class="form-section__title">Empty · Skeleton</div>
                    <BaseEmpty message="검색 결과가 없습니다." compact />
                    <v-skeleton-loader type="list-item-two-line" />
                </v-card>
            </v-col>
        </v-row>

        <!-- 포맷 / 마스킹 / XSS -->
        <v-card border class="form-section">
            <div class="form-section__title">포맷 · 마스킹 · XSS</div>
            <v-table density="compact">
                <tbody>
                    <tr v-for="row in formatRows" :key="row.label">
                        <th class="text-left" style="width: 260px">{{ row.label }}</th>
                        <td>{{ row.value }}</td>
                    </tr>
                    <tr>
                        <th class="text-left">v-dompurify-html</th>
                        <td><span v-dompurify-html="unsafeHtml" /></td>
                    </tr>
                </tbody>
            </v-table>
        </v-card>

        <BaseModal
            v-model="modal.isOpen.value"
            title="공통 모달"
            width="480"
            confirm-text="확인"
            @confirm="modal.close('confirmed')"
        >
            전달받은 데이터: <code>{{ modal.payload.value }}</code>
            <BaseInput v-focus class="mt-4" label="포커스 자동 이동 (v-focus)" />
        </BaseModal>
    </div>
</template>

<script setup>
import {reactive, ref} from 'vue';
import {useCommonCode, useModal} from '@/composables';
import {alert, confirm} from '@/utils/dialog';
import {formatBizNo, formatCurrency, formatDateTime, formatFileSize, formatPhone, fromNow} from '@/utils/format';
import {maskCard, maskEmail, maskName, maskPhone, maskRrn} from '@/utils/mask';
import toast from '@/utils/toast';
import {rules} from '@/utils/validators';

defineOptions({name: 'ComponentSampleView'});

const {options: gradeOptions} = useCommonCode('USER_GRADE');
const ynOptions = [
    {label: '사용', value: 'Y'},
    {label: '미사용', value: 'N'},
];
const channelOptions = [
    {label: 'SMS', value: 'SMS'},
    {label: '이메일', value: 'EMAIL'},
    {label: '푸시', value: 'PUSH'},
];

const formRef = ref(null);
const form = reactive({
    name: '',
    email: '',
    amount: '',
    grade: null,
    date: '',
    useYn: 'Y',
    startDate: '',
    endDate: '',
    channels: [],
});

const onValidate = async () => {
    const {valid} = await formRef.value.validate();
    valid ? toast.success('검증 통과') : toast.warning('입력값을 확인해 주세요.');
};

const loading = ref(false);
const simulateLoading = () => {
    loading.value = true;
    setTimeout(() => (loading.value = false), 1500);
};

const onAlert = async () => {
    await alert('저장되었습니다.');
    toast.info('alert 닫힘');
};
const onConfirm = async () => {
    const ok = await confirm('변경 내용을 저장하시겠습니까?');
    toast.info(`confirm 결과: ${ok}`);
};
const onDangerConfirm = async () => {
    const ok = await confirm('삭제된 데이터는 복구할 수 없습니다.\n정말 삭제하시겠습니까?', {
        title: '삭제 확인',
        color: 'error',
        confirmText: '삭제',
    });
    toast.info(`confirm 결과: ${ok}`);
};

const modal = useModal();
const onOpenModal = async () => {
    const result = await modal.open({id: 1, name: '홍길동'});
    toast.info(`모달 결과: ${result ?? '닫기'}`);
};

const files = ref([]);
const existingFiles = ref([{id: 1, name: '기존파일.pdf', size: 1234567, url: ''}]);

const formatRows = [
    {label: 'formatDateTime(new Date())', value: formatDateTime(new Date())},
    {label: "fromNow('2시간 전')", value: fromNow(Date.now() - 2 * 3600 * 1000)},
    {label: 'formatCurrency(1234567)', value: formatCurrency(1234567)},
    {label: "formatPhone('01012345678')", value: formatPhone('01012345678')},
    {label: "formatBizNo('1234567890')", value: formatBizNo('1234567890')},
    {label: 'formatFileSize(1536000)', value: formatFileSize(1536000)},
    {label: "maskName('홍길동')", value: maskName('홍길동')},
    {label: "maskPhone('01012345678')", value: maskPhone('01012345678')},
    {label: "maskRrn('9001011234567')", value: maskRrn('9001011234567')},
    {label: "maskCard('1234567890123456')", value: maskCard('1234567890123456')},
    {label: "maskEmail('hong@example.com')", value: maskEmail('hong@example.com')},
];

// <img onerror> 는 제거되고 <b> 만 남음
const unsafeHtml = '<b>안전한 굵은 글씨</b><img src=x onerror="alert(\'xss\')">';
</script>
