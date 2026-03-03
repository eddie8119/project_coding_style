<template>
  <BasicEditDialog
    v-model="dialogVisible"
    :title="t('title.create_construction')"
    :is-invalid="!name.trim()"
    @submit="onSubmit"
    @cancel="onCancel"
  >
    <ElFormItem :label="t('label.construction')">
      <ElInput v-model="name" :placeholder="t('placeholder.project.add_construction')" />
    </ElFormItem>
  </BasicEditDialog>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import { useI18n } from 'vue-i18n';

import BasicEditDialog from '@/components/core/dialog/BasicEditDialog.vue';
import { useDialogReset } from '@/composables/useDialogReset';

const props = defineProps<{
  modelValue: boolean;
}>();

const emit = defineEmits<{
  'update:modelValue': [value: boolean];
  submit: [{ name: string }];
}>();

const { t } = useI18n();

const dialogVisible = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value),
});

const name = ref('');

const onSubmit = () => {
  const trimmed = name.value.trim();
  if (!trimmed) return;

  emit('submit', { name: trimmed });
  onCancel();
};

const resetDialogState = () => {
  name.value = '';
};

const { createCancelHandler } = useDialogReset(() => props.modelValue, resetDialogState);
const onCancel = createCancelHandler(() => emit('update:modelValue', false));
</script>
