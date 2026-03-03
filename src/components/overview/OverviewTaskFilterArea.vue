<template>
  <div class="grid-col-1 relative grid gap-4">
    <!-- Quick Actions -->
    <QuickFilterActions
      :select-all-label="t('button.select_clear')"
      :clear-label="t('button.select_restore')"
      @select-all="$emit('select-all-filters')"
      @clear-all="$emit('clear-filters')"
    />
    <!-- Project Filters -->
    <div>
      <Label :label="t('label.project.project') + t('label.filter') + ':'" />
      <div class="filter-group">
        <button
          v-for="p in projectTitleList"
          :key="p.id"
          type="button"
          :class="['normal-button', selectedProjectIds.includes(p.id) && 'is-active']"
          @click="$emit('toggle-project', p.id)"
        >
          {{ p.title }}
        </button>
      </div>
    </div>
    <!-- Construction Filters -->
    <div>
      <Label :label="t('label.construction') + t('label.filter') + ':'" />
      <div class="filter-group">
        <button
          v-for="c in constructionList"
          :key="c.id"
          type="button"
          :class="['normal-button', selectedConstructionIds.includes(c.id) && 'is-active']"
          @click="$emit('toggle-construction', c.id)"
        >
          {{ c.name }}
        </button>
      </div>
    </div>
    <!-- advanced filter -->
    <AdvancedFilterSection>
      <TaskStatusDateFilter
        status-display-mode="withoutDone"
        @update:selected-status="emit('update:selectedStatus', $event)"
        @update:days-range="emit('update:daysRange', $event)"
        @update:search-query="emit('update:searchQuery', $event)"
      />
    </AdvancedFilterSection>
  </div>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n';

import type { TaskFilterStatus } from '@/constants/selection';
import type { ProjectTitle } from '@/types/project';
import type { ConstructionSelection } from '@/types/selection';

import Label from '@/components/core/title/Label.vue';
import QuickFilterActions from '@/components/filter/QuickFilterActions.vue';
import TaskStatusDateFilter from '@/components/project/TaskStatusDateFilter.vue';
import AdvancedFilterSection from '@/components/ui/AdvancedFilterSection.vue';

defineProps<{
  constructionList: ConstructionSelection[];
  projectTitleList: ProjectTitle[];
  selectedConstructionIds: string[];
  selectedProjectIds: string[];
}>();

const emit = defineEmits<{
  'toggle-construction': [id: string];
  'toggle-project': [id: string];
  'clear-filters': [];
  'select-all-filters': [];
  'update:selectedStatus': [status: TaskFilterStatus];
  'update:daysRange': [range: [number, number] | null];
  'update:searchQuery': [value: string];
}>();

const { t } = useI18n();
</script>

<style scoped>
.filter-group {
  @apply mt-1 flex flex-wrap gap-2;
}

.advanced-filter {
  @apply border-t border-gray-200 pt-3;
}

.toggle-icon {
  @apply transition-transform duration-200;
}

.toggle-icon.is-open {
  @apply rotate-180;
}
</style>
