<template></template>

<script setup lang="ts"></script>

<style scoped></style>

<!-- <template>
  <div>
    <ProgressSpinner v-if="isLoading" />

    <template v-else>
      <DevicesTable
        v-if="hasDevices"
        :devices="devices"
        :loading="isLoading"
        @edit="editDevice"
      />
      <el-empty v-else :description="t('devices.noDevices')" />

      <DeviceEditDialog
        v-if="showEditDialog"
        :show-edit-dialog="showEditDialog"
        :selected-device="selectedDevice"
        :is-editing="isEditing"
        @save="handleSave"
        @cancel="closeEditDialog"
      />
    </template>
  </div>
</template>

<script setup lang="ts">
import { ElMessage } from 'element-plus';
import { useI18n } from 'vue-i18n';

import type { Device } from '@/types/device';

import DeviceEditDialog from '@/components/core/dialog/DeviceEditDialog.vue';
import ProgressSpinner from '@/components/core/ProgressSpinner.vue';
import DevicesTable from '@/components/core/table/DevicesTable.vue';
import { useDevices } from '@/composables/useDevices';
import { getDifferences } from '@/utils/common';

const { t } = useI18n();

const {
  // 狀態
  devices,
  selectedDevice,
  showEditDialog,
  isEditing,
  isLoading,
  hasDevices,
  lastUpdateTime,

  // 方法
  editDevice,
  patchDevice,
  applyLocalUpdate,
  closeEditDialog,
} = useDevices();

// 處理設備更新
const handleSave = async (updatedDevice: Partial<Device>) => {
  if (!selectedDevice.value) return;

  // TODO: 這個日後api有更新後 就直接傳參給api 不需要將資料過濾
  // 找出有變更屬性
  const changes = getDifferences<Device>(selectedDevice.value, updatedDevice);
  if (Object.keys(changes).length === 0) {
    closeEditDialog();
    return;
  }
  try {
    await patchDevice(selectedDevice.value.ID, changes);
    applyLocalUpdate(selectedDevice.value.ID, changes);
    ElMessage.success(t('message.success.update_success'));
  } catch (error) {
    console.error('Failed to update device:', error);
    ElMessage.error(t('message.error.update_failed'));
  }
  closeEditDialog();
};
</script>

<style scoped></style> -->
