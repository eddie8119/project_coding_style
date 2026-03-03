<template>
  <TaskForm
    ref="taskFormRef"
    :construction-id="props.constructionId"
    :errors="errors"
    :error-message="errorMessage"
    :on-save="onAddTask"
    :disabled-save-button="isSubmitting"
    :on-cancel="onClose"
    :save-button-text="t('button.add')"
  />
</template>

<script setup lang="ts">
import { toTypedSchema } from '@vee-validate/zod';
import { useForm } from 'vee-validate';
import { ref } from 'vue';
import { useI18n } from 'vue-i18n';

import type { CreateTaskSchema } from '@/utils/schemas/createTaskSchema';

import { taskApi } from '@/api/task';
import TaskForm from '@/components/task/TaskForm.vue';
import { useTaskContext } from '@/context/useTaskContext';
import { createTaskSchema } from '@/utils/schemas/createTaskSchema';

const props = defineProps<{
  constructionId: string;
  projectId: string;
}>();
const emit = defineEmits<{
  (e: 'close'): void;
}>();
const { t } = useI18n();
const { addNewTask } = useTaskContext();

// 任務表單組件引用
const taskFormRef = ref<InstanceType<typeof TaskForm> | null>(null);
const errorMessage = ref<string>('');

const getInitialValues = (): CreateTaskSchema => ({
  title: '',
  description: '',
  materials: [],
  reminderDateTime: undefined,
  constructionType: props.constructionId,
  projectId: props.projectId,
  status: 'todo',
});

const { isSubmitting, handleSubmit, errors, resetForm, setValues } = useForm({
  validationSchema: toTypedSchema(createTaskSchema(t)),
  initialValues: getInitialValues(),
});

// 設置初始值以建立 form context
setValues(getInitialValues());

// 提交狀態 - 使用 handleSubmit 進行驗證
const onAddTask = handleSubmit(async (values: CreateTaskSchema) => {
  if (!taskFormRef.value) return;

  // 清除任何材料驗證錯誤
  taskFormRef.value.clearMaterialErrors();

  // 過濾掉沒有選擇材料的空行（以 planningMaterialId 為依據）
  const filteredMaterials = (values.materials || []).filter(
    (m) => m.planningMaterialId && m.planningMaterialId.trim() !== ''
  );

  const newTask: CreateTaskSchema = {
    ...values,
    materials: filteredMaterials,
  };

  try {
    const { success, message, data } = await taskApi.createTask(newTask, props.projectId);
    if (!success) {
      errorMessage.value = message ?? '';
      return;
    }
    if (success && data) {
      addNewTask(data);
      onClose();
    }
  } catch (error) {
    console.error('Failed to add task:', error);
  }
});

// 關閉表單
const onClose = () => {
  // 關閉時統一重置，避免再次打開時殘留 touched/errors
  resetForm({ values: getInitialValues() });
  taskFormRef.value?.clearMaterialErrors();
  emit('close');
};
</script>

<style scoped></style>
