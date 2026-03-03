/**
 * 用於過濾任務。
 *
 * @param tasksData - 任務列表
 */
import { computed, ref, type Ref } from 'vue';

import type { TaskFilterStatus } from '@/constants/selection';
import type { TaskResponse } from '@/types/response';

import {
  filterTasksByConstruction as filterByConstructionUtil,
  filterTasksByConditions,
} from '@/utils/todo/taskUtils';

export function useTaskConditionFilters(tasksData: Ref<TaskResponse[]>, searchQuery: Ref<string>) {
  const selectedStatus = ref<TaskFilterStatus>('all');
  const daysRange = ref<[number, number] | null>(null);

  // 狀態 / 日期的通用過濾
  const filteredTasksByStatus = computed(() => {
    return filterTasksByConditions(tasksData.value, {
      status: selectedStatus.value,
      daysRange: daysRange.value,
      searchQuery: searchQuery.value,
    });
  });

  // 這適用於將任務歸類到對應的工程容器
  const filteredTasksByConstruction = (constructionId: string) => {
    return filterByConstructionUtil(filteredTasksByStatus.value, constructionId);
  };

  return {
    selectedStatus,
    daysRange,
    filteredTasksByStatus,
    filteredTasksByConstruction,
  } as const;
}
