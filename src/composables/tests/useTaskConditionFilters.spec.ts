import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ref, type Ref } from 'vue';

import type { TaskResponse } from '@/types/response';

import { useTaskConditionFilters } from '@/composables/useTaskConditionFilters';

// Mock task utils so we只測 composable 的邏輯與參數傳遞
const mockFilterTasksByConditions = vi.fn();
const mockFilterTasksByConstruction = vi.fn();

vi.mock('@/utils/todo/taskUtils', () => ({
  filterTasksByConditions: (...args: unknown[]) => mockFilterTasksByConditions(...args),
  filterTasksByConstruction: (...args: unknown[]) => mockFilterTasksByConstruction(...args),
}));

describe('useTaskConditionFilters', () => {
  const tasksData = ref<TaskResponse[]>([]);
  const searchQuery = ref<string>('');

  beforeEach(() => {
    tasksData.value = [
      {
        id: 't1',
        status: 'todo',
        endDateTime: '2024-01-01T00:00:00Z',
        constructionType: 'c1',
      } as unknown as TaskResponse,
      {
        id: 't2',
        status: 'done',
        endDateTime: '2024-01-05T00:00:00Z',
        constructionType: 'c2',
      } as unknown as TaskResponse,
    ];

    mockFilterTasksByConditions.mockReset();
    mockFilterTasksByConstruction.mockReset();
  });

  it('initially filters tasks with default status "all" and no daysRange', () => {
    mockFilterTasksByConditions.mockReturnValue(['filtered-initial']);

    const { filteredTasksByStatus } = useTaskConditionFilters(
      tasksData as unknown as Ref<TaskResponse[]>,
      searchQuery as unknown as Ref<string>
    );

    // 讀取 computed，觸發實際的過濾呼叫
    expect(filteredTasksByStatus.value).toEqual(['filtered-initial']);

    expect(mockFilterTasksByConditions).toHaveBeenCalledTimes(1);
    expect(mockFilterTasksByConditions).toHaveBeenCalledWith(tasksData.value, {
      status: 'all',
      daysRange: null,
      searchQuery: searchQuery.value,
    });
  });

  it('recomputes when selectedStatus or daysRange change', () => {
    mockFilterTasksByConditions
      .mockReturnValueOnce(['status-all'])
      .mockReturnValueOnce(['status-todo']);

    const { filteredTasksByStatus, selectedStatus, daysRange } = useTaskConditionFilters(
      tasksData,
      searchQuery as unknown as Ref<string>
    );

    // 讀一次 computed 觸發第一次呼叫
    expect(filteredTasksByStatus.value).toEqual(['status-all']);

    // 修改過濾條件
    selectedStatus.value = 'todo';
    daysRange.value = [0, 7];
    searchQuery.value = 'test query';
    // Trigger re-computation
    void filteredTasksByStatus.value;

    expect(filteredTasksByStatus.value).toEqual(['status-todo']);

    expect(mockFilterTasksByConditions).toHaveBeenLastCalledWith(tasksData.value, {
      status: 'todo',
      daysRange: [0, 7],
      searchQuery: 'test query',
    });
  });

  it('filters tasks by construction based on filteredTasksByStatus', () => {
    mockFilterTasksByConditions.mockReturnValue(['status-filtered']);
    mockFilterTasksByConstruction.mockReturnValue(['construction-filtered']);

    const { filteredTasksByStatus, filteredTasksByConstruction } = useTaskConditionFilters(
      tasksData,
      searchQuery as unknown as Ref<string>
    );

    const result = filteredTasksByConstruction('c1');

    expect(mockFilterTasksByConstruction).toHaveBeenCalledTimes(1);
    expect(mockFilterTasksByConstruction).toHaveBeenCalledWith(filteredTasksByStatus.value, 'c1');
    expect(result).toEqual(['construction-filtered']);
  });
});
