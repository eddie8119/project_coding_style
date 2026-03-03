<template>
  <div class="flex h-full flex-col">
    <div class="p-3">
      <PillTab :model-value="activeTab" :tabs="tabs" @update:model-value="handleTabChange">
        <template #item="{ tab }">
          {{ t(`tab.tasks.${tab.value}`) }}
        </template>
      </PillTab>

      <AdvancedFilterSection>
        <QuickFilterActions
          :select-all-label="t('button.select_clear')"
          :clear-label="t('button.select_restore')"
          @select-all="clearConstructionSelections"
          @clear-all="restoreConstructionSelections"
        />

        <div class="filter-group mt-3 flex flex-wrap gap-2">
          <button
            v-for="c in constructionContainer || []"
            :key="c.id"
            type="button"
            :class="['normal-button', !selectedConstructionIds.includes(c.id) && 'is-active']"
            @click="toggleConstruction(c.id)"
          >
            {{ c.name }}
          </button>
        </div>
      </AdvancedFilterSection>
    </div>
    <!-- 任務列表 -->
    <div ref="listContainer" class="flex-1 overflow-y-auto p-4">
      <EmptyStatePlaceholder
        v-if="!filteredTasks || filteredTasks.length === 0"
        :message="t('message.no_tasks')"
      />

      <div v-else class="space-y-3">
        <TaskSidebarCard
          v-for="task in filteredTasks"
          :key="task.id"
          ref="taskCardRefs"
          :task="task"
          :is-linked="isTaskLinked(task.id)"
          :is-selected="isTaskSelected(task.id)"
          :is-highlighted="highlightedTaskId === task.id"
          :is-pinning="isPinning"
          :pinning-task-id="pinningTaskId"
          @select="handleTaskSelect(task.id)"
          @link-to-marker="$emit('link-task-to-marker', task.id)"
          @create-marker="$emit('create-marker-for-task', task.id)"
          @remove-pin="$emit('remove-task-pin', task.id)"
          @cancel-marker="$emit('cancel-marker-for-task', task.id)"
          @add-pin-to-task="$emit('add-pin-to-task', $event)"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, nextTick, ref, toRef } from 'vue';
import { useI18n } from 'vue-i18n';

import TaskSidebarCard from './TaskSidebarCard.vue';

import type { TaskResponse } from '@/types/response';
import type { ConstructionSelection } from '@/types/selection';
import type { TaskMarker } from '@/utils/floorPlan/floorPlanMarker';

import EmptyStatePlaceholder from '@/components/core/EmptyStatePlaceholder.vue';
import PillTab from '@/components/core/tab/PillTab.vue';
import QuickFilterActions from '@/components/filter/QuickFilterActions.vue';
import AdvancedFilterSection from '@/components/ui/AdvancedFilterSection.vue';
import {
  filterTasksBySelectedConstructions,
  useConstructionFilter,
} from '@/composables/query/useConstructionFilter';
import { TASK_PIN_CONDITION_TAB_LIST } from '@/constants/tab';
import { TaskPinCondition } from '@/types/task';
import { scrollChildIntoCenter } from '@/utils/scroll';

const props = defineProps<{
  tasks: TaskResponse[] | null;
  taskMarkers: TaskMarker[];
  selectedMarkerId: string | null;
  highlightedTaskId: string | null;
  isPinning: boolean;
  pinningTaskId: string | null;
  constructionContainer: ConstructionSelection[] | null;
}>();

const emit = defineEmits<{
  (e: 'select-task', taskId: string): void;
  (e: 'link-task-to-marker', taskId: string): void;
  (e: 'create-marker-for-task', taskId: string): void;
  (e: 'remove-task-pin', taskId: string): void;
  (e: 'cancel-marker-for-task', taskId: string): void;
  (e: 'add-pin-to-task', taskId: string): void;
}>();

const { t } = useI18n();
const highlightedTaskId = computed(() => props.highlightedTaskId);

const listContainer = ref<HTMLDivElement | null>(null);
type TaskSidebarCardInstance = InstanceType<typeof TaskSidebarCard>;
const taskCardRefs = ref<TaskSidebarCardInstance[]>([]);

// Construction filter state & actions via composable
const constructionContainerRef = toRef(props, 'constructionContainer');
const {
  selectedConstructionIds,
  toggleConstruction,
  restoreConstructionSelections,
  clearConstructionSelections,
} = useConstructionFilter(constructionContainerRef);

// Tab state (default to ALL to show all tasks initially)
const activeTab = ref<TaskPinCondition>(TaskPinCondition.ALL);

const tabs = computed(() =>
  TASK_PIN_CONDITION_TAB_LIST.map((tab) => ({
    value: tab.name,
  }))
);

const handleTabChange = (value: TaskPinCondition | string) => {
  if (Object.values(TaskPinCondition).includes(value as TaskPinCondition)) {
    activeTab.value = value as TaskPinCondition;
  }
};

// 任務按創建時間排序（最新的在前）
const sortedTasks = computed(() => {
  if (!props.tasks) return null;
  return [...props.tasks].sort((a, b) => {
    const dateA = new Date(a.updatedAt).getTime();
    const dateB = new Date(b.updatedAt).getTime();
    return dateB - dateA; // 降序排列，最新的在前
  });
});

// Filtered tasks based on active tab and construction selection
const filteredTasks = computed(() => {
  if (!sortedTasks.value) return null;

  const tasks = sortedTasks.value.filter((task) => {
    if (activeTab.value === TaskPinCondition.WITH_PIN) return task.pinLocation;
    if (activeTab.value === TaskPinCondition.WITHOUT_PIN) return !task.pinLocation;
    return true; // all
  });

  // Apply construction filter from composable helper
  return filterTasksBySelectedConstructions(
    tasks,
    selectedConstructionIds,
    constructionContainerRef
  );
});

// 檢查任務是否已連結到標記
const isTaskLinked = (taskId: string) => {
  return props.taskMarkers.some((marker) => marker.taskId === taskId);
};

// 檢查任務對應的標記是否被選中
const isTaskSelected = (taskId: string) => {
  if (!props.selectedMarkerId) return false;
  const marker = props.taskMarkers.find((marker) => marker.taskId === taskId);
  return marker?.id === props.selectedMarkerId;
};

const handleTaskSelect = (taskId: string) => {
  emit('select-task', taskId);
};

const setActiveTab = (tab: TaskPinCondition) => {
  // 如果目標是切到 WITH_PIN，但當前已經是 ALL 或 WITH_PIN，就不需要再切換
  if (
    tab === TaskPinCondition.WITH_PIN &&
    (activeTab.value === TaskPinCondition.ALL || activeTab.value === TaskPinCondition.WITH_PIN)
  )
    return;

  activeTab.value = tab;
};

const scrollToTask = async (taskId: string) => {
  await nextTick();
  const container = listContainer.value;
  if (!container) return;

  const cardInstance = taskCardRefs.value.find((instance) => instance?.task?.id === taskId);
  if (!cardInstance || !cardInstance.$el) return;

  const el = cardInstance.$el as HTMLElement | null;
  if (!el) return;

  scrollChildIntoCenter(container, el, 'smooth');
};

defineExpose({
  setActiveTab,
  scrollToTask,
  filteredTasks,
  activeTab,
});
</script>
