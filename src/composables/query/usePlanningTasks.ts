/**
 * 用於獲取專案規劃任務資料。
 *
 */

import { useMutation, useQuery, useQueryClient } from '@tanstack/vue-query';
import { type Ref } from 'vue';
import { useI18n } from 'vue-i18n';

import type { PlanningTaskResponse } from '@/types/response';

import { type CreatePlanningTaskPayload, planningTaskApi } from '@/api/planningTask';

interface UsePlanningTasksReturn {
  // 批次獲取專案規劃任務列表
  isLoadingPlanningTasks: Ref<boolean>;
  errorPlanningTasks: Ref<Error | null>;
  fetchedPlanningTasks: Ref<PlanningTaskResponse[] | undefined>;
  planningTasksUpdatedAt: Ref<number>;
  refetchPlanningTasks: () => Promise<void>;
  // 獲取所有規劃任務
  isLoadingAllPlanningTasks: Ref<boolean>;
  errorAllPlanningTasks: Ref<Error | null>;
  fetchedAllPlanningTasks: Ref<PlanningTaskResponse[] | undefined>;
  allPlanningTasksUpdatedAt: Ref<number>;
  refetchAllPlanningTasks: () => Promise<void>;
  // 批次更新專案規劃任務
  updateProjectPlanningTasks: (
    data: PlanningTaskResponse[]
  ) => Promise<PlanningTaskResponse[] | null>;
  isUpdatingProjectPlanningTasks: Ref<boolean>;
  updateProjectPlanningTasksError: Ref<Error | null>;
  // 批次建立規劃任務
  createPlanningTasks: (
    tasks: CreatePlanningTaskPayload[],
    projectId?: string
  ) => Promise<PlanningTaskResponse[] | null>;
  isCreatingPlanningTasks: Ref<boolean>;
  createPlanningTasksError: Ref<Error | null>;
  // 批次替換專案規劃任務
  replacePlanningTasksByProjectId: (
    tasks: CreatePlanningTaskPayload[],
    projectId: string
  ) => Promise<PlanningTaskResponse[] | null>;
  isReplacingPlanningTasks: Ref<boolean>;
  replacePlanningTasksError: Ref<Error | null>;
  // 刪除專案下的所有規劃任務
  deletePlanningTaskByProjectId: (projectId?: string) => Promise<boolean>;
  isDeletingPlanningTaskByProjectId: Ref<boolean>;
  deletePlanningTaskByProjectIdError: Ref<Error | null>;
  // 創建規劃任務（可選擇傳入動態 projectId）
  createPlanningTask: (
    payload: CreatePlanningTaskPayload,
    projectId?: string
  ) => Promise<PlanningTaskResponse | null>;
  isCreatingPlanningTask: Ref<boolean>;
  createPlanningTaskError: Ref<Error | null>;
  // 更新單個規劃任務
  updatePlanningTask: (
    taskId: string,
    taskData: Partial<PlanningTaskResponse>
  ) => Promise<{ success: boolean; data?: PlanningTaskResponse; message?: string }>;
  isUpdatingPlanningTask: Ref<boolean>;
  updatePlanningTaskError: Ref<Error | null>;
  // 刪除規劃任務
  deletePlanningTask: (taskId: string) => Promise<boolean>;
  isDeletingPlanningTask: Ref<boolean>;
  deletePlanningTaskError: Ref<Error | null>;
}

// The data for the mutation, including the dynamic projectId
interface CreatePlanningTaskPayloadWithProject {
  taskData: CreatePlanningTaskPayload;
  projectId: string;
}

const QUERY_KEY = 'planningTasks';

