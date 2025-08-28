<template>
  <div class="table-container panel-container relative p-4">
    <ShowUpdateTime
      v-if="props.lastUpdateTime"
      class="absolute right-4 top-4"
      :last-update-time="props.lastUpdateTime"
    />

    <!-- 搜索 -->
    <div v-if="props.showSearch" class="input">
      <el-input
        v-model="searchQuery"
        :placeholder="t('placeholder.search')"
        :prefix-icon="Search"
        clearable
      />
    </div>

    <!-- 表格 -->
    <el-table
      ref="tableRef"
      v-loading="props.loading"
      :data="paginatedData"
      class="custom-table"
      :border="false"
      :max-height="props.maxHeight"
      header-row-class-name="table-header"
      highlight-current-row
      :header-cell-style="{
        color: 'var(--color-black-400) ',
        height: '40px',
        padding: '16px 0',
        whiteSpace: 'nowrap',
        borderBottom: '1px solid var(--color-black-300)',
      }"
      :cell-style="{
        height: '40px',
        lineHeight: '40px',
        color: 'var(--color-black-900)',
        borderBottom: '1px solid var(--color-black-100)',
      }"
    >
      <el-table-column :width="idColumnLength" fixed="left" align="center">
        <template #default="{ $index }">
          {{ $index + 1 }}
        </template>
      </el-table-column>

      <template v-for="column in otherColumns" :key="column.field">
        <el-table-column
          :prop="column.field"
          :label="t(`column.${column.field}`)"
          :min-width="column.minWidth || 80"
          :sortable="true"
          show-overflow-tooltip
        >
          <template #default="scope">
            <slot :name="column.field" :row="scope.row">
              <!-- 如果有自定義的插槽，則使用插槽內容 -->
              <template v-if="column.field === 'tag'">
                <router-link
                  :to="`/observation/${props.observationType}/device/${scope.row.ID}`"
                  class="text-brand-primary underline"
                >
                  {{ scope.row[column.field] }}
                </router-link>
              </template>
              <template v-else>
                <span v-if="scope.row[column.field] === undefined"> N/A</span>
                <p v-else>{{ scope.row[column.field] }}</p>
              </template>
            </slot>
          </template>
        </el-table-column>
      </template>

      <!-- 操作列 -->
      <el-table-column
        v-if="props.showActions && isAdmin"
        :label="t(`column.action`)"
        width="80"
        align="center"
        fixed="right"
      >
        <template #default="{ row }">
          <div class="flex justify-center">
            <DropdownMenu :actions="props.actions" :row="row" />
          </div>
        </template>
      </el-table-column>
    </el-table>

    <!-- 分頁器 -->
    <Pagination
      v-if="props.showPagination"
      :current-page="currentPage"
      :page-size="pageSize"
      :total="data.length"
      @update:current-page="currentPage = $event"
      @update:page-size="pageSize = $event"
    />
  </div>
</template>

<script setup lang="ts" generic="T extends Record<string, any>">
import { Search } from '@element-plus/icons-vue';
import { computed, ref } from 'vue';
import { useI18n } from 'vue-i18n';

import Pagination from '../Pagination.vue';

import DropdownMenu from './DropdownMenu.vue';

import type { Column, TableAction } from '@/types/common';

import ShowUpdateTime from '@/components/core/ShowUpdateTime.vue';
import { useAuth } from '@/composables/useAuth';

const props = withDefaults(
  defineProps<{
    data: T[];
    columns: Column[];
    actions?: TableAction<T>[];
    loading?: boolean;
    showIdColumn?: boolean;
    showActions?: boolean;
    showSearch?: boolean;
    showPagination?: boolean;
    lastUpdateTime?: string | null;
    maxHeight?: string;
    observationType?: string;
  }>(),
  {
    data: () => [] as T[],
    columns: () => [],
    actions: () => [],
    loading: false,
    showIdColumn: true,
    showActions: true,
    showSearch: true,
    showPagination: true,
    lastUpdateTime: null,
    maxHeight: 'calc(100vh - 250px)',
    observationType: '',
  }
);

const { t } = useI18n();
const { isAdmin } = useAuth();

const searchQuery = ref<string>('');
const currentPage = ref<number>(1);
const pageSize = ref<number>(20);
const idColumnLength: string = '50';

const otherColumns = computed<Column[]>(() => props.columns.slice(1));

// 過濾和搜索邏輯
const filteredData = computed(() => {
  let result = props.data;

  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase();
    result = result.filter((item) => {
      return props.columns.some((column) => {
        if (!column.field) return false;
        const value = item[column.field];
        if (value === null || value === undefined) return false;
        return String(value).toLowerCase().includes(query);
      });
    });
  }

  // 分頁
  const startIndex = (currentPage.value - 1) * pageSize.value;
  return result.slice(startIndex, startIndex + pageSize.value);
});

const paginatedData = computed(() => filteredData.value);
</script>

<style lang="scss" scoped>
.input {
  @apply mb-4 flex w-full items-center lg:w-1/4;

  :deep(.el-input__wrapper) {
    @apply h-7 rounded-xl bg-black-100 dark:bg-black-500;
    border-radius: 8px;
    padding: 4px 8px;
    transition: border-color 0.3s ease;

    &.is-focus {
      box-shadow: none;
      border: 1px solid var(--color-brand-primary);
    }
    &.is-error {
      border: 1px solid var(--color-secondary-red);
    }
  }
}
</style>
