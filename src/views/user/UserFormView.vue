<template>
    <div>
        <div class="page-header">
            <h2 class="page-header__title">{{ isEdit ? '회원 수정' : '회원 등록' }}</h2>
        </div>

        <v-skeleton-loader v-if="detailLoading" type="article, article" />

        <v-form v-else ref="formRef" @submit.prevent="onSubmit">
            <v-card border class="form-section">
                <div class="form-section__title">기본 정보</div>
                <v-row>
                    <v-col cols="12" md="6">
                        <BaseInput
                            v-model.trim="form.loginId"
                            v-max-length="20"
                            label="아이디"
                            required
                            :readonly="isEdit"
                            :rules="[rules.loginId()]"
                            counter="20"
                        />
                    </v-col>
                    <v-col cols="12" md="6">
                        <BaseInput v-model.trim="form.name" label="이름" required :rules="[rules.maxLength(20)]" />
                    </v-col>
                    <v-col cols="12" md="6">
                        <BaseInput v-model.trim="form.email" label="이메일" type="email" :rules="[rules.email()]" />
                    </v-col>
                    <v-col cols="12" md="6">
                        <BaseInput
                            v-model="form.phone"
                            v-number-only
                            label="휴대폰"
                            placeholder="'-' 없이 숫자만"
                            required
                            :rules="[rules.mobile()]"
                        />
                    </v-col>
                    <v-col cols="12" md="6">
                        <BaseInput
                            v-model="form.bizNo"
                            v-number-only
                            label="사업자등록번호"
                            placeholder="숫자 10자리"
                            :rules="[rules.bizNo()]"
                            :hint="form.bizNo ? formatBizNo(form.bizNo) : ''"
                            persistent-hint
                        />
                    </v-col>
                    <template v-if="!isEdit">
                        <v-col cols="12" md="6">
                            <BaseInput
                                v-model="form.password"
                                label="비밀번호"
                                type="password"
                                required
                                autocomplete="new-password"
                                :rules="[rules.password()]"
                                hint="영문, 숫자, 특수문자 포함 8~20자"
                            />
                        </v-col>
                        <v-col cols="12" md="6">
                            <BaseInput
                                v-model="form.passwordConfirm"
                                label="비밀번호 확인"
                                type="password"
                                required
                                autocomplete="new-password"
                                :rules="[rules.match(() => form.password)]"
                            />
                        </v-col>
                    </template>
                </v-row>
            </v-card>

            <v-card border class="form-section">
                <div class="form-section__title">회원 설정</div>
                <v-row>
                    <v-col cols="12" md="6">
                        <BaseRadioGroup v-model="form.status" :options="statusOptions" label="상태" required />
                    </v-col>
                    <v-col cols="12" md="6">
                        <BaseSelect v-model="form.grade" :items="gradeOptions" label="등급" required />
                    </v-col>
                    <v-col cols="12" md="6">
                        <BaseCheckbox v-model="form.smsYn" label="SMS 수신 동의" true-value="Y" false-value="N" />
                    </v-col>
                    <v-col cols="12">
                        <BaseInput
                            v-model="form.memo"
                            label="메모"
                            textarea
                            rows="3"
                            counter="500"
                            :rules="[rules.maxLength(500)]"
                        />
                    </v-col>
                    <v-col cols="12">
                        <BaseFileUpload v-model="files" label="첨부파일" :max-count="3" :max-size-mb="5" />
                    </v-col>
                </v-row>
            </v-card>

            <div class="form-actions">
                <BaseButton variant="outlined" color="secondary" @click="goList">목록</BaseButton>
                <BaseButton type="submit" permission="USER_EDIT" :loading="saving">
                    {{ isEdit ? '수정' : '등록' }}
                </BaseButton>
            </div>
        </v-form>
    </div>
</template>

<script setup>
/**
 * 등록/수정 화면 표준 예시
 *  폼 검증(rules) + 상세 조회(useApi) + 저장 + 파일 업로드 + 미저장 이탈 확인
 */
import {computed, reactive, ref} from 'vue';
import {onBeforeRouteLeave, useRoute, useRouter} from 'vue-router';
import {userApi} from '@/api';
import {useApi, useCommonCode} from '@/composables';
import {confirm} from '@/utils/dialog';
import {formatBizNo} from '@/utils/format';
import toast from '@/utils/toast';
import {rules} from '@/utils/validators';

defineOptions({name: 'UserFormView'});

const route = useRoute();
const router = useRouter();
const {options: statusOptions} = useCommonCode('USER_STATUS');
const {options: gradeOptions} = useCommonCode('USER_GRADE');

const id = computed(() => route.params.id);
const isEdit = computed(() => !!id.value);

const createEmptyForm = () => ({
    loginId: '',
    name: '',
    email: '',
    phone: '',
    bizNo: '',
    password: '',
    passwordConfirm: '',
    status: 'ACTIVE',
    grade: 'BASIC',
    smsYn: 'Y',
    memo: '',
});

const formRef = ref(null);
const form = reactive(createEmptyForm());
const files = ref([]);

// ---- 변경 여부 (미저장 이탈 확인용) ----
let snapshot = JSON.stringify(form);
const isDirty = () => JSON.stringify(form) !== snapshot || files.value.length > 0;
const markClean = () => {
    snapshot = JSON.stringify(form);
};

// ---- 상세 조회 ----
const {loading: detailLoading, execute: fetchDetail} = useApi(userApi.getDetail, {
    onSuccess: (data) => {
        Object.assign(form, createEmptyForm(), data);
        markClean();
    },
});
if (isEdit.value) fetchDetail(id.value);

// ---- 저장 ----
const saving = ref(false);
const onSubmit = async () => {
    const {valid} = await formRef.value.validate();
    if (!valid) {
        toast.warning('입력값을 확인해 주세요.');
        return;
    }

    saving.value = true;
    try {
        const result = isEdit.value ? await userApi.update(id.value, form) : await userApi.create(form);
        const userId = isEdit.value ? id.value : result.id;
        if (files.value.length) await userApi.uploadFiles(userId, files.value);

        files.value = [];
        markClean();
        toast.success(isEdit.value ? '수정되었습니다.' : '등록되었습니다.');
        goList();
    } catch {
        // 업무 에러(중복 아이디 등) 메시지는 인터셉터에서 토스트로 노출
    } finally {
        saving.value = false;
    }
};

const goList = () => router.push({name: 'UserList'});

onBeforeRouteLeave(async () => {
    if (!isDirty()) return true;
    return confirm('저장하지 않은 내용이 있습니다.\n페이지를 나가시겠습니까?', {confirmText: '나가기'});
});
</script>
