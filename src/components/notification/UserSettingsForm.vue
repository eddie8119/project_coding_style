<template>
  <div class="user-settings-form">
    <div class="mb-6">
      <h2 class="mb-2 text-xl font-semibold">{{ t('settings.notificationSettings') }}</h2>
      <p class="text-gray-500">{{ t('settings.notificationSettingsDescription') }}</p>
    </div>

    <ElForm
      v-loading="isLoadingSettings"
      :model="formData"
      label-position="top"
      @submit.prevent="handleSubmit"
    >
      <!-- LINE Notify Token -->
      <ElFormItem :label="t('settings.lineNotifyToken')">
        <div class="mb-2">
          <ElInput
            v-model="formData.lineNotifyToken"
            type="password"
            show-password
            :placeholder="t('settings.enterLineNotifyToken')"
          />
        </div>
        <div class="mb-2 text-sm text-gray-500">
          {{ t('settings.lineNotifyTokenDescription') }}
        </div>
        <ElLink
          href="https://notify-bot.line.me/zh_TW/"
          target="_blank"
          type="primary"
          class="text-sm"
        >
          {{ t('settings.getLineNotifyToken') }} <ElIcon class="ml-1"><Link /></ElIcon>
        </ElLink>
      </ElFormItem>

      <!-- 通知開關 -->
      <ElFormItem>
        <ElSwitch
          v-model="formData.lineNotificationsEnabled"
          :active-text="t('settings.enableLineNotifications')"
          class="mb-2"
        />
        <div>
          <ElSwitch
            v-model="formData.emailNotificationsEnabled"
            :active-text="t('settings.enableEmailNotifications')"
          />
        </div>
      </ElFormItem>

      <!-- 提交按鈕 -->
      <ElFormItem>
        <ElButton type="primary" native-type="submit" :loading="isUpdating">
          {{ t('common.save') }}
        </ElButton>
      </ElFormItem>
    </ElForm>

    <!-- 成功提示 -->
    <ElAlert
      v-if="saveSuccess"
      type="success"
      :title="t('settings.saveSuccess')"
      show-icon
      class="mt-4"
    />
  </div>
</template>

<script setup lang="ts">
import { Link } from '@element-plus/icons-vue';
import { reactive, ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';

import { useUserSettings } from '@/composables/query/useUserSettings';

const { t } = useI18n();

const { userSettings, isLoadingSettings, updateSettings, isUpdating } = useUserSettings();

// 表單數據
const formData = reactive({
  lineNotifyToken: '',
  lineNotificationsEnabled: true,
  emailNotificationsEnabled: true,
});

// 保存成功提示
const saveSuccess = ref(false);

// 監聽用戶設置變化，更新表單數據
watch(
  userSettings,
  (newSettings) => {
    if (newSettings) {
      formData.lineNotifyToken = newSettings.lineNotifyToken || '';
      formData.lineNotificationsEnabled = newSettings.lineNotificationsEnabled;
      formData.emailNotificationsEnabled = newSettings.emailNotificationsEnabled;
    }
  },
  { immediate: true }
);

// 提交表單
const handleSubmit = async () => {
  const success = await updateSettings({
    lineNotifyToken: formData.lineNotifyToken || null,
    lineNotificationsEnabled: formData.lineNotificationsEnabled,
    emailNotificationsEnabled: formData.emailNotificationsEnabled,
  });

  if (success) {
    saveSuccess.value = true;
    setTimeout(() => {
      saveSuccess.value = false;
    }, 3000);
  }
};
</script>

<style lang="scss" scoped>
.user-settings-form {
  max-width: 600px;
  padding: 1rem;
}
</style>
