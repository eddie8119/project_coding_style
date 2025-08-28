<template>
  <BasicEditDialog
    v-model="dialogVisible"
    :title="t('title.edit_custom_name')"
    :is-submitting="isSubmitting"
    @submit="onSubmit"
    @cancel="onCancel"
  >
    <el-form-item :label="t('device.customName')" :error="errors.tag">
      <el-input v-model="tag" :placeholder="t('device.customName')" @blur="handleBlurTag" />
    </el-form-item>
  </BasicEditDialog>
</template>

<script setup lang="ts">
import { toTypedSchema } from '@vee-validate/zod';
import { useField, useForm } from 'vee-validate';
import { computed, ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';

import type { Device } from '@/types/device';

import BasicEditDialog from '@/components/core/dialog/BasicEditDialog.vue';
import { tagSchema } from '@/utils/schemas/tagSchema';

const { t } = useI18n();

const props = defineProps<{
  modelValue: boolean;
  deviceData: Device;
}>();

const emit = defineEmits<{
  'update:modelValue': [value: boolean];
  'update:deviceData': [deviceData: Device];
}>();

const dialogVisible = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value),
});

const localDeviceData = ref<Device>({ ...props.deviceData });

watch(
  () => props.deviceData,
  (newVal) => {
    localDeviceData.value = { ...newVal };
  },
  { immediate: true, deep: false }
);

const { handleSubmit, errors, isSubmitting } = useForm({
  validationSchema: toTypedSchema(tagSchema),
  initialValues: { tag: localDeviceData.value.tag || '' },
});

const { value: tag, handleBlur: handleBlurTag } = useField('tag');

const onSubmit = handleSubmit((values) => {
  try {
    emit('update:deviceData', {
      ...localDeviceData.value,
      tag: values.tag,
    });

    onCancel();
  } catch (error) {
    console.error('Failed to update device tag:', error);
  }
});

const onCancel = () => {
  emit('update:modelValue', false);
};
</script>
