<template>
  <div class="space-y-2">
    <Label v-if="title" :label="title" />
    <Container
      class="flex flex-col gap-2"
      drag-handle-selector=".drag-handle"
      lock-axis="y"
      :drop-placeholder="dropPlaceholder"
      @drop="onDrop"
    >
      <Draggable v-for="(item, index) in modelValue" :key="getItemKey(item, index)">
        <div class="flex flex-col space-y-2">
          <div class="flex items-center gap-1">
            <DragHandle />

            <slot name="control" :item="item" :index="index" />

            <button
              class="text-secondary-red hover:text-red-700"
              type="button"
              :aria-label="deleteLabel"
              @click="removeItem(index)"
            >
              <DeleteIcon />
            </button>
          </div>

          <slot name="inputs" :item="item" :index="index" />

          <div v-if="itemErrors && itemErrors[index]" class="text-xs text-secondary-red">
            {{ itemErrors[index] }}
          </div>
        </div>
      </Draggable>
    </Container>

    <DashedButton :label="addButtonText" @click="addItem" />
  </div>
</template>

<script setup lang="ts" generic="T extends MaterialDragItem">
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';
import { Container, Draggable, type DropResult } from 'vue3-smooth-dnd';

import type { MaterialDragItem } from '@/types/drag';

import DashedButton from '@/components/core/button/DashedButton.vue';
import Label from '@/components/core/title/Label.vue';
import DeleteIcon from '@/components/ui/DeleteIcon.vue';
import DragHandle from '@/components/ui/DragHandle.vue';
import { applyDrag } from '@/utils/dragDrop';

const props = withDefaults(
  defineProps<{
    modelValue: T[];
    title?: string;
    addButtonText?: string;
    newItemFactory: () => T;
    itemErrors?: Record<number, string>;
  }>(),
  {
    title: '',
    addButtonText: '',
    itemErrors: () => ({}),
  }
);

const emit = defineEmits<{
  (e: 'update:modelValue', value: T[]): void;
}>();

const { t } = useI18n();

const deleteLabel = computed(() => t('common.delete'));

const dropPlaceholder = {
  className: 'drop-preview',
  animationDuration: '150',
  showOnTop: true,
};

const getItemKey = (item: T, index: number): string => {
  return 'id' in item && item.id ? String(item.id) : `item-${index}`;
};

const updateItems = (updater: (items: T[]) => T[]) => {
  emit('update:modelValue', updater([...props.modelValue]));
};

const onDrop = (dropResult: DropResult) => {
  updateItems((items) => applyDrag(items, dropResult));
};

const addItem = () => {
  updateItems((items) => [...items, props.newItemFactory()]);
};

const removeItem = (index: number) => {
  updateItems((items) => {
    items.splice(index, 1);
    return items;
  });
};
</script>

<style scoped></style>
