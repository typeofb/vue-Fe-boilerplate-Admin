<template>
    <ErrorTemplate
        code="500"
        title="일시적인 오류가 발생했습니다"
        description="잠시 후 다시 시도해 주세요.&#10;문제가 계속되면 시스템 관리자에게 문의해 주세요."
    />
</template>

<script setup>
import ErrorTemplate from './ErrorTemplate.vue';

defineOptions({name: 'ServerErrorView'});
</script>