export function usePlanningTasks(
  projectId?: string,
  options?: { invalidateAllPlanningTasks?: boolean }
): UsePlanningTasksReturn {
  const queryClient = useQueryClient();
  const { t } = useI18n();

  // 獲取所有規劃任務
  const {
    data: fetchedAllPlanningTasks,
    isLoading: isLoadingAllPlanningTasks,
    refetch: refetchQueryAllPlanningTasks,
    error: errorAllPlanningTasks,
    dataUpdatedAt: allPlanningTasksUpdatedAt,
  } = useQuery({
    queryKey: [QUERY_KEY, 'all'],
    queryFn: async () => {
      const response = await planningTaskApi.getAllPlanningTasks();
      return response.data;
    },
    staleTime: 1000 * 10 * 3, // 30秒
  });

  // 重新獲取所有規劃任務
  const refetchAllPlanningTasks = async (): Promise<void> => {
    await refetchQueryAllPlanningTasks();
  };

  // 獲取專案規劃任務列表
  const {
    data: fetchedPlanningTasks,
    isLoading: isLoadingPlanningTasks,
    refetch: refetchQueryPlanningTasks,
    error: errorPlanningTasks,
    dataUpdatedAt: planningTasksUpdatedAt,
  } = useQuery({
    queryKey: [QUERY_KEY, projectId],
    queryFn: async () => {
      if (!projectId) throw new Error('Project ID is required');
      const response = await planningTaskApi.getPlanningTasksByProjectId(projectId);
      return response.data;
    },
    enabled: !!projectId,
    staleTime: 1000 * 10 * 3, // 30秒
  });

  // 重新獲取規劃任務列表
  const refetchPlanningTasks = (): Promise<void> => refetchQueryPlanningTasks().then(() => {});

  // 創建規劃任務 mutation
  const {
    mutateAsync: mutateCreatePlanningTask,
    isPending: isCreatingPlanningTask,
    error: createPlanningTaskError,
  } = useMutation<PlanningTaskResponse, Error, CreatePlanningTaskPayloadWithProject>({
    mutationFn: async (payload: CreatePlanningTaskPayloadWithProject) => {
      const { taskData, projectId: dynamicProjectId } = payload;
      const response = await planningTaskApi.createPlanningTask(taskData, dynamicProjectId);

      if (!response.data) {
        throw new Error('Failed to create planning task');
      }

      return response.data; // 這裡型別就變成 PlanningTaskResponse，不會有 undefined
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY, variables.projectId] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY, 'all'] });
    },
  });

  // 創建規劃任務方法（可傳入動態 projectId）
  const createPlanningTask = async (
    payload: CreatePlanningTaskPayload,
    targetProjectId?: string
  ): Promise<PlanningTaskResponse | null> => {
    try {
      const finalProjectId = targetProjectId ?? projectId;
      if (!finalProjectId) throw new Error('Project ID is required');
      const result = await mutateCreatePlanningTask({
        taskData: payload,
        projectId: finalProjectId,
      });
      return result || null;
    } catch (err: unknown) {
      console.error('創建規劃任務失敗:', err);
      return null;
    }
  };

  // 批次建立規劃任務 mutation（支援動態 projectId）
  const {
    mutateAsync: mutateCreatePlanningTasks,
    isPending: isCreatingPlanningTasks,
    error: createPlanningTasksError,
  } = useMutation({
    mutationFn: async (params: { tasks: CreatePlanningTaskPayload[]; projectId?: string }) => {
      const targetProjectId = params.projectId ?? projectId;
      if (!targetProjectId) throw new Error('Project ID is not provided');
      const response = await planningTaskApi.createPlanningTasks(params.tasks, targetProjectId);
      return response.data;
    },
    onSuccess: (_data, variables) => {
      const targetProjectId = variables.projectId ?? projectId;
      if (targetProjectId) {
        queryClient.invalidateQueries({ queryKey: [QUERY_KEY, targetProjectId] });
      }
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY, 'all'] });
    },
  });

  // 批次建立規劃任務方法（可傳入動態 projectId）
  const createPlanningTasks = async (
    tasks: CreatePlanningTaskPayload[],
    targetProjectId?: string
  ): Promise<PlanningTaskResponse[] | null> => {
    try {
      const result = await mutateCreatePlanningTasks({ tasks, projectId: targetProjectId });
      return result || null;
    } catch (err: unknown) {
      console.error('批次建立規劃任務失敗:', err);
      return null;
    }
  };

  // 批次更新專案規劃任務 mutation
  const {
    mutateAsync: mutateUpdateProjectPlanningTasks,
    isPending: isUpdatingProjectPlanningTasks,
    error: updateProjectPlanningTasksError,
  } = useMutation({
    mutationFn: async (data: PlanningTaskResponse[]) => {
      if (!projectId) throw new Error('Project ID is not provided');
      const response = await planningTaskApi.updateProjectPlanningTasks(data, projectId);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY, projectId] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY, 'all'] });
    },
  });

  // 批次更新專案規劃任務方法
  const updateProjectPlanningTasks = async (
    data: PlanningTaskResponse[]
  ): Promise<PlanningTaskResponse[] | null> => {
    try {
      const result = await mutateUpdateProjectPlanningTasks(data);
      return result || null;
    } catch (err: unknown) {
      console.error('更新專案規劃任務失敗:', err);
      return null;
    }
  };

  // 批次替換專案規劃任務 mutation（支援動態 projectId）
  const {
    mutateAsync: mutateReplacePlanningTasks,
    isPending: isReplacingPlanningTasks,
    error: replacePlanningTasksError,
  } = useMutation({
    mutationFn: async (params: { tasks: CreatePlanningTaskPayload[]; projectId: string }) => {
      const response = await planningTaskApi.replacePlanningTasksByProjectId(
        params.tasks,
        params.projectId
      );
      return response.data;
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY, variables.projectId] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY, 'all'] });
    },
  });

  // 批次替換專案規劃任務方法（可傳入動態 projectId）
  const replacePlanningTasksByProjectId = async (
    tasks: CreatePlanningTaskPayload[],
    targetProjectId: string
  ): Promise<PlanningTaskResponse[] | null> => {
    try {
      const result = await mutateReplacePlanningTasks({ tasks, projectId: targetProjectId });
      return result || null;
    } catch (err: unknown) {
      console.error('替換專案規劃任務失敗:', err);
      return null;
    }
  };

  // 刪除專案下的所有規劃任務 mutation（支援動態 projectId）
  const {
    mutateAsync: mutateDeletePlanningTaskByProjectId,
    isPending: isDeletingPlanningTaskByProjectId,
    error: deletePlanningTaskByProjectIdError,
  } = useMutation({
    mutationFn: async (targetProjectId?: string) => {
      const finalProjectId = targetProjectId ?? projectId;
      if (!finalProjectId) throw new Error('Project ID is not provided');
      await planningTaskApi.deletePlanningTaskByProjectId(finalProjectId);
      return true;
    },
    onSuccess: (_data, variables) => {
      const finalProjectId = variables ?? projectId;
      if (finalProjectId) {
        queryClient.invalidateQueries({ queryKey: [QUERY_KEY, finalProjectId] });
      }
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY, 'all'] });
    },
  });

  // 刪除專案下的所有規劃任務方法（可傳入動態 projectId）
  const deletePlanningTaskByProjectId = async (targetProjectId?: string): Promise<boolean> => {
    try {
      const result = await mutateDeletePlanningTaskByProjectId(targetProjectId);
      return result;
    } catch (err: unknown) {
      console.error('刪除專案規劃任務失敗:', err);
      return false;
    }
  };

  // 更新單個規劃任務 mutation
  const {
    mutateAsync: mutateUpdatePlanningTask,
    isPending: isUpdatingPlanningTask,
    error: updatePlanningTaskError,
  } = useMutation({
    mutationFn: async ({
      taskId,
      taskData,
    }: {
      taskId: string;
      taskData: Partial<PlanningTaskResponse>;
    }) => {
      const response = await planningTaskApi.updatePlanningTask(taskId, taskData);
      return response;
    },
    onSuccess: () => {
      // 更新特定專案的規劃任務查詢
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY, projectId] });
      // 根據選項決定是否更新所有規劃任務的查詢
      if (options?.invalidateAllPlanningTasks) {
        queryClient.invalidateQueries({ queryKey: [QUERY_KEY, 'all'] });
      }
      // 確保所有規劃任務列表也刷新（供 fetchedAllPlanningTasks 使用）
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY, 'all'] });
    },
  });

  // 更新單個規劃任務方法
  const updatePlanningTask = async (
    taskId: string,
    taskData: Partial<PlanningTaskResponse>
  ): Promise<{ success: boolean; data?: PlanningTaskResponse; message?: string }> => {
    try {
      const result = await mutateUpdatePlanningTask({ taskId, taskData });
      return result;
    } catch (err: unknown) {
      console.error('更新規劃任務失敗:', err);
      return { success: false, message: t('message.error.update') };
    }
  };

  // 刪除規劃任務 mutation
  const {
    mutateAsync: mutateDeletePlanningTask,
    isPending: isDeletingPlanningTask,
    error: deletePlanningTaskError,
  } = useMutation({
    mutationFn: async (taskId: string) => {
      const response = await planningTaskApi.deletePlanningTask(taskId);
      return response;
    },
    onSuccess: () => {
      // 更新特定專案的規劃任務查詢
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY, projectId] });
      // 根據選項決定是否更新所有規劃任務的查詢
      if (options?.invalidateAllPlanningTasks) {
        queryClient.invalidateQueries({ queryKey: [QUERY_KEY, 'all'] });
      }
      // 確保所有規劃任務列表也刷新（供 fetchedAllPlanningTasks 使用）
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY, 'all'] });
    },
  });

  // 刪除規劃任務方法
  const deletePlanningTask = async (taskId: string): Promise<boolean> => {
    try {
      const result = await mutateDeletePlanningTask(taskId);
      return result.success;
    } catch (err: unknown) {
      console.error('刪除規劃任務失敗:', err);
      return false;
    }
  };

  return {
    // 獲取專案規劃任務列表
    isLoadingPlanningTasks,
    errorPlanningTasks,
    fetchedPlanningTasks: fetchedPlanningTasks as Ref<PlanningTaskResponse[] | undefined>,
    planningTasksUpdatedAt,
    refetchPlanningTasks,
    // 獲取所有規劃任務
    isLoadingAllPlanningTasks,
    errorAllPlanningTasks,
    fetchedAllPlanningTasks: fetchedAllPlanningTasks as Ref<PlanningTaskResponse[] | undefined>,
    allPlanningTasksUpdatedAt,
    refetchAllPlanningTasks,
    // 批次更新專案規劃任務
    updateProjectPlanningTasks,
    isUpdatingProjectPlanningTasks,
    updateProjectPlanningTasksError,
    // 批次建立規劃任務
    createPlanningTasks,
    isCreatingPlanningTasks,
    createPlanningTasksError,
    // 批次替換專案規劃任務
    replacePlanningTasksByProjectId,
    isReplacingPlanningTasks,
    replacePlanningTasksError,
    // 刪除專案下的所有規劃任務
    deletePlanningTaskByProjectId,
    isDeletingPlanningTaskByProjectId,
    deletePlanningTaskByProjectIdError,
    // 創建規劃任務
    createPlanningTask,
    isCreatingPlanningTask,
    createPlanningTaskError,
    // 更新單個規劃任務
    updatePlanningTask,
    isUpdatingPlanningTask,
    updatePlanningTaskError,
    // 刪除規劃任務
    deletePlanningTask,
    isDeletingPlanningTask,
    deletePlanningTaskError,
  };
}
