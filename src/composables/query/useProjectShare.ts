/**
 * 用於管理專案相關操作
 * 包含分享等功能
 *
 * @returns {Object}
 */

import { useMutation, useQuery, useQueryClient } from '@tanstack/vue-query';
import { type Ref } from 'vue';

import type { ProjectResponse } from '@/types/response';

import { projectApi } from '@/api/project';

interface UseProjectReturn {
  // 分享專案
  fetchedSharedProject: Ref<ProjectResponse | null>;
  isLoadingSharedProject: Ref<boolean>;
  sharedProjectError: Ref<Error | null>;
  refetchSharedProject: () => Promise<void>;

  // 切換分享狀態
  toggleProjectShare: (id: string) => Promise<ProjectResponse | null>;
  isTogglingShare: Ref<boolean>;
  toggleShareProjectError: Ref<Error | null>;
}

const QUERY_KEY = 'projectShare';

export function useProjectShare(id?: string): UseProjectReturn {
  const queryClient = useQueryClient();

  // ==================== 獲取分享專案 ====================
  const {
    data: fetchedSharedProject,
    isLoading: isLoadingSharedProject,
    refetch: refetchQuerySharedProject,
    error: sharedProjectError,
  } = useQuery({
    queryKey: [QUERY_KEY, 'shared', id],
    queryFn: async () => {
      if (!id) throw new Error('Project ID is required');
      const response = await projectApi.getProjectShare(id);
      return response.data;
    },
    staleTime: 1000 * 60 * 3,
  });

  const refetchSharedProject = async (): Promise<void> => {
    await refetchQuerySharedProject();
  };

  // ==================== 切換分享狀態 ====================
  const {
    mutateAsync: mutateToggleShare,
    isPending: isTogglingShare,
    error: toggleShareProjectError,
  } = useMutation({
    mutationFn: async (projectId: string) => {
      const response = await projectApi.toggleProjectShare(projectId);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY, 'shared', id] });
    },
  });

  const toggleProjectShare = async (projectId: string): Promise<ProjectResponse | null> => {
    try {
      const result = await mutateToggleShare(projectId);
      return result || null;
    } catch (err: unknown) {
      console.error('切換專案分享失敗:', err);
      return null;
    }
  };

  return {
    // 分享專案
    fetchedSharedProject: fetchedSharedProject as Ref<ProjectResponse | null>,
    isLoadingSharedProject,
    sharedProjectError,
    refetchSharedProject,
    // 切換分享狀態
    toggleProjectShare,
    isTogglingShare,
    toggleShareProjectError,
  };
}
