<template>
  <div class="flex items-center gap-1">
    <template v-if="visibleCollaborators.length">
      <div
        v-for="(collaborator, index) in visibleCollaborators"
        :key="`${collaborator.id}-${index}`"
        class="relative"
        @mouseenter="hoveredIndex = index"
        @mouseleave="hoveredIndex = null"
      >
        <div
          class="flex h-6 w-6 items-center justify-center rounded-full text-xs font-medium text-white"
          :class="avatarColorClass(index)"
        >
          {{ avatarInitial(collaborator.collaboratorEmail) }}
        </div>
        <Tooltip
          :text="collaborator.collaboratorEmail"
          :visible="hoveredIndex === index"
          position="top"
        />
      </div>
      <div
        v-if="remainingCount > 0"
        class="flex h-6 w-6 items-center justify-center rounded-full bg-gray-700 text-xs font-medium text-white"
      >
        +{{ remainingCount }}
      </div>
    </template>
    <span v-else class="text200-color-difference">N/A</span>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';

import type { ProjectCollaboratorResponse } from '@/types/response';

import Tooltip from '@/components/ui/Tooltip.vue';

const props = withDefaults(
  defineProps<{
    collaborators: ProjectCollaboratorResponse[];
    maxVisible?: number;
  }>(),
  {
    collaborators: () => [],
    maxVisible: 3,
  }
);

const hoveredIndex = ref<number | null>(null);

const visibleCollaborators = computed(() => props.collaborators.slice(0, props.maxVisible));
const remainingCount = computed(() =>
  Math.max(0, props.collaborators.length - visibleCollaborators.value.length)
);

const avatarInitial = (email: string) => {
  if (!email) return '?';
  const namePart = email.split('@')[0];
  return (namePart[0] || '?').toUpperCase();
};

const avatarColorClass = (index: number) => {
  const palette = [
    'bg-blue-600',
    'bg-secondary-green',
    'bg-secondary-red',
    'bg-secondary-yellow',
    'bg-purple-600',
  ];
  return palette[index % palette.length];
};
</script>

<style scoped></style>
