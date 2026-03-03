<template>
  <BasicEditDialog
    v-model="dialogVisible"
    :title="props.subject + t('title.delete_confirm')"
    :is-submitting="isSubmitting"
    :error-message="errorMessage"
    :is-invalid="isCrucial ? isInvalid : false"
    @submit="onSubmit"
    @cancel="handleCancelWithComposable"
  >
    <div class="space-y-2 text-left">
      <p class="leading-relaxed">
        {{ t('dialog.delete_confirm') }}
        <span class="text-base font-semibold text-secondary-red">
          {{ props.subject }}: {{ props.target }}
        </span>
        ?
        <span v-if="props.additionalInfo" class="block">
          {{ props.additionalInfo }}
        </span>
      </p>

      <div v-if="props.isCrucial" class="">
        <p class="leading-relaxed">
          {{ t('message.sign.confirm_delete_input') }}
          <span class="font-semibold text-secondary-red">{{ props.target }}</span>
        </p>

        <ElInput
          v-model="typeCheck"
          class="mt-4"
          :placeholder="t('placeholder.project.project_name')"
        />
      </div>
    </div>
  </BasicEditDialog>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import { useI18n } from 'vue-i18n';

import BasicEditDialog from '@/components/core/dialog/BasicEditDialog.vue';
import { useDialogReset } from '@/composables/useDialogReset';

const props = defineProps<{
  modelValue: boolean;
  isCrucial?: boolean;
  target: string;
  subject?: string;
  additionalInfo?: string;
}>();

const emit = defineEmits<{
  'update:modelValue': [value: boolean];
  confirm: [];
}>();

const { t } = useI18n();

const errorMessage = ref<string>('');
const isSubmitting = ref(false);
const typeCheck = ref<string>('');

const dialogVisible = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value),
});
const isInvalid = computed(() => typeCheck.value !== props.target);

const resetDialogState = () => {
  typeCheck.value = '';
  errorMessage.value = '';
};

const onSubmit = async () => {
  try {
    isSubmitting.value = true;
    // 觸發確認刪除事
    emit('confirm');
    // 關閉彈窗
    dialogVisible.value = false;
  } catch (error) {
    console.error('Failed to delete item:', error);
    errorMessage.value = '刪除失敗，請重試';
  } finally {
    resetDialogState();
    isSubmitting.value = false;
  }
};

const { createCancelHandler } = useDialogReset(() => props.modelValue, resetDialogState);
// align with BasicEditDialog cancel behavior
const handleCancelWithComposable = createCancelHandler(() => (dialogVisible.value = false));
</script>
