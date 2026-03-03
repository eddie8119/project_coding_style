/**
 * 用於獲取專案任務資料。
 *
 * @returns {Object}
 */

import { useMutation, useQuery, useQueryClient } from '@tanstack/vue-query';
import { computed, type Ref } from 'vue';
import { useI18n } from 'vue-i18n';

import type { MaterialResponse, TaskResponse } from '@/types/response';
import type { CreateTaskSchema } from '@/utils/schemas/createTaskSchema';

import { taskApi } from '@/api/task';
import { useAuthStore } from '@/stores/useAuthStore';
import { isAccessTokenValid } from '@/utils/auth';

interface UseTasksReturn {
  // 批次獲取專案任務列表
  isLoadingTasks: Ref<boolean>;
  errorTasks: Ref<Error | null>;
  fetchedTasks: Ref<TaskResponse[] | undefined>;
  tasksUpdatedAt: Ref<number>;
  refetchTasks: () => Promise<void>;
  // 獲取所有任務
  isLoadingAllTasks: Ref<boolean>;
  errorAllTasks: Ref<Error | null>;
  fetchedAllTasks: Ref<TaskResponse[] | undefined>;
  allTasksUpdatedAt: Ref<number>;
  refetchAllTasks: () => Promise<void>;
  // 批次更新專案任務
  updateProjectTasks: (data: TaskResponse[]) => Promise<TaskResponse[] | null>;
  isUpdatingProjectTasks: Ref<boolean>;
  updateProjectTasksError: Ref<Error | null>;
  // 創建任務
  createTask: (payload: CreateTaskPayload) => Promise<TaskResponse | null>;
  isCreatingTask: Ref<boolean>;
  createTaskError: Ref<Error | null>;
  // 更新單個任務
  updateTask: (
    taskId: string,
    taskData: Partial<TaskResponse>
  ) => Promise<{ success: boolean; data?: TaskResponse; message?: string }>;
  isUpdatingTask: Ref<boolean>;
  updateTaskError: Ref<Error | null>;
  // 刪除任務
  deleteTask: (taskId: string) => Promise<boolean>;
  isDeletingTask: Ref<boolean>;
  deleteTaskError: Ref<Error | null>;
}

// The data for the mutation, including the dynamic projectId
interface CreateTaskPayload {
  taskData: CreateTaskSchema;
  projectId: string;
}

const QUERY_KEY = 'tasks';

