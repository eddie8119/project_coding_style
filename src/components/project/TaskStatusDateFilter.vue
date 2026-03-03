<template>
  <div
    class="grid grid-cols-1 gap-4 rounded-xl border border-gray-200/70 p-3 md:flex md:flex-row md:flex-nowrap md:items-stretch md:overflow-x-auto"
  >
    <!-- search -->
    <div class="filter-container-outter w-full md:w-[290px] md:flex-none">
      <div class="filter-container-inner w-full md:h-full">
        <Label :label="t('label.search') + t('common.keyword')" />
        <ElInput
          v-model="searchQuery"
          :placeholder="t('placeholder.search')"
          class="input_table w-full md:w-64"
          clearable
          @input="handleSearchInput"
        />
      </div>
    </div>
    <!-- Status Display -->
    <div class="filter-container-outter w-full md:w-[240px] md:flex-none">
      <div class="filter-container-inner w-full md:h-full">
        <Label :label="t('label.task.status')" />
        <OptionSelector
          :model-value="selectedStatus"
          :options="statusOptions"
          :class-name="'w-full'"
          @update:model-value="handleStatusChange"
        />
      </div>
    </div>
    <!-- Days Range -->
    <div class="filter-container-outter w-full md:w-[350px] md:flex-none">
      <div class="filter-container-inner w-full self-center md:h-full">
        <div class="relative">
          <Label
            :label="t('label.task.due_date_range')"
            class="block whitespace-normal break-words pr-0 leading-snug md:pr-20"
          />
          <ElSwitch
            v-model="isTimeFilterEnabled"
            size="small"
            :active-text="t('label.actions.enable')"
            :inactive-text="t('label.actions.disable')"
            inline-prompt
            class="mt-1 md:absolute md:right-0 md:top-0 md:mt-0"
            @change="toggleTimeFilter"
          />
        </div>
        <div class="flex h-10 w-full min-w-0 items-center overflow-visible">
          <ElSlider
            v-model="daysRange"
            class="slider-bar w-full"
            range
            :min="0"
            :max="10"
            :marks="daysMarks"
            :show-tooltip="true"
            :disabled="!isTimeFilterEnabled"
            @change="handleDaysRangeChange"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ElInput, ElSlider, ElSwitch } from 'element-plus';
import { ElMessage } from 'element-plus';
import { computed, nextTick, onMounted, ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRoute, useRouter } from 'vue-router';

import type { TaskFilterStatus } from '@/constants/selection';
import type { SelectorOption } from '@/types/selection';

import Label from '@/components/core/title/Label.vue';
import OptionSelector from '@/components/ui/OptionSelector.vue';
import { STATUS_FILTER_OPTIONS, STATUS_FILTER_OPTIONS_WITHOUT_DONE } from '@/constants/selection';
import { useTaskFilterStore } from '@/stores/useTaskFilterStore';

const props = withDefaults(
  defineProps<{
    statusDisplayMode?: 'normal' | 'withoutDone';
  }>(),
  {
    statusDisplayMode: 'normal',
  }
);

const emit = defineEmits<{
  (e: 'update:selectedStatus', value: TaskFilterStatus): void;
  (e: 'update:daysRange', value: [number, number] | null): void;
  (e: 'update:searchQuery', value: string): void;
}>();

const { t } = useI18n();
const route = useRoute();
const router = useRouter();

const taskFilterStore = useTaskFilterStore();
const STORAGE_KEY_PREFIX = 'taskStatusFilter.searchQuery:';

const statusOptions = computed(() => {
  switch (props.statusDisplayMode) {
    case 'normal':
      return STATUS_FILTER_OPTIONS;
    case 'withoutDone':
      return STATUS_FILTER_OPTIONS_WITHOUT_DONE as unknown as SelectorOption[];
    default:
      return STATUS_FILTER_OPTIONS;
  }
});

// Search query
const searchQuery = ref<string>(taskFilterStore.searchQuery);

// Status filter
const selectedStatus = ref<TaskFilterStatus>('all');

// Days range filter
const isTimeFilterEnabled = ref(false);
const daysRange = ref<[number, number]>([0, 10]);
const daysMarks: Record<number, string> = {
  0: '0',
  1: '1',
  2: '2',
  3: '3',
  5: '5',
  7: '7',
  10: '10',
};

// Display mode filter - consume from parent context -先廢棄使用
// const { displayMode: taskCardDisplayMode, updateVisibility } = useTaskCardFilter();

const handleStatusChange = (status: TaskFilterStatus) => {
  selectedStatus.value = status;
  emit('update:selectedStatus', status);
};

const handleDaysRangeChange = (value: number | number[]) => {
  if (Array.isArray(value) && value.length === 2 && isTimeFilterEnabled.value) {
    emit('update:daysRange', [value[0], value[1]]);
  }
};

const toggleTimeFilter = (enabled: boolean | string | number) => {
  if (enabled) {
    emit('update:daysRange', daysRange.value);
  } else {
    emit('update:daysRange', null);
  }
};

const handleSearchInput = (value: string) => {
  taskFilterStore.setSearchQuery(value);
};

onMounted(() => {
  const titleFromQuery = route.query.taskTitle;
  const storageKey = `${STORAGE_KEY_PREFIX}${route.path}`;

  if (typeof titleFromQuery === 'string' && titleFromQuery.trim() !== '') {
    // 先更新本地搜尋狀態與快取
    taskFilterStore.setSearchQuery(titleFromQuery);
    localStorage.setItem(storageKey, titleFromQuery);

    // 下一個 tick 再清除 URL 上的 taskTitle，避免重新整理時再次觸發
    nextTick(() => {
      const { taskTitle: _removed, ...rest } = route.query;
      router.replace({ query: rest });
    });
    ElMessage.success(t('message.dialog.restore_input_query'));
  } else {
    // 若 URL 中沒有 taskTitle，嘗試從快取還原先前的搜尋詞
    const cached = localStorage.getItem(storageKey);
    if (cached && cached.trim() !== '') {
      taskFilterStore.setSearchQuery(cached);
    }
  }
});
watch(
  () => taskFilterStore.searchQuery,
  (newQuery) => {
    searchQuery.value = newQuery;
    emit('update:searchQuery', newQuery);

    const storageKey = `${STORAGE_KEY_PREFIX}${route.path}`;
    if (newQuery) {
      localStorage.setItem(storageKey, newQuery);
    } else {
      localStorage.removeItem(storageKey);
    }
  }
);
</script>

<style scoped>
.filter-container-outter {
  @apply flex min-w-0 rounded-lg bg-gray-100 p-3 dark:bg-primaryDark-panel md:p-4;
}

.filter-container-inner {
  @apply flex flex-col justify-center gap-1;
}

/* slider-bar 按鈕 */
:deep(.slider-bar .el-slider__button-wrapper) {
  z-index: 10;
}

:deep(.slider-bar .el-slider__marks-text) {
  font-size: 10px;
  line-height: 1;
}
</style>
