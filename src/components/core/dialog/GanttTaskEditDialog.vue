<template>
  <BasicEditDialog
    v-model="dialogVisible"
    :title="dialogTitle"
    :is-submitting="isSubmitting"
    @submit="emit('submit')"
  >
    <ElFormItem :label="t('label.content')">
      <ElInput v-model="contentModel" type="textarea" :rows="2" />
    </ElFormItem>

    <ElFormItem :label="t('label.date_range')">
      <ElDatePicker
        v-model="dateRangeModel"
        type="daterange"
        range-separator="~"
        :start-placeholder="t('label.start_time')"
        :end-placeholder="t('label.end_time')"
        format="YYYY-MM-DD"
      />
    </ElFormItem>
  </BasicEditDialog>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';

import BasicEditDialog from '@/components/core/dialog/BasicEditDialog.vue';

const props = withDefaults(
  defineProps<{
    modelValue: boolean;
    title?: string;
    mode?: 'create' | 'edit';
    content: string;
    dateRange: [Date, Date] | null;
    isSubmitting?: boolean;
  }>(),
  {
    modelValue: false,
    title: '',
    mode: 'edit',
    content: '',
    dateRange: null,
    isSubmitting: false,
  }
);

const emit = defineEmits<{
  'update:modelValue': [value: boolean];
  'update:content': [value: string];
  'update:dateRange': [value: [Date, Date] | null];
  submit: [];
}>();

const { t } = useI18n();

const dialogTitle = computed(() => {
  if (props.title) return props.title;
  const key = props.mode === 'create' ? 'title.create_planning' : 'title.edit_planning';
  return t(key);
});

const dialogVisible = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value),
});

const contentModel = computed({
  get: () => props.content,
  set: (value: string) => emit('update:content', value),
});

const dateRangeModel = computed({
  get: () => props.dateRange,
  set: (value: [Date, Date] | null) => emit('update:dateRange', value),
});
</script>
