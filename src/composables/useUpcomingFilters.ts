import { computed, ref, type Ref } from 'vue';

import type { TaskFilterStatus } from '@/constants/selection';
import type { ProjectResponse, TaskResponse } from '@/types/response';
import type { ConstructionSelection } from '@/types/selection';

import { filterTasksByConditions } from '@/utils/todo/taskUtils';

export function useUpcomingFilters({
  fetchedAllTasks,
  fetchedProjects: _fetchedProjects,
  constructionList,
  selectedStatus,
  daysRange,
  searchQuery,
}: {
  fetchedAllTasks: Ref<TaskResponse[] | null>;
  fetchedProjects: Ref<ProjectResponse[] | undefined>;
  constructionList: Ref<ConstructionSelection[] | null>;
  selectedStatus: Ref<TaskFilterStatus>;
  daysRange: Ref<[number, number] | null>;
  searchQuery: Ref<string>;
}) {
  const selectedConstructionIds = ref<string[]>([]);
  const selectedProjectIds = ref<string[]>([]);

  const toggleFromList = (list: string[], id: string): string[] => {
    const exists = list.includes(id);
    return exists ? list.filter((x) => x !== id) : [...list, id];
  };

  const toggleConstruction = (id: string) => {
    selectedConstructionIds.value = toggleFromList(selectedConstructionIds.value, id);
  };

  const toggleProject = (id: string) => {
    selectedProjectIds.value = toggleFromList(selectedProjectIds.value, id);
  };

  const filteredTasks = computed(() => {
    let tasks = fetchedAllTasks.value ?? [];

    // Exclude selected projects
    if (selectedProjectIds.value.length > 0) {
      tasks = tasks.filter((t) => !selectedProjectIds.value.includes(t.projectId));
    }

    // Exclude selected constructions
    if (selectedConstructionIds.value.length > 0) {
      tasks = tasks.filter((t) => !selectedConstructionIds.value.includes(t.constructionType));
    }

    return filterTasksByConditions(tasks, {
      status: selectedStatus.value,
      daysRange: daysRange.value,
      searchQuery: searchQuery.value,
    });
  });

  const filteredConstructionList = computed(() => {
    const allConstructions = constructionList.value ?? [];

    // 若有選擇特定工程，排除這些工程
    if (selectedConstructionIds.value.length > 0) {
      return allConstructions.filter((c) => !selectedConstructionIds.value.includes(c.id));
    }

    // 若未選任何工程，顯示全部
    return allConstructions;
  });

  return {
    selectedConstructionIds,
    selectedProjectIds,
    toggleConstruction,
    toggleProject,
    filteredTasks,
    filteredConstructionList,
  };
}
