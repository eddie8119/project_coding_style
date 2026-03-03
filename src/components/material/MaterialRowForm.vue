<template>
  <tr class="border-b border-gray-100 transition hover:bg-gray-50/60">
    <td class="w-[160px] px-2 py-2 align-middle">
      <ElSelect
        v-model="planningMaterialId"
        filterable
        :placeholder="t('placeholder.material.select_planning_name')"
        class="w-full"
        @change="handlePlanningMaterialChange"
      >
        <ElOption
          v-for="item in planningMaterialOptions"
          :key="item.id"
          :label="item.materialDefinition?.name"
          :value="item.id"
        />
      </ElSelect>
      <div v-if="planningMaterialIdError" class="validation-text mt-1">
        {{ planningMaterialIdError }}
      </div>
    </td>
    <td class="w-[120px] px-2 py-2 align-middle">
      <input
        :value="formattedQuantity"
        type="text"
        inputmode="decimal"
        class="input-border input-common material-field"
        :class="{ 'border-red-500': !!quantityError }"
        :placeholder="t('placeholder.material.quantity')"
        @input="handleQuantityInput"
      />
      <div v-if="quantityError" class="validation-text mt-1">
        {{ quantityError }}
      </div>
    </td>
    <td class="w-[160px] px-2 py-2">
      <div class="flex flex-col items-center gap-1">
        <div class="text-color-difference text-center text-xs">
          {{ formattedCompletionRate }}
        </div>
        <ProgressBar :value="rawDefinitionTotal" :total="rawPlanningTarget" />
      </div>
    </td>
    <td class="w-[60px] px-2 py-2 align-middle">
      <div class="text-color-difference text-center">
        {{ unitDisplay }}
      </div>
    </td>
    <td class="w-[110px] px-2 py-2 align-middle">
      <div class="text-color-difference text-center">$ {{ unitPrice }}</div>
    </td>
    <td class="w-[150px] px-2 py-2">
      <div class="text-color-difference text-center font-semibold">
        $ {{ formattedMaterialAmount }}
      </div>
    </td>
    <td class="w-[320px] px-2 py-2 align-middle">
      <div class="flex items-center gap-1">
        <textarea
          v-model="note"
          :rows="isNoteExpanded ? 4 : 1"
          class="input-border input-common material-field resize-none"
          :placeholder="t('placeholder.material.note')"
        />
        <button
          type="button"
          class="hover:bg-primary/10 shrink-0 rounded-md p-1 text-primary"
          :aria-label="isNoteExpanded ? t('button.close') : t('button.fold.expand')"
          @click="toggleNote"
        >
          <component :is="isNoteExpanded ? ArrowUp : ArrowDown" class="h-4 w-4" />
          <span class="sr-only">
            {{ isNoteExpanded ? t('button.close') : t('button.fold.expand') }}
          </span>
        </button>
      </div>
    </td>
    <td class="w-[180px] px-2 py-2 align-middle">
      <div class="date-picker-wrapper w-full">
        <ElDatePicker
          v-model="receivedDateModel"
          type="date"
          format="YYYY/MM/DD"
          :placeholder="t('placeholder.select_received_date') + ' (' + t('common.optional') + ')'"
          class="material-date-picker"
        />
      </div>
    </td>
    <td class="w-[80px] px-2 py-2">
      <DeleteRowAction
        wrapper-class="flex justify-center"
        button-class="text-secondary-red hover:text-red-700"
        :label="t('common.delete')"
        :subject="t('project.material')"
        :target="selectedPlanningMaterial?.materialDefinition?.name || ''"
        @confirm="handleDelete"
      />
    </td>
  </tr>
</template>

<script setup lang="ts">
import { ArrowDown, ArrowUp } from '@element-plus/icons-vue';
import { ElDatePicker, ElOption, ElSelect } from 'element-plus';
import { computed, type Ref, ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';

import type { MaterialResponse, PlanningMaterialResponse } from '@/types/response';

import ProgressBar from '@/components/core/chart/ProgressBar.vue';
import DeleteRowAction from '@/components/material/DeleteRowAction.vue';
import { useMaterialRowStatistics } from '@/composables/material/useMaterialRowStatistics';
import { useFormattedNumberInput } from '@/composables/useFormattedNumberInput';
import { useMaterialForm } from '@/composables/validation/useMaterialForm';
import { toSafeNumber } from '@/utils/number';

const props = defineProps<{
  material: MaterialResponse;
  planningMaterials: PlanningMaterialResponse[] | undefined;
  definitionTotals?: { cumulative: number };
}>();
const emit = defineEmits(['delete-material', 'update-validation-status']);
const { t } = useI18n();

const {
  meta,
  values,
  planningMaterialId,
  planningMaterialIdError,
  quantity,
  quantityError,
  note,
  receivedDateModel,
} = useMaterialForm(props.material);

const { formattedValue: formattedQuantity, handleInput: handleQuantityInput } =
  useFormattedNumberInput(quantity as Ref<number | null | undefined>);

const isNoteExpanded = ref(false);

watch(
  () => meta.value.valid,
  (isValid) => {
    emit('update-validation-status', { id: props.material.id, isValid });
  },
  { immediate: true }
);

const planningMaterialOptions = computed(() => props.planningMaterials ?? []);

const selectedPlanningMaterial = computed(() =>
  planningMaterialOptions.value.find((p) => p.id === planningMaterialId.value)
);

const { definitionTotalQuantity, planningTargetQuantity, formattedCompletionRate } =
  useMaterialRowStatistics({
    cumulativeSource: computed(() => props.definitionTotals),
    planningMaterial: selectedPlanningMaterial,
  });

const rawDefinitionTotal = computed(() => definitionTotalQuantity.value ?? 0);
const rawPlanningTarget = computed(() => planningTargetQuantity.value ?? 0);

const unitDisplay = computed(() => {
  const unitFromSelection = selectedPlanningMaterial.value?.materialDefinition?.unit;
  const unitFromMaterial = props.material.materialDefinition?.unit;
  return unitFromSelection ?? unitFromMaterial ?? '-';
});

const unitPrice = computed(() => {
  const fromMaterial = props.material.unitPrice;
  const fromPlanning = selectedPlanningMaterial.value?.unitPrice ?? null;
  return fromMaterial ?? fromPlanning ?? 0;
});

const materialAmount = computed(() => {
  const q = toSafeNumber(quantity.value);
  const p = toSafeNumber(unitPrice.value);
  return q * p;
});

const formattedMaterialAmount = computed(() => materialAmount.value.toLocaleString());

const syncMaterialDefinition = (selected: PlanningMaterialResponse) => {
  values.planningMaterialId = selected.id;
  (values as unknown as MaterialResponse).materialDefinitionId = selected.materialDefinitionId;
};

const handlePlanningMaterialChange = (selectedId: string) => {
  const selected = planningMaterialOptions.value.find((p) => p.id === selectedId);
  if (!selected) return;
  syncMaterialDefinition(selected);
};

const handleDelete = () => {
  emit('delete-material', props.material.id);
};

const toggleNote = () => {
  isNoteExpanded.value = !isNoteExpanded.value;
};

defineExpose({ values });
</script>

<style scoped>
.material-date-picker :deep(.el-input__wrapper) {
  @apply rounded-lg border border-gray-200 !shadow-none hover:border-primary;
}

:deep(.date-picker-wrapper .el-date-editor) {
  width: 100%;
}
</style>
