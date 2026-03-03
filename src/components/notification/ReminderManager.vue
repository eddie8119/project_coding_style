<template>
  <div class="reminder-manager">
    <div class="mb-4 flex items-center justify-between">
      <h2 class="text-xl font-semibold">{{ t('notification.reminderManager') }}</h2>
      <div class="flex space-x-2">
        <ElButton type="primary" :loading="isChecking" @click="handleCheckReminders">
          {{ t('notification.checkReminders') }}
        </ElButton>
        <ElButton type="success" :loading="isLoadingReminders" @click="refetchReminders">
          {{ t('common.refresh') }}
        </ElButton>
      </div>
    </div>

    <ElAlert
      v-if="checkSuccess"
      type="success"
      :title="t('notification.checkSuccess', { count: checkCount })"
      show-icon
      class="mb-4"
    />

    <ElTable
      v-loading="isLoadingReminders"
      :data="pendingReminders || []"
      border
      style="width: 100%"
      empty-text="No pending reminders"
    >
      <ElTableColumn prop="title" :label="t('task.title')" min-width="150" />
      <ElTableColumn :label="t('task.project')" min-width="150">
        <template #default="scope">
          {{ scope.row.Projects?.title || '-' }}
        </template>
      </ElTableColumn>
      <ElTableColumn :label="t('task.reminderTime')" min-width="180">
        <template #default="scope">
          <div class="flex items-center">
            <ElIcon class="mr-1"><Clock /></ElIcon>
            {{ formatDateTime(scope.row.reminder_date_time) }}
          </div>
        </template>
      </ElTableColumn>
      <ElTableColumn :label="t('task.status')" width="120">
        <template #default="scope">
          <ElTag :type="getStatusType(scope.row.status)">
            {{ scope.row.status }}
          </ElTag>
        </template>
      </ElTableColumn>
      <ElTableColumn :label="t('notification.reminderStatus')" width="150">
        <template #default="scope">
          <div class="flex items-center">
            <ElTag
              v-if="scope.row.line_reminder_sent"
              type="success"
              effect="dark"
              size="small"
              class="mr-1"
            >
              LINE
            </ElTag>
            <ElTag v-else type="info" effect="plain" size="small" class="mr-1"> LINE </ElTag>
            <ElTag v-if="scope.row.email_reminder_sent" type="success" effect="dark" size="small">
              Email
            </ElTag>
            <ElTag v-else type="info" effect="plain" size="small"> Email </ElTag>
          </div>
        </template>
      </ElTableColumn>
      <ElTableColumn :label="t('common.actions')" width="120" fixed="right">
        <template #default="scope">
          <ElButton
            type="primary"
            size="small"
            :loading="isResetting"
            @click="handleResetReminder(scope.row.id)"
          >
            {{ t('notification.reset') }}
          </ElButton>
        </template>
      </ElTableColumn>
    </ElTable>

    <div
      v-if="pendingReminders && pendingReminders.length > 0"
      class="mt-4 text-right text-sm text-gray-500"
    >
      {{ t('common.lastUpdated') }}: {{ formatDateTime(new Date(remindersUpdatedAt)) }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { Clock } from '@element-plus/icons-vue';
import { ref } from 'vue';
import { useI18n } from 'vue-i18n';

import { useNotifications } from '@/composables/query/useNotifications';

const { t } = useI18n();

const {
  pendingReminders,
  isLoadingReminders,
  refetchReminders,
  remindersUpdatedAt,
  checkReminders,
  isChecking,
  resetReminderStatus,
  isResetting,
} = useNotifications();

const checkSuccess = ref(false);
const checkCount = ref(0);

// 格式化日期時間
const formatDateTime = (dateTime: string | Date) => {
  if (!dateTime) return '-';
  const date = new Date(dateTime);
  return date.toLocaleString('zh-TW', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
};

// 根據任務狀態獲取標籤類型
const getStatusType = (status: string) => {
  switch (status) {
    case 'completed':
      return 'success';
    case 'inProgress':
      return 'warning';
    case 'pending':
      return 'info';
    default:
      return 'info';
  }
};

// 手動檢查提醒
const handleCheckReminders = async () => {
  const result = await checkReminders();
  if (result) {
    checkSuccess.value = result.success;
    checkCount.value = result.count;
    setTimeout(() => {
      checkSuccess.value = false;
    }, 5000);
  }
};

// 重置提醒狀態
const handleResetReminder = async (taskId: string) => {
  await resetReminderStatus(taskId);
};
</script>

<style lang="scss" scoped>
.reminder-manager {
  padding: 1rem;
}
</style>
