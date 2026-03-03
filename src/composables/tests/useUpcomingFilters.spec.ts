import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ref, type Ref } from 'vue';

import type { TaskFilterStatus } from '@/constants/selection';
import type { ProjectResponse, TaskResponse } from '@/types/response';
import type { ConstructionSelection } from '@/types/selection';

import { useUpcomingFilters } from '@/composables/useUpcomingFilters';

// Mock task utils so we only test composable behavior & parameters
const mockFilterTasksByConditions = vi.fn();

vi.mock('@/utils/todo/taskUtils', () => ({
  filterTasksByConditions: (...args: unknown[]) => mockFilterTasksByConditions(...args),
}));

describe('useUpcomingFilters', () => {
  const fetchedAllTasks = ref<TaskResponse[] | null>(null);
  const fetchedOverviewProjects = ref<ProjectResponse[] | undefined>(undefined);
  const constructionList = ref<ConstructionSelection[] | null>(null);
  const selectedStatus = ref<TaskFilterStatus>('all');
  const daysRange = ref<[number, number] | null>(null);
  const searchQuery = ref('');

  beforeEach(() => {
    fetchedAllTasks.value = [
      {
        id: 't1',
        projectId: 'p1',
        constructionType: 'c1',
        status: 'todo',
        endDateTime: '2024-01-01T00:00:00Z',
      } as unknown as TaskResponse,
      {
        id: 't2',
        projectId: 'p2',
        constructionType: 'c2',
        status: 'done',
        endDateTime: '2024-01-05T00:00:00Z',
      } as unknown as TaskResponse,
    ];

    constructionList.value = [
      { id: 'c1', name: 'Construction 1' } as ConstructionSelection,
      { id: 'c2', name: 'Construction 2' } as ConstructionSelection,
    ];

    fetchedOverviewProjects.value = undefined;
    selectedStatus.value = 'all';
    daysRange.value = null;
    searchQuery.value = '';

    mockFilterTasksByConditions.mockReset();
  });

  it('passes all tasks to filterTasksByConditions when no project/construction is selected', () => {
    mockFilterTasksByConditions.mockReturnValue(['filtered-all']);

    const { filteredTasks } = useUpcomingFilters({
      fetchedAllTasks: fetchedAllTasks as Ref<TaskResponse[] | null>,
      fetchedProjects: fetchedOverviewProjects as Ref<ProjectResponse[] | undefined>,
      constructionList: constructionList as Ref<ConstructionSelection[] | null>,
      selectedStatus: selectedStatus as Ref<TaskFilterStatus>,
      daysRange: daysRange as Ref<[number, number] | null>,
      searchQuery: searchQuery as Ref<string>,
    });

    // Trigger computed
    expect(filteredTasks.value).toEqual(['filtered-all']);

    expect(mockFilterTasksByConditions).toHaveBeenCalledTimes(1);
    expect(mockFilterTasksByConditions).toHaveBeenCalledWith(fetchedAllTasks.value, {
      status: selectedStatus.value,
      daysRange: daysRange.value,
      searchQuery: searchQuery.value,
    });
  });

  it('excludes selected projects and constructions before calling filterTasksByConditions', () => {
    mockFilterTasksByConditions
      .mockReturnValueOnce(['initial'])
      .mockReturnValueOnce(['after-exclude']);

    const { selectedProjectIds, selectedConstructionIds, filteredTasks } = useUpcomingFilters({
      fetchedAllTasks: fetchedAllTasks as Ref<TaskResponse[] | null>,
      fetchedProjects: fetchedOverviewProjects as Ref<ProjectResponse[] | undefined>,
      constructionList: constructionList as Ref<ConstructionSelection[] | null>,
      selectedStatus: selectedStatus as Ref<TaskFilterStatus>,
      daysRange: daysRange as Ref<[number, number] | null>,
      searchQuery: searchQuery as Ref<string>,
    });

    // First read to use full list
    expect(filteredTasks.value).toEqual(['initial']);

    // Exclude project p1 and construction c2
    selectedProjectIds.value = ['p1'];
    selectedConstructionIds.value = ['c2'];

    // Second read with exclusions applied
    expect(filteredTasks.value).toEqual(['after-exclude']);

    const lastCall = mockFilterTasksByConditions.mock.calls.at(-1);
    const passedTasks = (lastCall?.[0] ?? []) as TaskResponse[];

    // Expect t1 (p1) and t2 (c2) both excluded -> empty array
    expect(passedTasks).toEqual([]);
    expect(lastCall?.[1]).toEqual({
      status: selectedStatus.value,
      daysRange: daysRange.value,
      searchQuery: searchQuery.value,
    });
  });

  it('filters construction list by excluding selected construction ids', () => {
    const { selectedConstructionIds, filteredConstructionList } = useUpcomingFilters({
      fetchedAllTasks: fetchedAllTasks as Ref<TaskResponse[] | null>,
      fetchedProjects: fetchedOverviewProjects as Ref<ProjectResponse[] | undefined>,
      constructionList: constructionList as Ref<ConstructionSelection[] | null>,
      selectedStatus: selectedStatus as Ref<TaskFilterStatus>,
      daysRange: daysRange as Ref<[number, number] | null>,
      searchQuery: searchQuery as Ref<string>,
    });

    // No selection -> all constructions
    expect(filteredConstructionList.value?.map((c) => c.id)).toEqual(['c1', 'c2']);

    // Exclude c1
    selectedConstructionIds.value = ['c1'];

    expect(filteredConstructionList.value?.map((c) => c.id)).toEqual(['c2']);
  });
});
