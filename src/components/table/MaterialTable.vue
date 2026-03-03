<template>
  <div class="material-table-wrapper flex-1 overflow-x-auto">
    <table class="w-full text-sm" :class="minWidthClass">
      <thead>
        <tr class="text200-color-difference border-b uppercase tracking-wide">
          <th
            v-for="column in columns"
            :key="column.key"
            :class="['px-2', column.widthClass, column.alignClass ?? 'text-center']"
          >
            {{ column.label }}
          </th>
        </tr>
      </thead>
      <tbody class="material-table-body" :style="{ maxHeight: resolvedMaxHeight }">
        <slot />
      </tbody>
    </table>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
type Column = {
  key: string;
  label: string;
  widthClass?: string;
  alignClass?: string;
};

const props = defineProps<{
  columns: Column[];
  maxBodyHeight?: string;
  tableMinWidth?: string;
}>();

const resolvedMaxHeight = computed(() => props.maxBodyHeight ?? '500px');
const minWidthClass = computed(() => `min-w-[${props.tableMinWidth ?? '1100px'}]`);
</script>

<style scoped>
.material-table-body {
  display: block;
  overflow-y: auto;
}

:deep(table thead),
.material-table-body tr {
  display: table;
  width: 100%;
  table-layout: fixed;
}

.material-table-body::-webkit-scrollbar {
  width: 6px;
}

.material-table-body::-webkit-scrollbar-thumb {
  background: rgba(148, 163, 184, 0.6);
  border-radius: 999px;
}
</style>
