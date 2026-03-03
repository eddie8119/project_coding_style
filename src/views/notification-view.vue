<template>
  <div class="notification-view">
    <ElTabs v-model="activeTab">
      <ElTabPane :label="t('notification.reminderManager')" name="reminders">
        <ReminderManager />
      </ElTabPane>
      <ElTabPane :label="t('settings.notificationSettings')" name="settings">
        <UserSettingsForm />
      </ElTabPane>
    </ElTabs>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useI18n } from 'vue-i18n';

import ReminderManager from '@/components/notification/ReminderManager.vue';
import UserSettingsForm from '@/components/notification/UserSettingsForm.vue';

const { t } = useI18n();
const activeTab = ref('reminders');
</script>

<style lang="scss" scoped>
.notification-view {
  padding: 1rem;
}
</style>
