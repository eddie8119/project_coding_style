<template>
  <div
    class="task-sidebar-card background-color-difference text-color-difference relative cursor-pointer rounded-md border p-3 shadow-sm transition-all duration-200 hover:shadow-md"
    :class="[timeAlertClasses, taskStatusClasses, stateClasses]"
    @click="$emit('select')"
  >
    <!-- 任務標題 -->
    <div class="mb-2 grid grid-cols-[1fr_auto] items-start gap-2">
      <h4 class="text-color-difference line-clamp-2 font-medium">{{ props.task.title }}</h4>

      <!-- 狀態指示器與建立時間 -->
      <div class="flex flex-col items-end text-right">
        <div class="text-gray-500">
          {{ formatShortDateTime(props.task.createdAt as unknown as UpdateTimeType) }}
        </div>
      </div>
    </div>

    <!-- 任務描述 -->
    <p v-if="props.task.description" class="description-text mb-3 line-clamp-2">
      {{ props.task.description }}
    </p>

    <!-- 操作按鈕 + 狀態徽章 -->
    <div class="mt-1 flex items-center justify-between gap-4">
      <div class="flex items-center space-x-2">
        <span v-if="pinControlButtons.length" class="flex items-center space-x-1">
          <button
            v-for="action in pinControlButtons"
            :key="action.key"
            class="flex h-8 w-8 items-center justify-center rounded-full bg-gray-200 text-gray-600 hover:bg-gray-300"
            :title="action.title"
            @click.stop="action.onClick()"
          >
            <span v-if="action.label">{{ action.label }}</span>
            <component
              :is="action.iconComponent"
              v-else-if="action.iconComponent"
              class="h-4 w-4 text-gray-600"
            />
          </button>
        </span>
      </div>

      <button
        type="button"
        :title="statusBadge.title"
        class="pointer-events-auto inline-flex items-center whitespace-nowrap rounded px-3 py-1.5 shadow-sm hover:opacity-90"
        :class="statusBadge.classes"
        @click.stop="handlePinButtonClick"
      >
        <img :src="statusBadge.icon" :alt="statusBadge.title" class="mr-1 h-4 w-4" />
        <span>{{ statusBadge.label }}</span>
        <span v-if="statusBadge.count" class="ml-1">({{ statusBadge.count }})</span>
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, toRef } from 'vue';
import { useI18n } from 'vue-i18n';

import type { UpdateTimeType } from '@/types/common';
import type { TaskResponse } from '@/types/response';
import type { Component } from 'vue';

import PinGreen from '@/assets/icons/PinGreen.png';
import PinRed from '@/assets/icons/PinRed.png';
import AddIcon from '@/components/ui/AddIcon.vue';
import TrashIcon from '@/components/ui/TrashIcon.vue';
import { useTaskCardStyle } from '@/composables/ui/useTaskCardStyle';
import { formatShortDateTime } from '@/utils/date';

const props = withDefaults(
  defineProps<{
    task: TaskResponse;
    isLinked: boolean;
    isSelected: boolean;
    isHighlighted: boolean;
    isPinning?: boolean;
    pinningTaskId?: string | null;
  }>(),
  {
    isPinning: false,
    pinningTaskId: null,
  }
);

const emit = defineEmits<{
  'add-pin-to-task': [taskId: string];
  select: [];
  'link-to-marker': [];
  'create-marker': [];
  'remove-pin': [];
  'cancel-marker': [];
}>();
const taskRef = toRef(props, 'task');
const { timeAlertClasses, taskStatusClasses } = useTaskCardStyle(taskRef);
const { t } = useI18n();

const isCurrentPinning = computed(
  () =>
    (!props.task.pinLocation || props.task.pinLocation.length === 0) &&
    props.isPinning &&
    props.pinningTaskId === props.task.id
);

const stateClasses = computed(() => ({
  'animate-side-highlight ring-2 ring-blue-400 ring-offset-2': props.isHighlighted,
  'border-blue-300 bg-blue-50 dark:bg-blue-900/20': props.isSelected && !props.isHighlighted,
  'border-green-300 bg-green-50 dark:bg-green-900/20':
    props.isLinked && !props.isSelected && !props.isHighlighted,
  'hover:border-brand-secondary/60': !props.isLinked && !props.isSelected && !props.isHighlighted,
}));

type PinControlButton = {
  key: string;
  title: string;
  label?: string;
  iconComponent?: Component;
  onClick: () => void;
};

const statusBadge = computed(() => {
  const hasPins = Boolean(props.task.pinLocation && props.task.pinLocation.length > 0);
  if (hasPins) {
    return {
      title: t('label.pin.pinning'),
      label: t('label.pin.pinned'),
      classes: ['border border-green-200 bg-green-50 text-green-700'],
      icon: PinGreen,
      count: props.task.pinLocation?.length ?? 0,
    };
  }
  return {
    title: t('label.pin.pin_task'),
    label: t('label.pin.not_pinned'),
    classes: ['border border-red-200 bg-red-50 text-red-600'],
    icon: PinRed,
    count: null,
  };
});

const pinControlButtons = computed<PinControlButton[]>(() => {
  if (!props.task.pinLocation || props.task.pinLocation.length === 0) {
    return [];
  }

  return [
    {
      key: 'add-pin',
      title: t('label.pin.pin_task'),
      iconComponent: AddIcon,
      onClick: () => emit('add-pin-to-task', props.task.id),
    },
    {
      key: 'remove-all',
      title: t('label.pin.remove_all'),
      iconComponent: TrashIcon,
      onClick: () => emit('remove-pin'),
    },
  ];
});

const handlePinButtonClick = () => {
  // If there are pins, the button's purpose is to remove them all.
  if (props.task.pinLocation && props.task.pinLocation.length > 0) {
    emit('remove-pin');
    return;
  }

  // If we are in the process of pinning this specific task, cancel it.
  if (isCurrentPinning.value) {
    emit('cancel-marker');
    return;
  }

  // Otherwise, start the process of creating a new (first) pin for this task.
  emit('create-marker');
};
</script>

<style scoped>
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>
