<template>
  <ObservationLayout
    :subject="props.observationType"
    :title="t(`observation.${props.observationType}`)"
  />
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n';

import type { ObservationType } from '@/types/device';

import ObservationLayout from '@/components/app-layout/ObservationLayout.vue';

const { t } = useI18n();
const props = defineProps<{
  observationType: ObservationType;
}>();
</script>
