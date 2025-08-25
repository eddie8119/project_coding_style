<template>
  <p class="absolute right-3 top-3 w-full text-right text-sm text-black-400">
    {{ t('common.last_update_time') }}: {{ props.lastUpdateTime }}
  </p>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n';

const { t } = useI18n();
const props = defineProps<{ lastUpdateTime: string | null }>();
</script>

<style scoped></style>
