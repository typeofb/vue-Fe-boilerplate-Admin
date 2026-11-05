<template>
    <v-navigation-drawer
        :model-value="mobile ? appStore.drawer : true"
        :rail="!mobile && appStore.rail"
        :temporary="mobile"
        :width="256"
        :rail-width="64"
        class="app-sidebar"
        @update:model-value="(v) => mobile && (appStore.drawer = v)"
    >
        <div class="app-sidebar__brand">
            <router-link to="/" class="app-sidebar__logo">
                <v-icon icon="mdi-shield-crown-outline" color="primary" size="28" />
                <span v-if="!railActive" class="app-sidebar__name">{{ APP_TITLE }}</span>
            </router-link>
        </div>
        <v-divider />

        <v-list v-model:opened="opened" density="comfortable" nav color="primary" class="app-sidebar__menu">
            <template v-for="menu in menus" :key="menu.path">
                <!-- 그룹 메뉴 (LNB) -->
                <v-list-group v-if="menu.children" :value="menu.path">
                    <template #activator="{props: groupProps}">
                        <v-list-item v-bind="groupProps" :prepend-icon="menu.icon" :title="menu.title" />
                    </template>
                    <v-list-item
                        v-for="child in menu.children"
                        :key="child.path"
                        :to="child.path"
                        :title="child.title"
                        :active="isActive(child.path)"
                        :prepend-icon="child.icon"
                    />
                </v-list-group>

                <!-- 단일 메뉴 -->
                <v-list-item
                    v-else
                    :to="menu.path"
                    :prepend-icon="menu.icon"
                    :title="menu.title"
                    :active="isActive(menu.path)"
                />
            </template>
        </v-list>
    </v-navigation-drawer>
</template>

<script setup>
/**
 * 사이드바 (GNB/LNB)
 *  - 메뉴는 라우트 meta 에서 생성되며, 권한 없는 메뉴는 자동으로 숨겨집니다. (composables/useMenu.js)
 *  - PC: 아이콘 모드(rail) 전환 / 모바일: 오버레이(temporary)
 */
import {computed, ref, watch} from 'vue';
import {useDisplay} from 'vuetify';
import {APP_TITLE} from '@/config';
import {useMenu} from '@/composables/useMenu';
import {useAppStore} from '@/stores/app.store';

defineOptions({name: 'AppSidebar'});

const appStore = useAppStore();
const {mobile} = useDisplay();
const {menus, activePath} = useMenu();

const railActive = computed(() => !mobile.value && appStore.rail);
const opened = ref([]);

const isActive = (path) => activePath.value === path || activePath.value.startsWith(`${path}/`);

// 현재 경로가 속한 그룹 자동 펼침
watch(
    [activePath, menus],
    () => {
        const group = menus.value.find((m) => m.children?.some((c) => isActive(c.path)));
        if (group && !opened.value.includes(group.path)) opened.value = [...opened.value, group.path];
    },
    {immediate: true},
);

// 모바일에서 메뉴 이동 시 사이드바 닫기
watch(activePath, () => {
    if (mobile.value) appStore.drawer = false;
});
</script>

<style scoped lang="scss">
.app-sidebar {
    &__brand {
        display: flex;
        align-items: center;
        height: $header-height;
        padding: 0 $spacer-4;
    }

    &__logo {
        display: flex;
        gap: $spacer-2;
        align-items: center;
        min-width: 0;
    }

    &__name {
        @include ellipsis;

        font-size: $font-size-lg;
        font-weight: $font-weight-bold;
    }

    &__menu {
        :deep(.v-list-item-title) {
            font-size: $font-size-base;
        }
    }
}
</style>
