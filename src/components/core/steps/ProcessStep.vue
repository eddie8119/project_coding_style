<template>
  <div class="step-indicator-container">
    <!-- Step circle -->
    <div
      class="step-circle"
      :class="[
        props.status === ProcessStatus.FINISH
          ? 'finish'
          : props.status === ProcessStatus.RUNNING
            ? 'running'
            : 'pending',
      ]"
    >
      <template v-if="props.status === ProcessStatus.FINISH">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
        >
          <polyline points="20 6 9 17 4 12" />
        </svg>
      </template>
      <template v-else-if="props.status === 'failed'">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
        >
          <line x1="18" y1="6" x2="6" y2="18" />
          <line x1="6" y1="6" x2="18" y2="18" />
        </svg>
      </template>
      <template v-else> {{ t('device.action') }} </template>
    </div>

    <!-- Step title -->
    <div class="step-info">
      <div
        class="step-title mt-3"
        :class="{
          active: props.status === ProcessStatus.RUNNING,
          finish: props.status === ProcessStatus.FINISH,
          failed: props.status === ProcessStatus.FAILED,
        }"
      >
        {{ props.title }}
      </div>
      <p>{{ statusText }}</p>
    </div>

    <!-- Connector line -->
    <div
      v-if="!props.isLast"
      class="step-connector"
      :class="{ active: props.status === ProcessStatus.FINISH }"
    />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';

import { ProcessStatus } from '@/types/action';

const { t } = useI18n();

interface Props {
  step: number;
  title: string;
  status: ProcessStatus;
  isLast?: boolean;
}

const props = defineProps<Props>();

const statusText = computed(() => {
  switch (props.status) {
    case ProcessStatus.FINISH:
      return t('device.status.finish');
    case ProcessStatus.RUNNING:
      return t('device.status.running');
    case ProcessStatus.PENDING:
      return t('device.status.pending');
    case ProcessStatus.FAILED:
      return t('device.status.failed');
    default:
      return '-';
  }
});
</script>

<style scoped>
.step-indicator-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  position: relative;
  width: 210px; /* Increased width to give titles more space */
}

.step-circle {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  z-index: 2;
  transition: all 0.3s ease;
  color: #6b7280;
  background-color: #f3f4f6;
  border: 2px solid #e5e7eb;
}

.step-circle.finish {
  @apply bg-secondary-green;
  color: white;
}

.step-circle.running {
  background-color: #3b82f6;
  border-color: #3b82f6;
  color: white;
}

.step-circle.failed {
  background-color: #ef4444;
  border-color: #ef4444;
  color: white;
}

.step-info {
  margin-top: 8px;
  text-align: center;
  width: 100%;
}

.step-title {
  font-weight: 500;
  color: #6b7280;
  margin-bottom: 4px;
  white-space: normal; /* Allow text to wrap */
  overflow: visible; /* Show all content */
  text-align: center;
  width: 100%;
  word-break: break-all; /* Force line breaks for long words */
  hyphens: auto;
}

.step-title.active {
  @apply text-brand-primary;
  font-weight: 600;
}

.step-title.finish {
  color: #10b981;
  font-weight: 600;
}

.step-title.failed {
  color: #ef4444;
  font-weight: 600;
}

.step-connector {
  position: absolute;
  top: 28px;
  left: 50%; /* Start from the center of the step */
  width: 100%;
  height: 2px;
  background-color: #e5e7eb;
  z-index: 1;
  transform: translateX(20px); /* Offset to start after the circle */
}

.step-connector.active {
  @apply bg-secondary-green;
}
</style>
