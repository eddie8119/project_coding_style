<template>
  <BaseDraggableArray
    :model-value="modelValue"
    :title="title || t('label.material.add_usage')"
    :add-button-text="addButtonText"
    :new-item-factory="newItemFactory"
    :item-errors="itemErrors"
    @update:model-value="$emit('update:modelValue', $event)"
  >
    <template #control="{ item }">
      <input
        v-model="item.name"
        type="text"
        class="input-border input-common flex-1 p-1"
        :placeholder="namePlaceholder || t('label.name')"
      />
    </template>

    <template #inputs="slotProps">
      <slot name="inputs" v-bind="slotProps" />
    </template>
  </BaseDraggableArray>
</template>

<script setup lang="ts" generic="T extends MaterialDragItem">
import { useI18n } from 'vue-i18n';

import BaseDraggableArray from './BaseDraggableArray.vue';

import type { MaterialDragItem } from '@/types/drag';

withDefaults(
  defineProps<{
    modelValue: T[];
    title: string;
    namePlaceholder?: string;
    addButtonText?: string;
    newItemFactory: () => T;
    itemErrors?: Record<number, string>;
  }>(),
  {
    title: '',
    namePlaceholder: '',
    addButtonText: '',
    itemErrors: () => ({}),
  }
);

defineEmits<{ 'update:modelValue': [value: T[]] }>();

const { t } = useI18n();
</script>

<style scoped></style>
