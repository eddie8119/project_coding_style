<template>
  <el-dropdown trigger="click" @command="handleCommand">
    <div class="flex cursor-pointer justify-center">
      <div class="group flex flex-col gap-1">
        <div class="h-1 w-1 rounded-full bg-black-400 group-hover:bg-brand-primary" />
        <div class="h-1 w-1 rounded-full bg-black-400 group-hover:bg-brand-primary" />
        <div class="h-1 w-1 rounded-full bg-black-400 group-hover:bg-brand-primary" />
      </div>
    </div>
    <template #dropdown>
      <el-dropdown-menu>
        <el-dropdown-item v-for="action in actions" :key="action.label" :command="action">
          {{ t(`dropdown.${action.label}`) }}
        </el-dropdown-item>
      </el-dropdown-menu>
    </template>
  </el-dropdown>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n';

interface Action {
  label: string;
  onClick: (row: any) => void;
}

const { t } = useI18n();

const props = defineProps<{
  actions: Action[];
  row: any;
}>();

const handleCommand = (action: Action) => {
  action.onClick(props.row);
};
</script>

<style scoped></style>
