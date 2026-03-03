import { useQuery } from '@tanstack/vue-query';
import { computed, ref } from 'vue';

import type { ProjectResponse } from '@/types/response';

import { projectApi } from '@/api/project';
import { getCurrentUserId } from '@/utils/user';

export const useProjectCollaboratorManagement = () => {
  const currentUserId = getCurrentUserId();
  const selectedProjectId = ref<string | null>(null);

  // 獲取我創建的專案
  const {
    data: ownedProjects,
    isLoading: isLoadingOwnedProjects,
    refetch: refetchOwnedProjects,
  } = useQuery({
    queryKey: ['ownedProjects'],
    queryFn: async () => {
      const response = await projectApi.getOwnedProjects();
      return response.data;
    },
  });

  // 獲取我作為協作者參與的專案
  const {
    data: collaboratingProjects,
    isLoading: isLoadingCollaboratingProjects,
    refetch: refetchCollaboratingProjects,
  } = useQuery({
    queryKey: ['collaboratingProjects'],
    queryFn: async () => {
      const response = await projectApi.getCollaboratingProjects();
      return response.data;
    },
  });

  const isLoadingProjects = computed(
    () => isLoadingOwnedProjects.value || isLoadingCollaboratingProjects.value
  );

  const refetchProjects = async () => {
    await Promise.all([refetchOwnedProjects(), refetchCollaboratingProjects()]);
  };

  // 選中的專案
  const selectedProject = computed(() => {
    if (!selectedProjectId.value) return null;
    const owned = ownedProjects.value ?? [];
    const collaborating = collaboratingProjects.value ?? [];
    const allProjects = [...owned, ...collaborating];
    return allProjects.find((p) => p.id === selectedProjectId.value) || null;
  });

  // 選擇專案
  const selectProject = (projectId: string | null) => {
    selectedProjectId.value = projectId;
  };

  // 判斷是否為專案擁有者
  const isProjectOwner = (project: ProjectResponse) => {
    return currentUserId && project.userId === currentUserId;
  };

  return {
    // 專案列表
    ownedProjects,
    collaboratingProjects,
    isLoadingProjects,
    refetchProjects,

    // 選中的專案
    selectedProjectId,
    selectedProject,
    selectProject,
    isProjectOwner,
  };
};
