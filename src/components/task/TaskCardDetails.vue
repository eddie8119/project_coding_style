<template>
  <div class="task-details grid grid-cols-1 gap-1 p-2">
    <!-- 任務描述 -->
    <template v-if="hasDescription">
      <div
        class="description-scroll description-text max-h-[150px] overflow-y-auto overflow-x-hidden whitespace-pre-wrap break-words"
      >
        {{ descriptionText }}
      </div>
      <div v-if="showDescriptionDivider" class="divider-line my-2" />
    </template>

    <!-- 任務材料 -->
    <div v-if="hasMaterials">
      <Label :label="t('label.material.usage') + ':'" />
      <MaterialList :materials="materialsList" />
    </div>
    <div v-if="showMaterialsDivider" class="divider-line" />

    <!-- 時間提醒 -->
    <div v-if="hasReminder" class="flex items-center text-gray-500">
      <DateIcon />
      <p class="mr-2">{{ t('label.reminder') }}</p>
      <span>{{ formatShortDateTime(reminderDateTime) }}</span>
    </div>
    <div v-if="hasEndDateTime" class="flex items-center text-gray-500">
      <DateIcon />
      <p class="mr-2">{{ t('label.end') }}</p>
      <span>{{ formatShortDateTime(endDateTime) }}</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';

import type { UpdateTimeType } from '@/types/common';
import type { TaskResponse } from '@/types/response';

import Label from '@/components/core/title/Label.vue';
import DateIcon from '@/components/ui/DateIcon.vue';
import MaterialList from '@/components/ui/MaterialList.vue';
import { useTaskCardFilterContext } from '@/context/useTaskCardFilterContext';
import { formatShortDateTime } from '@/utils/date';

const props = defineProps<{
  task: TaskResponse;
}>();

const { t } = useI18n();
const { showDescription, showMaterials } = useTaskCardFilterContext();

const descriptionText = computed(() => props.task.description?.trim() ?? '');
const materialsList = computed(() =>
  Array.isArray(props.task.materials) ? props.task.materials : []
);
const reminderDateTime = computed<UpdateTimeType>(() => props.task.reminderDateTime ?? null);
const endDateTime = computed<UpdateTimeType>(() => props.task.endDateTime ?? null);

const hasDescription = computed(() => showDescription.value && descriptionText.value.length > 0);
const hasMaterials = computed(() => showMaterials.value && materialsList.value.length > 0);
const hasReminder = computed(() => Boolean(reminderDateTime.value));
const hasEndDateTime = computed(() => Boolean(endDateTime.value));

const showDescriptionDivider = computed(
  () => hasDescription.value && (hasMaterials.value || hasReminder.value)
);
const showMaterialsDivider = computed(
  () => hasMaterials.value && (hasReminder.value || hasEndDateTime.value)
);
</script>
