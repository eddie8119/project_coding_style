<template>
  <BasicEditDialog
    v-model="dialogVisible"
    :title="t('title.edit_water_quality')"
    :is-submitting="isSubmitting"
    @submit="onSubmit"
    @cancel="onCancel"
  >
    <el-form-item :error="errors.waterQuality">
      <Selector
        v-model="waterQuality"
        :options="waterOptionsList"
        :label="t('device.water_area')"
        placeholder="選擇水域"
        :disabled="isLoading"
        :loading="isLoading"
        :filterable="true"
        class="w-full"
        value-key="value"
        label-key="name"
      />
    </el-form-item>
  </BasicEditDialog>
</template>

<script setup lang="ts">
import { useField, useForm } from 'vee-validate';
import { computed, watch } from 'vue';
import { useI18n } from 'vue-i18n';

import BasicEditDialog from '@/components/core/dialog/BasicEditDialog.vue';
import Selector from '@/components/core/input/Selector.vue';

const { t } = useI18n();

const props = defineProps<{
  modelValue: boolean; // For dialog visibility
  waterQualityValue: string; // The initial value
  waterOptionsList: { name: string; value: string }[];
  isSubmitting?: boolean;
  isLoading?: boolean;
}>();

const emit = defineEmits<{
  'update:modelValue': [value: boolean];
  'update:waterQuality': [newWaterQuality: string];
}>();

// --- 3. COMPUTED PROPERTIES ---
// A computed property to make the dialog's visibility v-model compatible
const dialogVisible = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val),
});

// --- 4. FORM LOGIC (VeeValidate) ---
const { errors, handleSubmit, setValues } = useForm({
  initialValues: {
    waterQuality: props.waterQualityValue,
  },
});

const { value: waterQuality } = useField<string>('waterQuality');

// Watch for prop changes to update the form value if the dialog is reopened with different data
watch(
  () => props.waterQualityValue,
  (newValue) => {
    setValues({ waterQuality: newValue });
  }
);

// --- 5. EVENT HANDLERS ---
const onSubmit = handleSubmit((values) => {
  if (values.waterQuality) {
    emit('update:waterQuality', values.waterQuality);
    onCancel();
  }
});

const onCancel = () => {
  dialogVisible.value = false;
};
</script>
