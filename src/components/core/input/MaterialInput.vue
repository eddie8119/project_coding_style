<template>
  <DraggableArrayElSelect
    :model-value="modelValue"
    :title="t('label.material.add_usage')"
    :new-item-factory="newItemFactory"
    :name-placeholder="namePlaceholder ?? t('placeholder.material.name')"
    :add-button-text="addButtonText ?? t('label.material.add_usage')"
    :item-errors="itemErrors"
    @update:model-value="onUpdate"
  >
    <template #inputs="{ item }">
      <div class="flex flex-col space-y-2">
        <div class="grid grid-cols-2 gap-2">
          <div class="flex flex-col">
            <div class="flex items-center">
              <span class="text200-color-difference mr-1">{{ unitLabelText }}</span>
              <span class="text-color-difference text-sm">{{ item.unit || '-' }}</span>
            </div>
          </div>
          <div class="flex flex-col">
            <div class="flex items-center">
              <span class="text200-color-difference mr-1">{{ priceLabelText }}</span>
              <span class="text-color-difference text-sm">{{ item.unitPrice || '-' }}</span>
            </div>
          </div>
        </div>
        <div class="flex flex-col gap-1">
          <span class="text200-color-difference">{{ quantityLabelText }}</span>
          <input
            v-model.number="item.quantity"
            type="number"
            min="1"
            class="input-border input-common p-2"
            :placeholder="quantityPlaceholderText"
          />
        </div>
      </div>
    </template>
  </DraggableArrayElSelect>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';

import DraggableArrayElSelect from './DraggableArrayElSelect.vue';

import type { MaterialDragItem } from '@/types/drag';

export interface Item extends MaterialDragItem {
  planningMaterialId: string;
  materialDefinitionId: string;
  quantity?: number;
  unitPrice?: number | null;
  unit?: string | null;
  name?: string; // For display in dropdown
}

const props = withDefaults(
  defineProps<{
    modelValue: Item[];
    namePlaceholder?: string;
    quantityLabel?: string;
    quantityPlaceholder?: string;
    priceLabel?: string;
    pricePlaceholder?: string;
    unitLabel?: string;
    unitPlaceholder?: string;
    addButtonText?: string;
    itemErrors?: Record<number, string>;
  }>(),
  {
    namePlaceholder: undefined,
    quantityLabel: undefined,
    quantityPlaceholder: undefined,
    priceLabel: undefined,
    pricePlaceholder: undefined,
    unitLabel: undefined,
    unitPlaceholder: undefined,
    addButtonText: undefined,
    itemErrors: () => ({}),
  }
);

const emit = defineEmits<{
  (e: 'update:modelValue', value: Item[]): void;
}>();

const { t } = useI18n();

const quantityLabelText = computed(() => props.quantityLabel ?? t('label.material.quantity'));
const quantityPlaceholderText = computed(
  () => props.quantityPlaceholder ?? t('placeholder.material.quantity')
);
const priceLabelText = computed(() => props.priceLabel ?? t('label.material.unit_price'));
const unitLabelText = computed(() => props.unitLabel ?? t('label.material.unit'));

const newItemFactory = (): Item => ({
  planningMaterialId: '',
  materialDefinitionId: '',
  quantity: undefined,
  unitPrice: undefined,
  unit: '',
  name: '',
});

const onUpdate = (value: Item[]) => {
  emit('update:modelValue', value);
};
</script>

<style scoped></style>
