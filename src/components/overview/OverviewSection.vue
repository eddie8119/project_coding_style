<template>
  <Loading v-if="isLoadingAllTasks || isLoadingProjects" />

  <div v-else-if="!hasFetchedTasks" class="p-4">
    <ContentEmptyState
      class="hint-container"
      :title="t('setting.info.empty_overview_data')"
      :description="t('setting.info.empty_task_description')"
      :button-label="t('setting.info.go_to_create_task')"
      button-to="/todo/projects"
    />
  </div>

  <section v-else class="flex flex-col p-4">
    <!-- Top sticky area: filters + tab on mobile -->
    <div class="grid-col-1 background-color-difference sticky top-0 z-10 grid gap-2 pt-2 md:-top-7">
      <OverviewTaskFilterArea
        :construction-list="constructionList"
        :project-title-list="projectTitleList"
        :selected-construction-ids="selectedConstructionIds"
        :selected-project-ids="selectedProjectIds"
        @toggle-construction="toggleConstruction"
        @toggle-project="toggleProject"
        @select-all-filters="handleSelectAllFilters"
        @clear-filters="handleClearFilters"
        @update:selected-status="selectedStatus = $event"
        @update:days-range="daysRange = $event"
        @update:search-query="searchQuery = $event"
      />
      <OverviewTab v-model:task-time-condition="taskTimeCondition" class="my-2" />
    </div>

    <OverviewContent
      :filtered-construction-list="filteredConstructionList"
      :filtered-tasks="filteredTasks"
      :project-title-list="projectTitleList"
    />
  </section>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import { useI18n } from 'vue-i18n';

import type { TaskFilterStatus } from '@/constants/selection';
import type { TaskResponse } from '@/types/response';

import ContentEmptyState from '@/components/core/ContentEmptyState.vue';
import Loading from '@/components/core/loading/Loading.vue';
import OverviewContent from '@/components/overview/OverviewContent.vue';
import OverviewTab from '@/components/overview/OverviewTab.vue';
import OverviewTaskFilterArea from '@/components/overview/OverviewTaskFilterArea.vue';
import { useTasks } from '@/composables/query/useTasks';
import { useOverviewSources } from '@/composables/useOverviewSources';
import { useUpcomingFilters } from '@/composables/useUpcomingFilters';
import { provideTaskCardFilter } from '@/context/useTaskCardFilterContext';
import { TaskTimeCondition } from '@/types/task';

const { t } = useI18n();

const taskTimeCondition = ref<TaskTimeCondition>(TaskTimeCondition.ALL);
const selectedStatus = ref<TaskFilterStatus>('all');
const daysRange = ref<[number, number] | null>(null);
const searchQuery = ref('');

const { fetchedAllTasks, isLoadingAllTasks } = useTasks();
const { fetchedProjects, isLoadingProjects, constructionList, projectTitleList } =
  useOverviewSources();

const filterTasksByTime = (
  tasks: TaskResponse[],
  startTime: Date,
  endTime: Date,
  excludeDone = true
) => {
  return tasks.filter((task) => {
    if (excludeDone && task.status === 'done') return false;
    const endDateTime = task.endDateTime ? new Date(task.endDateTime) : null;
    const reminderDateTime = task.reminderDateTime ? new Date(task.reminderDateTime) : null;
    const isEndInRange = !!endDateTime && endDateTime >= startTime && endDateTime <= endTime;
    const isReminderInRange =
      !!reminderDateTime && reminderDateTime >= startTime && reminderDateTime <= endTime;
    return isEndInRange || isReminderInRange;
  });
};

const fetchedTasksTimeCondition = computed(() => {
  if (!fetchedAllTasks.value) return [];

  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  switch (taskTimeCondition.value) {
    case TaskTimeCondition.ALL:
      return fetchedAllTasks.value;
    case TaskTimeCondition.UNSCHEDULED:
      return fetchedAllTasks.value.filter((task: TaskResponse) => {
        const endDateTime = task.endDateTime ? new Date(task.endDateTime) : null;
        const reminderDateTime = task.reminderDateTime ? new Date(task.reminderDateTime) : null;
        return !endDateTime && !reminderDateTime;
      });
    case TaskTimeCondition.OVERDUE:
      return fetchedAllTasks.value.filter((task: TaskResponse) => {
        if (task.status === 'done') return false;
        const endDateTime = task.endDateTime ? new Date(task.endDateTime) : null;
        const reminderDateTime = task.reminderDateTime ? new Date(task.reminderDateTime) : null;
        return (endDateTime && endDateTime < now) || (reminderDateTime && reminderDateTime < now);
      });
    case TaskTimeCondition.TODAY: {
      const endOfToday = new Date(today);
      endOfToday.setHours(23, 59, 59, 999);
      return filterTasksByTime(fetchedAllTasks.value, today, endOfToday);
    }
    case TaskTimeCondition.THIS_WEEK: {
      const endOfWeek = new Date(today);
      const day = today.getDay();
      const daysUntilSunday = (7 - day) % 7;
      endOfWeek.setDate(today.getDate() + daysUntilSunday);
      endOfWeek.setHours(23, 59, 59, 999);
      return filterTasksByTime(fetchedAllTasks.value, today, endOfWeek);
    }
    case TaskTimeCondition.THIS_MONTH: {
      const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0, 23, 59, 59, 999);
      return filterTasksByTime(fetchedAllTasks.value, today, endOfMonth);
    }
    default:
      return fetchedAllTasks.value;
  }
});

const {
  selectedConstructionIds,
  selectedProjectIds,
  toggleConstruction,
  toggleProject,
  filteredTasks,
  filteredConstructionList,
} = useUpcomingFilters({
  fetchedAllTasks: fetchedTasksTimeCondition,
  fetchedProjects,
  constructionList,
  selectedStatus,
  daysRange,
  searchQuery,
});

const hasFetchedTasks = computed(() => (fetchedAllTasks.value?.length ?? 0) > 0);

const handleSelectAllFilters = () => {
  selectedConstructionIds.value = (constructionList.value ?? []).map((c) => c.id);
  selectedProjectIds.value = (projectTitleList.value ?? []).map((p) => p.id);
};

const handleClearFilters = () => {
  selectedConstructionIds.value = [];
  selectedProjectIds.value = [];
};

provideTaskCardFilter();
</script>

<style scoped></style>
