<template></template>

<script setup lang="ts"></script>

<style scoped></style>

<!-- <template>
  <div class="flex w-full items-center gap-2">
    <slot name="active" />
    <div
      class="flex w-full flex-col items-center gap-4 rounded-xl border border-black-300 px-3 py-4 lg:flex-row lg:justify-between"
    >

      <div class="flex w-56 flex-col items-center gap-4">
        <slot name="tag" />
        <el-switch
          v-model="allAlarmActive"
          :active-text="'on'"
          :inactive-text="'off'"
          :disabled="isDevicePowerOff"
          @change="handleSwitchChange"
        />
      </div>

      <div class="flex flex-col gap-6">

        <div v-for="(setting, index) in alarmSettings" :key="setting.alarm_type" class="mb-2">
          <AlarmSettingGroup
            v-model="alarmSettings[index]"
            :disabled="isLoading || !allAlarmActive"
            :loading="isLoading"
            :enabled="setting.active"
            :low-bound="deviceData.low_bound"
            :high-bound="deviceData.high_bound"
            @enable-change="handleSettingEnable(index, $event)"
          />
        </div>
        <TextButton
          v-if="authStore?.isAuthenticated"
          variant="primary"
          :size="isMobile ? 'sm' : 'md'"
          class="w-1/2 sm:w-auto"
          @click="handleSave"
        >
          {{ t('common.save') }}
        </TextButton>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useWindowSize } from '@vueuse/core';
import { ref, computed, onActivated, watch } from 'vue';
import { useI18n } from 'vue-i18n';

import AlarmSettingGroup from './AlarmSettingGroup.vue';

import type { AlarmSetting } from '@/types/alarm';
import type { DeviceAlarm } from '@/types/device';

import { alarmApi } from '@/api/alarm';
import TextButton from '@/components/core/button/TextButton.vue';
import { useAuthStore } from '@/stores/auth';

const { t } = useI18n();
const authStore = useAuthStore();
const { width } = useWindowSize();

const isMobile: boolean = computed(() => width.value < 640);
const isLoading = ref(false);

const props = defineProps<{
  deviceData: DeviceAlarm;
}>();

const emit = defineEmits<{
  (
    e: 'save',
    values: {
      low_alarm: number;
      high_alarm: number;
      low_bound: number;
      high_bound: number;
      alarm_settings: Array<{
        alarm_type: 'upper' | 'lower';
        interval: number;
        severity: string;
        threshold: number;
        active: boolean;
        repeat: number;
        email?: string[];
      }>;
    }
  ): void;
}>();

const isDevicePowerOff = computed(() => !props.deviceData.active);

// 警報開關
const allAlarmActive = ref<boolean>(false);

onActivated(() => {
  allAlarmActive.value = props.deviceData.alarm_settings.some((s: AlarmSetting) => s.active);
});

// 警報設定組
const alarmSettings = ref<AlarmSetting[]>([]);
const initAlarmSettings = ref<AlarmSetting[]>([
  {
    alarm_type: 'upper',
    interval: 0,
    severity: 'notice',
    threshold: 0,
    repeat: 0,
    categories: '',
    active: false,
    unit: '',
    email: [],
  },
  {
    alarm_type: 'lower',
    interval: 0,
    severity: 'notice',
    threshold: 0,
    repeat: 0,
    categories: '',
    active: false,
    unit: '',
    email: [],
  },
]);

watch(
  () => props.deviceData,
  (newData: DeviceAlarm) => {
    // 深拷貝 initAlarmSettings 以避免修改原始預設值
    const newSettings = JSON.parse(JSON.stringify(initAlarmSettings.value));
    if (newData.alarm_settings) {
      newData.alarm_settings.forEach((propSetting: AlarmSetting) => {
        const index = newSettings.findIndex(
          (s: AlarmSetting) => s.alarm_type === propSetting.alarm_type
        );
        if (index !== -1) {
          newSettings[index] = { ...newSettings[index], ...propSetting };
        }
      });
    }
    alarmSettings.value = newSettings;
    allAlarmActive.value = newData.active;
  },
  { immediate: true, deep: true }
);

// 處理 el-switch 變化
const handleSwitchChange = async (value: boolean) => {
  // 當總開關被手動操作時，同步所有子開關的狀態
  alarmSettings.value.forEach((setting: AlarmSetting) => {
    setting.active = value;
  });

  // 只有在都關閉時發送api 更新
  if (!value) {
    await alarmApi.postAlarmSetting(alarmSettings.value);
  }
};

// 處理設定組啟用狀態變化
const handleSettingEnable = (index: number, active: boolean) => {
  if (alarmSettings.value[index]) {
    alarmSettings.value[index].active = active;
  }

  // 根據子開關的狀態，決定總開關的狀態
  if (active) {
    // 任何一個子開關打開，總開關就應該是打開
    allAlarmActive.value = true;
  } else {
    // 當一個子開關被關閉時，檢查是否所有子開關都已關閉
    const allSubSwitchesOff = alarmSettings.value.every((setting: AlarmSetting) => !setting.active);
    if (allSubSwitchesOff) {
      // 如果所有子開關都關閉了，總開關也應關閉
      allAlarmActive.value = false;
    }
  }
};

const handleSave = async () => {
  const settingsWithStatus = alarmSettings.value.map((setting: AlarmSetting) => ({
    ...setting,
    active: setting.active, // 使用 setting.active
  }));

  // 確保 high_alarm 和 low_alarm 的順序正確
  const upperAlarm = alarmSettings.value.find((s: AlarmSetting) => s.alarm_type === 'upper');
  const lowerAlarm = alarmSettings.value.find((s: AlarmSetting) => s.alarm_type === 'lower');

  await alarmApi.postAlarmSetting(alarmSettings.value);

  emit('save', {
    low_alarm: lowerAlarm?.threshold ?? 0,
    high_alarm: upperAlarm?.threshold ?? 0,
    low_bound: props.deviceData.low_bound,
    high_bound: props.deviceData.high_bound,
    alarm_settings: settingsWithStatus,
  });
};
</script>

<style lang="scss" scoped>
.column-label {
  @apply text-xs text-gray-500;
}

:deep(.el-input-number) {
  @apply w-full sm:w-auto;

  .el-input__wrapper {
    @apply w-full sm:w-auto;
  }
}
.selector-style-input-number .el-input__wrapper {
  border-radius: 6px;
  border: 1px solid #dcdfe6;
  background: #fff;
  padding: 0 12px;
  transition: border-color 0.2s;
  min-height: 38px;
  box-shadow: none;
}

.selector-style-input-number .el-input__wrapper:hover,
.selector-style-input-number .el-input__wrapper:focus-within {
  border-color: #409eff;
  box-shadow: 0 0 0 2px rgba(64, 158, 255, 0.1);
}

.selector-style-input-number .el-input-number__decrease,
.selector-style-input-number .el-input-number__increase {
  background: transparent;
  border: none;
  color: #606266;
}
</style> -->
