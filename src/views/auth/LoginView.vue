<template>
    <v-card class="login-card" border>
        <v-card-text class="pa-8">
            <div class="text-center mb-6">
                <v-icon icon="mdi-shield-crown-outline" color="primary" size="48" />
                <h1 class="login-card__title">{{ APP_TITLE }}</h1>
                <p class="login-card__desc">관리자 계정으로 로그인해 주세요.</p>
            </div>

            <v-form ref="formRef" @submit.prevent="onSubmit">
                <BaseInput
                    v-model.trim="form.loginId"
                    v-focus
                    label="아이디"
                    prepend-inner-icon="mdi-account-outline"
                    autocomplete="username"
                    :rules="[rules.required('아이디')]"
                    class="mb-3"
                />
                <BaseInput
                    v-model="form.password"
                    label="비밀번호"
                    :type="showPassword ? 'text' : 'password'"
                    prepend-inner-icon="mdi-lock-outline"
                    :append-inner-icon="showPassword ? 'mdi-eye-off-outline' : 'mdi-eye-outline'"
                    autocomplete="current-password"
                    :rules="[rules.required('비밀번호')]"
                    class="mb-2"
                    @click:append-inner="showPassword = !showPassword"
                />
                <BaseCheckbox v-model="rememberId" label="아이디 저장" />

                <BaseButton type="submit" block size="large" :loading="loading" class="mt-4">로그인</BaseButton>
            </v-form>

            <v-alert v-if="isMock" type="info" variant="tonal" density="compact" class="mt-6 text-caption">
                Mock 계정: <b>admin / admin1234!</b> (전체 권한)<br />
                <b>manager / manager1234!</b> (조회 권한만)
            </v-alert>
        </v-card-text>
    </v-card>
</template>

<script setup>
import {reactive, ref} from 'vue';
import {useRoute, useRouter} from 'vue-router';
import {APP_TITLE} from '@/config';
import {useUserStore} from '@/stores/user.store';
import {local} from '@/utils/storage';
import {rules} from '@/utils/validators';

defineOptions({name: 'LoginView'});

const REMEMBER_KEY = 'remember_login_id';

const route = useRoute();
const router = useRouter();
const userStore = useUserStore();

const formRef = ref(null);
const loading = ref(false);
const showPassword = ref(false);
const savedId = local.get(REMEMBER_KEY, '');
const rememberId = ref(!!savedId);
const form = reactive({loginId: savedId, password: ''});
const isMock = import.meta.env.VITE_USE_MOCK === 'true';

/** 외부 URL 로의 open redirect 방지: 내부 경로만 허용 */
const safeRedirect = (value) => (typeof value === 'string' && /^\/(?!\/)/.test(value) ? value : '/');

const onSubmit = async () => {
    const {valid} = await formRef.value.validate();
    if (!valid) return;

    loading.value = true;
    try {
        await userStore.login(form);
        if (rememberId.value) local.set(REMEMBER_KEY, form.loginId);
        else local.remove(REMEMBER_KEY);
        await router.replace(safeRedirect(route.query.redirect));
    } catch {
        // 에러 메시지는 http 인터셉터에서 토스트로 노출
        form.password = '';
    } finally {
        loading.value = false;
    }
};
</script>

<style scoped lang="scss">
.login-card {
    width: 100%;
    max-width: 420px;

    &__title {
        margin-top: $spacer-2;
        font-size: $font-size-2xl;
        font-weight: $font-weight-bold;
    }

    &__desc {
        margin-top: $spacer-1;
        font-size: $font-size-sm;
        color: rgba(var(--v-theme-on-surface), 0.6);
    }
}
</style>
