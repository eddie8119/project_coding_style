<template></template>

<script setup lang="ts"></script>

<style scoped></style>

<!-- <template>
  <BasicEditDialog
    v-model="dialogVisible"
    :title="t('title.edit_device')"
    :is-submitting="isSubmitting"
    @submit="onSubmit"
    @cancel="onCancel"
  >
    <div class="grid w-full grid-cols-2">
      <el-form-item label="ID" prop="ID">
        <el-input v-model.trim="ID" disabled />
      </el-form-item>

      <el-form-item label="Location" prop="location">
        <el-input v-model.trim="location" disabled />
      </el-form-item>

      <el-form-item label="Product" prop="product_name">
        <el-input v-model.trim="product_name" disabled />
      </el-form-item>

      <el-form-item label="Measure Unit" prop="main_unit">
        <el-input v-model.trim="main_unit" disabled />
      </el-form-item>
    </div>

    <el-form-item label="Group" prop="group" :error="errors.group">
      <el-input v-model.trim="group" />
    </el-form-item>

    <el-form-item label="Tag" prop="tag" :error="errors.tag">
      <el-input v-model.trim="tag" />
    </el-form-item>

    <div class="grid w-full grid-cols-2">
      <el-form-item label="Low Bound" prop="low_bound" :error="errors.low_bound">
        <el-input-number v-model="low_bound" :step="1" controls-position="right" />
      </el-form-item>

      <el-form-item label="Low Alarm" prop="low_alarm" :error="errors.low_alarm">
        <el-input-number v-model="low_alarm" :step="1" controls-position="right" />
      </el-form-item>

      <el-form-item label="High Alarm" prop="high_alarm" :error="errors.high_alarm">
        <el-input-number v-model="high_alarm" :step="1" controls-position="right" />
      </el-form-item>

      <el-form-item label="High Bound" prop="high_bound" :error="errors.high_bound">
        <el-input-number v-model="high_bound" :step="1" controls-position="right" />
      </el-form-item>
    </div>
  </BasicEditDialog>
</template>

<script setup lang="ts">
import { toTypedSchema } from '@vee-validate/zod';
import { useForm, useField } from 'vee-validate';
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';

import type { Device } from '@/types/device';

import BasicEditDialog from '@/components/core/dialog/BasicEditDialog.vue';
import { editDeviceSchema } from '@/utils/schemas/editDeviceSchema';

const { t } = useI18n();

const props = defineProps<{
  showEditDialog: boolean;
  selectedDevice: Device;
  isEditing: boolean;
}>();

const emit = defineEmits<{
  (e: 'save', selectedDevice: Device): void;
  (e: 'cancel'): void;
}>();

const dialogVisible = computed({
  get: () => props.showEditDialog,
  set: () => emit('cancel'), // 當 dialog 關閉時觸發 cancel
});

const { handleSubmit, errors, isSubmitting } = useForm({
  validationSchema: toTypedSchema(editDeviceSchema),
  initialValues: props.selectedDevice,
});

// 使用 useField 來處理每個字段
const { value: ID } = useField<string>('ID');
const { value: location } = useField<string>('location');
const { value: product_name } = useField<string>('product_name');
const { value: main_unit } = useField<string>('main_unit');
const { value: group } = useField<string>('group');
const { value: tag } = useField<string>('tag');
const { value: low_bound } = useField<number>('low_bound');
const { value: low_alarm } = useField<number>('low_alarm');
const { value: high_alarm } = useField<number>('high_alarm');
const { value: high_bound } = useField<number>('high_bound');

const onSubmit = handleSubmit(async (values): Promise<void> => {
  if (Object.keys(errors.value).length > 0) return;
  try {
    emit('save', values);
  } catch (error) {
    console.error('Save failed:', error);
  }
});

const onCancel = () => {
  emit('cancel');
};
</script>

<style lang="scss" scoped></style> -->
