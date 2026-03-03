<template>
  <PillTab
    :model-value="taskTimeCondition"
    :tabs="tabs"
    :label="t('label.time') + t('label.filter') + ':'"
    show-label
    @update:model-value="emits('update:taskTimeCondition', $event as TaskTimeCondition)"
  >
    <template #item="{ tab }">
      {{ t(`label.time_status.${tab.value}`) }}
    </template>
  </PillTab>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';

import PillTab from '@/components/core/tab/PillTab.vue';
import { OVERVIEW_TASK_CONDITION_TAB_LIST } from '@/constants/tab';
import { TaskTimeCondition } from '@/types/task';

const { taskTimeCondition } = defineProps<{
  taskTimeCondition: TaskTimeCondition;
}>();

const emits = defineEmits<{ (e: 'update:taskTimeCondition', value: TaskTimeCondition): void }>();

const { t } = useI18n();

const tabs = computed(() => OVERVIEW_TASK_CONDITION_TAB_LIST.map((tab) => ({ value: tab.name })));
</script>
