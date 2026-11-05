<template>
    <ErrorTemplate
        code="404"
        title="페이지를 찾을 수 없습니다"
        description="요청하신 페이지가 존재하지 않거나 이동되었습니다.&#10;주소를 다시 확인해 주세요."
    />
</template>

<script setup>
import ErrorTemplate from './ErrorTemplate.vue';

defineOptions({name: 'NotFoundView'});
</script>