export function useTasks(
  projectId?: string,
  options?: { invalidateAllTasks?: boolean }
): UseTasksReturn {
  const queryClient = useQueryClient();
  const { t } = useI18n();

  const authStore = useAuthStore();

  const isAuthAndTokenValid = computed(() => authStore.isAuthenticated && isAccessTokenValid());

  // 獲取所有任務
  const {
    data: fetchedAllTasks,
    isLoading: isLoadingAllTasks,
    refetch: refetchQueryAllTasks,
    error: errorAllTasks,
    dataUpdatedAt: allTasksUpdatedAt,
  } = useQuery({
    queryKey: [QUERY_KEY, 'all'],
    queryFn: async () => {
      const response = await taskApi.getAllTasks();
      return response.data;
    },
    enabled: isAuthAndTokenValid,
    staleTime: 1000 * 10 * 3, // 30秒
  });

  // 重新獲取所有任務
  const refetchAllTasks = async (): Promise<void> => {
    await refetchQueryAllTasks();
  };

  // 獲取專案任務列表
  const {
    data: fetchedTasks,
    isLoading: isLoadingTasks,
    refetch: refetchQueryTasks,
    error: errorTasks,
    dataUpdatedAt: tasksUpdatedAt,
  } = useQuery({
    queryKey: [QUERY_KEY, projectId],
    queryFn: async () => {
      if (!projectId) throw new Error('Project ID is required');
      const response = await taskApi.getTasksByProjectId(projectId);
      return response.data;
    },
    enabled: computed(() => isAuthAndTokenValid.value && !!projectId),
    staleTime: 1000 * 10 * 3, // 30秒
  });

  // 重新獲取任務列表
  const refetchTasks = async (): Promise<void> => {
    await refetchQueryTasks();
  };

  // 創建任務 mutation
  const {
    mutateAsync: mutateCreateTask,
    isPending: isCreatingTask,
    error: createTaskError,
  } = useMutation<TaskResponse, Error, CreateTaskPayload>({
    mutationFn: async (payload: CreateTaskPayload) => {
      const { taskData, projectId: dynamicProjectId } = payload;

      // Inject projectId into each material
      if (taskData.materials) {
        taskData.materials = taskData.materials.map((material) => ({
          ...material,
          projectId: dynamicProjectId,
        }));
      }

      const response = await taskApi.createTask(taskData, dynamicProjectId);
      if (!response.data) {
        throw new Error(response.message || '創建任務失敗');
      }
      return response.data;
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY, variables.projectId] });
    },
  });

  // 創建任務方法
  const createTask = async (payload: CreateTaskPayload): Promise<TaskResponse | null> => {
    try {
      const result = await mutateCreateTask(payload);
      return result || null;
    } catch (err: unknown) {
      console.error('創建任務失敗:', err);
      return null;
    }
  };

  // 批次更新專案任務 mutation
  const {
    mutateAsync: mutateUpdateProjectTasks,
    isPending: isUpdatingProjectTasks,
    error: updateProjectTasksError,
  } = useMutation({
    mutationFn: async (data: TaskResponse[]) => {
      if (!projectId) throw new Error('Project ID is not provided');
      const response = await taskApi.updateProjectTasks(data, projectId);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY, projectId] });
    },
  });

  // 批次更新專案任務方法
  const updateProjectTasks = async (data: TaskResponse[]): Promise<TaskResponse[] | null> => {
    try {
      const result = await mutateUpdateProjectTasks(data);
      return result || null;
    } catch (err: unknown) {
      console.error('更新專案任務失敗:', err);
      return null;
    }
  };

  // 更新單個任務 mutation
  const {
    mutateAsync: mutateUpdateTask,
    isPending: isUpdatingTask,
    error: updateTaskError,
  } = useMutation({
    mutationFn: async ({
      taskId,
      taskData,
    }: {
      taskId: string;
      taskData: Partial<TaskResponse>;
    }) => {
      const processedTaskData = JSON.parse(JSON.stringify(taskData));

      if (processedTaskData.materials) {
        processedTaskData.materials = processedTaskData.materials.map(
          (material: MaterialResponse) => ({
            ...material,
            projectId: processedTaskData.projectId,
            quantity: material.quantity === null ? undefined : material.quantity,
          })
        );
      }

      const response = await taskApi.updateTask(taskId, processedTaskData);
      return response;
    },
    onSuccess: () => {
      // 更新特定專案的任務查詢
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY, projectId] });
      // 根據選項決定是否更新所有任務的查詢
      if (options?.invalidateAllTasks) {
        queryClient.invalidateQueries({ queryKey: [QUERY_KEY, 'all'] });
      }
    },
  });

  // 更新單個任務方法
  const updateTask = async (
    taskId: string,
    taskData: Partial<TaskResponse>
  ): Promise<{ success: boolean; data?: TaskResponse; message?: string }> => {
    try {
      const result = await mutateUpdateTask({ taskId, taskData });
      return result;
    } catch (err: unknown) {
      console.error('更新任務失敗:', err);
      return { success: false, message: t('message.error.update') };
    }
  };

  // 刪除任務 mutation
  const {
    mutateAsync: mutateDeleteTask,
    isPending: isDeletingTask,
    error: deleteTaskError,
  } = useMutation({
    mutationFn: async (taskId: string) => {
      const response = await taskApi.deleteTask(taskId);
      return response;
    },
    onSuccess: () => {
      // 更新特定專案的任務查詢
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY, projectId] });
      // 根據選項決定是否更新所有任務的查詢
      if (options?.invalidateAllTasks) {
        queryClient.invalidateQueries({ queryKey: [QUERY_KEY, 'all'] });
      }
    },
  });

  // 刪除任務方法
  const deleteTask = async (taskId: string): Promise<boolean> => {
    try {
      const result = await mutateDeleteTask(taskId);
      return result.success;
    } catch (err: unknown) {
      console.error('刪除任務失敗:', err);
      return false;
    }
  };

  return {
    // 獲取專案任務列表
    isLoadingTasks,
    errorTasks,
    fetchedTasks: fetchedTasks as Ref<TaskResponse[] | undefined>,
    tasksUpdatedAt,
    refetchTasks,
    // 獲取所有任務
    isLoadingAllTasks,
    errorAllTasks,
    fetchedAllTasks: fetchedAllTasks as Ref<TaskResponse[] | undefined>,
    allTasksUpdatedAt,
    refetchAllTasks,
    // 批次更新專案任務
    updateProjectTasks,
    isUpdatingProjectTasks,
    updateProjectTasksError,
    // 創建任務
    createTask,
    isCreatingTask,
    createTaskError,
    // 更新單個任務
    updateTask,
    isUpdatingTask,
    updateTaskError,
    // 刪除任務
    deleteTask,
    isDeletingTask,
    deleteTaskError,
  };
}
