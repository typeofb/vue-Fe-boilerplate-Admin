<template>
    <ErrorTemplate
        code="403"
        title="접근 권한이 없습니다"
        description="이 페이지에 접근할 수 있는 권한이 없습니다.&#10;필요한 경우 시스템 관리자에게 문의해 주세요."
    />
</template>

<script setup>
import ErrorTemplate from './ErrorTemplate.vue';

defineOptions({name: 'ForbiddenView'});
</script>
