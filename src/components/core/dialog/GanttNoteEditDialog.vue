<template>
  <BasicEditDialog
    v-model="dialogVisible"
    :title="dialogTitle"
    :is-submitting="isSubmitting"
    @submit="emit('submit')"
    @cancel="emit('cancel')"
  >
    <div class="space-y-3">
      <div v-if="dateLabel" class="text-xs text-slate-400 dark:text-gray-500">
        {{ dateLabel }}
      </div>
      <ElInput v-model="noteValueModel" type="textarea" :rows="2" />
    </div>
  </BasicEditDialog>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';

import BasicEditDialog from '@/components/core/dialog/BasicEditDialog.vue';

const props = withDefaults(
  defineProps<{
    modelValue: boolean;
    noteValue: string;
    title?: string;

    dateLabel?: string;
    isSubmitting?: boolean;
  }>(),
  {
    modelValue: false,
    noteValue: '',
    title: '',

    dateLabel: '',
    isSubmitting: false,
  }
);

const emit = defineEmits<{
  'update:modelValue': [value: boolean];
  'update:noteValue': [value: string];
  submit: [];
  cancel: [];
}>();

const { t } = useI18n();

const dialogVisible = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value),
});

const noteValueModel = computed({
  get: () => props.noteValue,
  set: (value: string) => emit('update:noteValue', value),
});

const dialogTitle = computed(() => {
  if (props.title) return props.title;
  if (props.dateLabel) return props.dateLabel;
  return t('title.edit_note');
});
</script>
