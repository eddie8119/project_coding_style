import { ref } from 'vue';

import type { CreatePlanningTaskPayload } from '@/api/planningTask';
import type { PlanningTaskResponse } from '@/types/response';
import type { ComputedRef, Ref } from 'vue';

interface UsePlanningTaskDialogOptions {
  selectedProjectId: Ref<string | null>;
  currentPlanningTasks: ComputedRef<PlanningTaskResponse[]>;
  updatePlanningTask: (taskId: string, payload: Partial<PlanningTaskResponse>) => Promise<unknown>;
  createPlanningTask: (
    payload: CreatePlanningTaskPayload,
    projectId?: string
  ) => Promise<PlanningTaskResponse | null>;
  deletePlanningTask: (taskId: string) => Promise<boolean>;
}

export function usePlanningTaskDialog(options: UsePlanningTaskDialogOptions) {
  const {
    selectedProjectId,
    currentPlanningTasks,
    updatePlanningTask,
    createPlanningTask,
    deletePlanningTask,
  } = options;

  const isEditDialogVisible = ref(false);
  const editingTaskId = ref<string | null>(null);
  const editDialogMode = ref<'create' | 'edit'>('edit');
  const editContent = ref('');
  const editDateRange = ref<[Date, Date] | null>(null);
  const creatingCategoryId = ref<string | null>(null);

  const isDeleteDialogVisible = ref(false);
  const deletingTaskId = ref<string | null>(null);
  const deletingTaskName = ref('');

  const handleScheduleUpdate = async (payload: {
    taskId: string;
    startDate: Date;
    endDate: Date;
  }) => {
    if (!selectedProjectId.value) return;

    const savedEndDate = new Date(payload.endDate);
    savedEndDate.setDate(savedEndDate.getDate() + 1);

    await updatePlanningTask(payload.taskId, {
      startDate: payload.startDate.toISOString(),
      endDate: savedEndDate.toISOString(),
    });
  };

  const openEditDialog = (payload: {
    taskId: string;
    content: string;
    startDate: Date;
    endDate: Date;
  }) => {
    editingTaskId.value = payload.taskId;
    editDialogMode.value = 'edit';
    editContent.value = payload.content ?? '';
    editDateRange.value = [payload.startDate, payload.endDate];
    isEditDialogVisible.value = true;
  };

  const openCreateDialog = (payload: { categoryId: string; categoryName?: string }) => {
    if (!selectedProjectId.value) return;

    editingTaskId.value = null;
    editDialogMode.value = 'create';
    creatingCategoryId.value = payload.categoryId;
    editContent.value = '';
    editDateRange.value = null;
    isEditDialogVisible.value = true;
  };

  const submitEditDialog = async () => {
    if (!selectedProjectId.value || !editDateRange.value) return;

    const [start, end] = editDateRange.value;
    const trimmedContent = editContent.value.trim();
    const savedEndDate = new Date(end);
    savedEndDate.setDate(savedEndDate.getDate() + 1);

    if (editingTaskId.value) {
      await updatePlanningTask(editingTaskId.value, {
        content: trimmedContent,
        startDate: start.toISOString(),
        endDate: savedEndDate.toISOString(),
      });
    } else {
      await createPlanningTask(
        {
          constructionType: creatingCategoryId.value,
          content: trimmedContent,
          startDate: start.toISOString(),
          endDate: savedEndDate.toISOString(),
        },
        selectedProjectId.value
      );
    }

    isEditDialogVisible.value = false;
  };

  const promptDeleteTask = (payload: { taskId: string }) => {
    deletingTaskId.value = payload.taskId;
    const task = currentPlanningTasks.value.find((item) => item.id === payload.taskId);
    deletingTaskName.value = task?.content ?? '';
    isDeleteDialogVisible.value = true;
  };

  const confirmDeleteTask = async () => {
    if (!selectedProjectId.value || !deletingTaskId.value) return;

    await deletePlanningTask(deletingTaskId.value);
    isDeleteDialogVisible.value = false;
    deletingTaskId.value = null;
    deletingTaskName.value = '';
  };

  return {
    isEditDialogVisible,
    editDialogMode,
    editContent,
    editDateRange,
    isDeleteDialogVisible,
    deletingTaskName,
    handleScheduleUpdate,
    openEditDialog,
    openCreateDialog,
    submitEditDialog,
    promptDeleteTask,
    confirmDeleteTask,
  } as const;
}
