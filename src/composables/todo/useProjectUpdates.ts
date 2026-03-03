import { useDebounceFn } from '@vueuse/core';

import type { ProjectResponse } from '@/types/response';
import type { ConstructionSelection, ProjectType } from '@/types/selection';
import type { CreateProjectSchema } from '@/utils/schemas/createProjectSchema';
import type { Ref } from 'vue';

/**
 * 處理專案更新操作（標題、類型、工程容器）
 * 直接呼叫 API，無 localStorage
 */
export function useProjectUpdates(
  project: Ref<ProjectResponse | null>,
  updateProjectApi: (data: Partial<CreateProjectSchema>) => Promise<ProjectResponse | null>,
  updateLastUpdateTime: () => void
) {
  // 更新專案標題的方法（加入 debounce 避免頻繁 API 呼叫）
  const updateProjectTitleDebounced = useDebounceFn(async (newTitle: string) => {
    if (!project.value?.id) return;

    await updateProjectApi({ title: newTitle });
    updateLastUpdateTime();
  }, 800); // 停止輸入 800ms 後才送 API

  const updateProjectTitle = (newTitle: string) => {
    // 立即更新本地顯示（樂觀更新）
    if (project.value) {
      project.value = {
        ...project.value,
        title: newTitle,
      };
    }
    // 延遲送 API
    updateProjectTitleDebounced(newTitle);
  };

  // 更新專案類型的方法（立即送 API）
  const updateProjectType = async (newType: ProjectType) => {
    if (!project.value?.id) return;

    // 樂觀更新
    const previousValue = project.value;
    project.value = {
      ...project.value,
      type: newType,
    };

    try {
      await updateProjectApi({ type: newType });
      updateLastUpdateTime();
    } catch (error) {
      // 失敗則回滾
      project.value = previousValue;
      console.error('更新專案類型失敗:', error);
    }
  };

  // 更新工程容器的方法（立即送 API）
  const updateConstructionContainer = async (containers: ConstructionSelection[]) => {
    if (!project.value?.id) return;

    // 樂觀更新
    const previousValue = project.value;
    project.value = {
      ...project.value,
      constructionContainer: containers,
    };

    try {
      await updateProjectApi({ constructionContainer: containers });
      updateLastUpdateTime();
    } catch (error) {
      // 失敗則回滾
      project.value = previousValue;
      console.error('更新工程容器失敗:', error);
    }
  };

  return {
    updateProjectTitle,
    updateProjectType,
    updateConstructionContainer,
  };
}
