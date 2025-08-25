<template>
  <el-dialog
    v-model="dialogVisible"
    :title="t('title.alarm_detail')"
    width="600px"
    @close="handleClose"
  >
    <div class="alarm-detail-content">
      <!-- 警報基本信息 -->
      <div class="mb-6 rounded-lg border p-4">
        <div class="mb-4 flex items-center justify-between">
          <div class="flex items-center gap-2">
            <div
              class="flex h-8 w-8 items-center justify-center rounded-full"
              :class="[
                {
                  'bg-secondary-yellow': alarm.type === 'warning',
                  'bg-secondary-red': alarm.type === 'error',
                },
              ]"
            >
              <i
                class="el-icon"
                :class="[
                  {
                    'el-icon-warning': alarm.type === 'warning',
                    'el-icon-error': alarm.type === 'error',
                  },
                ]"
              />
            </div>
            <div>
              <h3 class="text-base font-medium">
                {{ alarm.message }}
              </h3>
            </div>
          </div>
          <div>
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

        <div class="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div class="flex flex-col">
            <span class="text-xs text-gray-500">{{ t('label.device') }}</span>
            <span>{{ alarm.deviceName }}</span>
          </div>
          <div class="flex flex-col">
            <span class="text-xs text-gray-500">{{ t('label.time') }}</span>
            <span>{{ formatDate(alarm.timestamp) }}</span>
          </div>
          <div class="flex flex-col">
            <span class="text-xs text-gray-500">{{ t('label.status') }}</span>
            <span
              class="inline-flex rounded-full px-2 py-1 text-xs font-medium"
              :class="[
                {
                  'bg-secondary-yellow': alarm.status === 'pending',
                  'bg-secondary-red': alarm.status === 'handled',
                },
              ]"
            >
              {{ alarm.status === 'pending' ? t('status.pending') : t('status.handled') }}
            </span>
          </div>
          <div class="flex flex-col sm:col-span-2">
            <span class="text-xs text-gray-500">{{ t('label.detail') }}</span>
            <span>{{ alarm.detail }}</span>
          </div>
        </div>
      </div>

      <!-- 處理記錄 -->
      <div class="mb-4">
        <h3 class="mb-2 text-base font-medium">
          {{ t('title.handling_records') }}
        </h3>
        <div v-if="alarm.handlingRecords && alarm.handlingRecords.length > 0">
          <div
            v-for="(record, index) in alarm.handlingRecords"
            :key="index"
            class="mb-3 rounded-lg border p-3"
          >
            <div class="mb-2 flex items-center justify-between">
              <span class="font-medium">{{ record.handler }}</span>
              <span class="text-sm text-gray-500">{{ formatDate(record.timestamp) }}</span>
            </div>
            <div class="mb-1">
              <span class="text-xs text-gray-500">{{ t('label.action') }}</span>
              <p>{{ record.action }}</p>
            </div>
            <div>
              <span class="text-xs text-gray-500">{{ t('label.note') }}</span>
              <p>{{ record.note }}</p>
            </div>
          </div>
        </div>
        <el-empty v-else :description="t('message.no_handling_records')" :image-size="100" />
      </div>

      <!-- 添加處理記錄表單 -->
      <div v-if="alarm.status === 'pending'" class="border-t pt-4">
        <h3 class="mb-3 text-base font-medium">
          {{ t('title.add_handling_record') }}
        </h3>
        <el-form ref="formRef" :model="form" label-position="top">
          <el-form-item :label="t('label.action')" prop="action" :rules="[{ required: true }]">
            <el-input v-model="form.action" />
          </el-form-item>
          <el-form-item :label="t('label.note')" prop="note">
            <el-input v-model="form.note" type="textarea" :rows="3" />
          </el-form-item>
          <el-form-item>
            <el-checkbox v-model="form.markAsHandled">
              {{ t('label.mark_as_handled') }}
            </el-checkbox>
          </el-form-item>
        </el-form>
      </div>
    </div>

    <template #footer>
      <div class="dialog-footer">
        <el-button @click="dialogVisible = false">
          {{ t('common.cancel') }}
        </el-button>
        <el-button
          v-if="alarm.status === 'pending'"
          type="primary"
          :loading="isSubmitting"
          @click="handleSubmit"
        >
          {{ t('common.submit') }}
        </el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';

import type { AlarmHistory, HandlingRecord } from '@/types/alarm';
import type { FormInstance } from 'element-plus';

const { t } = useI18n();

const props = defineProps<{
  visible: boolean;
  alarm: AlarmHistory;
}>();

const emit = defineEmits<{
  (e: 'update:visible', value: boolean): void;
  (e: 'update', alarm: AlarmHistory): void;
}>();

const dialogVisible = ref(props.visible);
const isSubmitting = ref(false);
const formRef = ref<FormInstance>();

// 表單數據
const form = ref({
  action: '',
  note: '',
  markAsHandled: true,
});

// 監聽 visible 變化
watch(
  () => props.visible,
  (val) => {
    dialogVisible.value = val;
  }
);

// 監聽對話框可見性變化
watch(dialogVisible, (val) => {
  emit('update:visible', val);
});

// 格式化日期
const formatDate = (timestamp: number | string) => {
  const date = new Date(timestamp);
  return date.toLocaleString();
};

// 關閉對話框
const handleClose = () => {
  form.value = {
    action: '',
    note: '',
    markAsHandled: true,
  };
};

// 提交處理記錄
const handleSubmit = async () => {
  if (!formRef.value) return;

  await formRef.value.validate(async (valid) => {
    if (valid) {
      isSubmitting.value = true;

      try {
        // 創建新的處理記錄
        const newRecord: HandlingRecord = {
          timestamp: Date.now(),
          handler: 'Current User', // 實際應用中應該使用當前登錄用戶的名稱
          action: form.value.action,
          note: form.value.note,
        };

        // 更新警報
        const updatedAlarm: AlarmHistory = {
          ...props.alarm,
          handlingRecords: [...(props.alarm.handlingRecords || []), newRecord],
          status: form.value.markAsHandled ? 'handled' : 'pending',
        };

        // 在實際應用中，這裡應該調用 API 更新警報
        // 模擬 API 調用延遲
        await new Promise((resolve) => setTimeout(resolve, 500));

        // 發送更新事件
        emit('update', updatedAlarm);

        // 關閉對話框
        dialogVisible.value = false;
      } catch (error) {
        console.error('Failed to submit handling record:', error);
      } finally {
        isSubmitting.value = false;
      }
    }
  });
};
</script>

<style scoped>
.alarm-detail-content {
  max-height: 60vh;
  overflow-y: auto;
}
</style>
