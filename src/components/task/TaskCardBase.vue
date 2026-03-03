<template>
  <div
    v-if="!isEditing"
    class="task-card background-color-difference group relative cursor-pointer rounded-md p-1 shadow-sm duration-200"
    :class="[timeAlertClasses, taskStatusClasses]"
    @dblclick="handleDblClick"
  >
    <!-- 提醒訊息 -->
    <div v-if="timeAlertStatus !== 'none'" class="absolute bottom-[6px] right-[6px]">
      <StatusLabel :show-index="timeAlertStatus" :class-label="timeAlertAreaClasses" />
    </div>
    <TaskCardHeader
      :task="task"
      :read-only="readOnly"
      :show-router="showRouter"
      @edit="startEditing"
      @delete="$emit('delete', $event)"
      @update:status="handleTaskStatusChange"
    />
    <TaskCardDetails :task="task" />
  </div>

  <TaskForm
    v-else
    :initial-data="formInitialData"
    :show-more="true"
    :construction-id="task.constructionType"
    :errors="errors"
    :disabled-save-button="isSubmitting"
    :on-save="onUpdateTask"
    :on-cancel="cancelEditing"
  />
</template>

<script setup lang="ts">
import { toTypedSchema } from '@vee-validate/zod';
import { useForm } from 'vee-validate';
import { computed, nextTick, toRef } from 'vue';
import { useI18n } from 'vue-i18n';

import type { TaskResponse } from '@/types/response';
import type { TaskStatus } from '@/types/task';

import TaskCardDetails from '@/components/task/TaskCardDetails.vue';
import TaskCardHeader from '@/components/task/TaskCardHeader.vue';
import TaskForm from '@/components/task/TaskForm.vue';
import StatusLabel from '@/components/ui/StatusLabel.vue';
import { useTaskCardStyle } from '@/composables/ui/useTaskCardStyle';
import { useEditingStateStore } from '@/stores/useEditingStateStore';
import { createTaskSchema } from '@/utils/schemas/createTaskSchema';

const props = withDefaults(
  defineProps<{
    task: TaskResponse;
    readOnly?: boolean;
    showRouter?: boolean;
  }>(),
  {
    showRouter: false,
  }
);

const emit = defineEmits<{
  (e: 'update:task', taskId: string, patch: Partial<TaskResponse>): void;
  (e: 'delete', taskId: string): void;
}>();

const taskRef = toRef(props, 'task');
const { timeAlertStatus, timeAlertClasses, timeAlertAreaClasses, taskStatusClasses } =
  useTaskCardStyle(taskRef);

const formInitialData = computed(() => ({
  ...props.task,
  materials: props.task.materials.map((m) => ({
    planningMaterialId: m.planningMaterialId,
    materialDefinitionId: m.materialDefinitionId,
    quantity: m.quantity ?? undefined,
    unitPrice: m.unitPrice ?? undefined,
    unit: m.materialDefinition?.unit ?? undefined,
    name: m.materialDefinition?.name ?? '',
    note: m.note ?? undefined,
  })),
}));

const editingStateStore = useEditingStateStore();
const { t } = useI18n();

const isEditing = computed(() => {
  return editingStateStore.isEditing('task', props.task.id);
});

const getInitialValues = () => {
  const initialData = formInitialData.value;
  return {
    title: initialData.title,
    description: initialData.description,
    materials: initialData.materials || [],
    reminderDateTime: initialData.reminderDateTime || undefined,
    endDateTime: initialData.endDateTime || undefined,
    constructionType: initialData.constructionType,
    projectId: initialData.projectId,
    status: initialData.status,
  };
};

const { setValues, handleSubmit, errors, isSubmitting } = useForm({
  validationSchema: toTypedSchema(createTaskSchema(t)),
  initialValues: getInitialValues(),
});

// 設置初始值以建立 form context
nextTick(() => {
  setValues(getInitialValues());
});

const startEditing = () => {
  editingStateStore.startEditing('task', props.task.id);
  setValues(getInitialValues());
};

const handleDblClick = () => {
  if (!props.readOnly) startEditing();
};

const cancelEditing = () => {
  editingStateStore.stopEditing();
};

const onUpdateTask = handleSubmit(
  async (validatedValues) => {
    const updatedMaterials = (validatedValues.materials || [])
      .map((formMaterial, index) => {
        const originalMaterial = props.task.materials[index] || {};
        return {
          ...originalMaterial,
          ...formMaterial,
        };
      })
      .filter((m) => m.planningMaterialId);

    const updateData = {
      ...validatedValues,
      materials: updatedMaterials,
    };

    emit('update:task', props.task.id, updateData as Partial<TaskResponse>);
    editingStateStore.stopEditing();
  },
  (errors) => {
    // 驗證失敗時的處理
    console.warn('TaskCardBase form validation failed:', errors);
  }
);

const handleTaskStatusChange = (status: TaskStatus) => {
  if (props.readOnly) return;
  emit('update:task', props.task.id, { ...props.task, status });
};
</script>

<style scoped>
.task-card {
  transition: all 0.2s ease;
}

.task-card:hover {
  box-shadow:
    0 4px 6px -1px rgb(0 0 0 / 10%),
    0 2px 4px -1px rgb(0 0 0 / 6%);
}
</style>
