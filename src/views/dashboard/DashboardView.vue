<template>
    <div>
        <div class="page-header">
            <h2 class="page-header__title">대시보드</h2>
            <span class="text-caption text-medium-emphasis">{{ formatDateTime(now) }} 기준</span>
        </div>

        <v-row>
            <v-col v-for="card in cards" :key="card.title" cols="12" sm="6" lg="3">
                <v-card border class="pa-5">
                    <div class="d-flex align-center justify-space-between">
                        <div>
                            <div class="text-body-2 text-medium-emphasis">{{ card.title }}</div>
                            <div class="text-h5 font-weight-bold mt-1">{{ formatNumber(card.value) }}</div>
                        </div>
                        <v-avatar :color="card.color" variant="tonal" size="48">
                            <v-icon :icon="card.icon" />
                        </v-avatar>
                    </div>
                </v-card>
            </v-col>
        </v-row>

        <v-card border class="mt-4 pa-5">
            <div class="text-subtitle-1 font-weight-bold mb-2">안녕하세요, {{ userStore.user?.name }}님</div>
            <p class="text-body-2 text-medium-emphasis">
                역할: {{ userStore.roles.join(', ') }} / 권한: {{ userStore.permissions.join(', ') || '-' }}
            </p>
        </v-card>
    </div>
</template>

<script setup>
import {useUserStore} from '@/stores/user.store';
import {formatDateTime, formatNumber} from '@/utils/format';

defineOptions({name: 'DashboardView'});

const userStore = useUserStore();
const now = new Date();

// TODO: 대시보드 API 연동
const cards = [
    {title: '전체 회원', value: 12840, icon: 'mdi-account-group-outline', color: 'primary'},
    {title: '오늘 가입', value: 32, icon: 'mdi-account-plus-outline', color: 'success'},
    {title: '미처리 문의', value: 7, icon: 'mdi-message-alert-outline', color: 'warning'},
    {title: '오늘 매출(원)', value: 3820000, icon: 'mdi-cash-multiple', color: 'info'},
];
</script>
