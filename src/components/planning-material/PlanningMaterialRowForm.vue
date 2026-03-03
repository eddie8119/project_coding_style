<template>
  <tr class="border-b border-gray-100 transition hover:bg-gray-50/60">
    <td class="w-[200px] px-2 py-2 align-middle">
      <ElSelect
        v-model="materialDefinitionId"
        filterable
        class="w-full"
        :placeholder="t('placeholder.material.name')"
        :disabled="!materialDefinitions?.length"
        @change="handleMaterialDefinitionChange"
      >
        <ElOption
          v-for="definition in materialDefinitions"
          :key="definition.id"
          :label="definition.name"
          :value="definition.id"
        />
      </ElSelect>
    </td>

    <td class="w-[160px] px-2 py-2 align-middle">
      <input
        :value="formattedPlanningTotalQuantity"
        inputmode="decimal"
        type="text"
        class="input-border input-common pm-field text-left"
        :placeholder="t('placeholder.material.planning_total_quantity')"
        @input="handleQuantityInput"
        @blur="emitUpdate"
      />
    </td>
    <td class="w-[70px] px-2 py-2 align-middle">
      <div class="text-color-difference text-center">
        {{ unit || '-' }}
      </div>
    </td>
    <td class="w-[140px] px-2 py-2 align-middle">
      <input
        :value="formattedUnitPrice"
        inputmode="decimal"
        type="text"
        class="input-border input-common pm-field text-left"
        :placeholder="t('placeholder.material.unit_price')"
        @input="handleUnitPriceInput"
        @blur="emitUpdate"
      />
    </td>
    <td class="w-[160px] px-2 py-2 align-middle">
      <div class="text-color-difference text-center">
        {{ planningTotalPriceDisplay }}
      </div>
    </td>
    <td class="w-[320px] px-2 py-2 align-middle">
      <textarea
        v-model="note"
        rows="1"
        class="input-border input-common pm-field resize-none"
        :placeholder="t('placeholder.material.note')"
        @blur="emitUpdate"
      />
    </td>
    <td class="w-[60px] px-2 py-2 align-middle">
      <DeleteRowAction
        wrapper-class="flex justify-center"
        button-class="text-secondary-red hover:text-red-700"
        :label="t('common.delete')"
        :subject="t('project.material')"
        :target="planningMaterial.materialDefinition?.name || ''"
        @confirm="handleDelete"
      />
    </td>
  </tr>
</template>

<script setup lang="ts">
import { ElOption, ElSelect } from 'element-plus';
import { computed, ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';

import type { MaterialDefinitionResponse, PlanningMaterialResponse } from '@/types/response';

import DeleteRowAction from '@/components/material/DeleteRowAction.vue';
import { useFormattedNumberInput } from '@/composables/useFormattedNumberInput';
import { formatNumberWithCommas } from '@/utils/number';

const props = defineProps<{
  planningMaterial: PlanningMaterialResponse;
  unitOptions?: string[];
  materialDefinitions?: MaterialDefinitionResponse[];
}>();

const emit = defineEmits(['delete-planning-material', 'update-planning-material']);

const { t } = useI18n();

const showDeleteDialog = ref(false);
const materialDefinitionId = ref<string | undefined>(
  props.planningMaterial.materialDefinitionId ?? undefined
);
const unit = ref(props.planningMaterial.materialDefinition?.unit ?? '');
const planningTotalQuantity = ref<number | null>(
  props.planningMaterial.planningTotalQuantity ?? null
);
const unitPrice = ref<number | null>(props.planningMaterial.unitPrice ?? null);
const note = ref<string | null>(props.planningMaterial.note ?? null);

const planningTotalPrice = computed(() => {
  const quantity = planningTotalQuantity.value ?? 0;
  const price = unitPrice.value ?? 0;
  const total = quantity * price;
  return Number.isFinite(total) ? total : null;
});

const { formattedValue: formattedPlanningTotalQuantity, handleInput: handleQuantityInput } =
  useFormattedNumberInput(planningTotalQuantity);

const { formattedValue: formattedUnitPrice, handleInput: handleUnitPriceInput } =
  useFormattedNumberInput(unitPrice);

const planningTotalPriceDisplay = computed(() => {
  if (planningTotalPrice.value === null) return '-';
  return formatNumberWithCommas(planningTotalPrice.value);
});

watch(
  () => props.planningMaterial,
  (next) => {
    materialDefinitionId.value = next.materialDefinitionId ?? undefined;
    unit.value = next.materialDefinition?.unit ?? '';
    planningTotalQuantity.value = next.planningTotalQuantity ?? null;
    unitPrice.value = next.unitPrice ?? null;
    note.value = next.note ?? null;
  },
  { deep: true }
);

const emitUpdate = () => {
  emit('update-planning-material', {
    id: props.planningMaterial.id,
    projectId: props.planningMaterial.projectId,
    construction: props.planningMaterial.construction,
    materialDefinitionId: materialDefinitionId.value ?? null,
    unit: unit.value || null,
    planningTotalQuantity: planningTotalQuantity.value,
    unitPrice: unitPrice.value,
    note: note.value?.trim() || null,
  });
};

const handleMaterialDefinitionChange = (value: string) => {
  const definition = props.materialDefinitions?.find((def) => def.id === value);
  materialDefinitionId.value = value;
  unit.value = definition?.unit ?? '';
  emitUpdate();
};

const handleDelete = () => {
  emit('delete-planning-material', props.planningMaterial.id);
  showDeleteDialog.value = false;
};

const getCurrentValues = () => ({
  materialDefinitionId: materialDefinitionId.value,
  unit: unit.value || null,
  planningTotalQuantity: planningTotalQuantity.value,
  unitPrice: unitPrice.value,
  planningTotalPrice: planningTotalPrice.value,
  note: note.value?.trim() || null,
});

defineExpose({ getCurrentValues, planningTotalPrice });
</script>

<style scoped>
.pm-field {
  @apply w-full rounded-md p-2 text-base;
}
</style>
