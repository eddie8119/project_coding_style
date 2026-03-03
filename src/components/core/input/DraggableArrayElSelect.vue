<template>
  <BaseDraggableArray
    :model-value="modelValue"
    :title="title || t('label.material.add_usage')"
    :add-button-text="addButtonText"
    :new-item-factory="newItemFactory"
    :item-errors="itemErrors"
    @update:model-value="handleBaseUpdate"
  >
    <template #control="{ item, index }">
      <ElSelect
        v-model="item.planningMaterialId"
        filterable
        :placeholder="t('placeholder.material.select_planning_name')"
        class="flex-1"
        @change="(id) => handlePlanningMaterialChange(id as string, index)"
      >
        <ElOption
          v-for="option in filteredPlanningMaterials"
          :key="option.id"
          :label="option.materialDefinition?.name"
          :value="option.id"
        />
      </ElSelect>
    </template>

    <template #inputs="slotProps">
      <slot name="inputs" v-bind="slotProps" />
    </template>
  </BaseDraggableArray>
</template>

<script setup lang="ts" generic="T extends MaterialDragItem">
import { ElOption, ElSelect } from 'element-plus';
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';

import BaseDraggableArray from './BaseDraggableArray.vue';

import type { MaterialDragItem } from '@/types/drag';
import type { PlanningMaterialResponse } from '@/types/response';

import { useConstructionIdContext } from '@/context/useConstructionIdContext';
import { usePlanningMaterialsContext } from '@/context/usePlanningMaterialsContext';

const props = withDefaults(
  defineProps<{
    modelValue: T[];
    title: string;
    newItemFactory: () => T;
    namePlaceholder?: string;
    addButtonText?: string;
    itemErrors?: Record<number, string>;
  }>(),
  {
    title: '',
    namePlaceholder: '',
    addButtonText: '',
    itemErrors: () => ({}),
  }
);

const emit = defineEmits<{ 'update:modelValue': [value: T[]] }>();

const { t } = useI18n();

const planningMaterialsRef = usePlanningMaterialsContext({ optional: true });
const planningMaterials = computed<PlanningMaterialResponse[]>(
  () => planningMaterialsRef.value ?? []
);

const constructionId = useConstructionIdContext();
const filteredPlanningMaterials = computed(() => {
  const currentConstructionId = constructionId?.value;
  if (!currentConstructionId) {
    return planningMaterials.value;
  }
  return planningMaterials.value.filter((item) => item.construction === currentConstructionId);
});

const updateItems = (updater: (items: T[]) => T[]) => {
  emit('update:modelValue', updater([...props.modelValue]));
};

const handleBaseUpdate = (value: T[]) => {
  emit('update:modelValue', value);
};

const handlePlanningMaterialChange = (planningMaterialId: string, itemIndex: number) => {
  const selected = planningMaterials.value.find((p) => p.id === planningMaterialId);
  if (!selected) return;

  updateItems((items) => {
    if (!items[itemIndex]) return items;

    items[itemIndex] = {
      ...items[itemIndex],
      planningMaterialId: selected.id,
      materialDefinitionId: selected.materialDefinitionId,
      name: selected.materialDefinition?.name ?? '',
      unit: selected.materialDefinition?.unit ?? null,
      unitPrice: selected.unitPrice ?? null,
    } as T;

    return items;
  });
};
</script>

<style scoped></style>
