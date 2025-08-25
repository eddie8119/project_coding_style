<template>
  <div
    class="alarm-history-card flex flex-col rounded-lg border bg-white p-4 shadow-sm transition-all hover:shadow-md"
    :class="[
      {
        'border-secondary-yellow': alarm.type === 'warning',
        'border-secondary-red': alarm.type === 'error',
      },
    ]"
  >
    <div class="flex items-center justify-between">
      <div class="flex items-center gap-2">
        <h3 class="text-base font-medium">
          {{ alarm.message }}
        </h3>
      </div>
      <div class="text-right">
        <span
          class="inline-flex rounded-full px-2 py-1 text-xs font-medium"
          :class="[
            {
              'bg-secondary-yellow': alarm.type === 'warning',
              'bg-secondary-red': alarm.type === 'error',
            },
          ]"
        >
          {{ alarm.type }}
        </span>
      </div>
    </div>

    <div class="mt-3 flex flex-wrap items-center justify-between gap-2 text-sm">
      <div class="flex items-center gap-2">
        <span>{{ formatDate(alarm.timestamp) }}</span>
      </div>
      <div>
        <el-button type="primary" size="small" plain @click="$emit('view-detail', alarm)">
          {{ t('common.view_detail') }}
        </el-button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n';

import type { AlarmHistory } from '@/types/alarm';

const { t } = useI18n();

defineProps<{
  alarm: AlarmHistory;
}>();

defineEmits<{
  (e: 'view-detail', alarm: AlarmHistory): void;
}>();

// 格式化日期
const formatDate = (timestamp: number | string) => {
  const date = new Date(timestamp);
  return date.toLocaleString();
};
</script>

<style scoped>
.alarm-history-card {
  transition: all 0.2s ease;
}

.alarm-history-card:hover {
  transform: translateY(-2px);
}
</style>
