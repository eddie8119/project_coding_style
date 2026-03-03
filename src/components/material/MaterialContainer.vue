<template>
  <div class="material-construction-container">
    <MaterialSectionShell
      :title="group.name"
      :add-label="t('label.material.add_usage')"
      :is-empty="!group.materials.length"
      :empty-container-class="'flex h-full items-center justify-center'"
      :empty-state-message="t('message.material.empty')"
      :columns="materialColumns"
      table-min-width="1350px"
      table-max-body-height="500px"
      :batch-button-disabled="isBatchUpdateButtonDisabled"
      :batch-button-label="t('button.batch_update')"
      @batch-click="handleBatchUpdateClick"
    >
      <template #add-right>
        <TextLink :to="{ path: `/planning/upload`, hash: '#planning-material-section' }">
          {{ t('label.material.add_new_planning_library') }}
        </TextLink>
      </template>

      <template #add-form>
        <MaterialFormAdd
          class="w-full"
          :construction-id="group.id === 'unassigned' ? null : group.id"
          :planning-materials="planningMaterialsForGroup"
          :is-loading-planning="props.isLoadingPlanning"
          @add-material="handleAddMaterial"
        />
      </template>

      <template #above-table>
        <div class="flex items-center justify-between px-2">
          <Label :label="t('label.material.total_usage_price')" />
          <span class="text-brand-color-difference font-semibold">
            $ {{ formattedGroupTotal }}
          </span>
        </div>
      </template>

      <template #rows>
        <MaterialRowForm
          v-for="material in group.materials"
          :key="material.id"
          ref="materialRowFormRefs"
          :material="material"
          :planning-materials="planningMaterialsForGroup"
          :definition-totals="definitionTotalsPerMaterial[material.id]"
          @delete-material="handleDeleteMaterial"
          @update-validation-status="handleValidationUpdate"
        />
      </template>

      <template #chart>
        <MaterialSectionPieChart
          :title="t('label.material.usage')"
          :variants="pieChartVariants"
          :empty-message="t('message.material.empty')"
        />
      </template>
    </MaterialSectionShell>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import { useI18n } from 'vue-i18n';

import MaterialFormAdd from './MaterialFormAdd.vue';
import MaterialRowForm from './MaterialRowForm.vue';

import type { MaterialGroup, MaterialResponse, PlanningMaterialResponse } from '@/types/response';

import TextLink from '@/components/core/link/TextLink.vue';
import Label from '@/components/core/title/Label.vue';
import MaterialSectionPieChart from '@/components/material/MaterialSectionPieChart.vue';
import MaterialSectionShell from '@/components/material/MaterialSectionShell.vue';
import { useMaterialStatistics } from '@/composables/material/useMaterialStatistics';
import { getMaterialUsageColumns } from '@/constants/materialTableColumns';
import { parseUnknownNumber } from '@/utils/number';

const props = defineProps<{
  group: MaterialGroup;
  isLoadingPlanning: boolean;
  planningMaterials: PlanningMaterialResponse[] | undefined;
}>();
const emit = defineEmits(['add-material', 'delete-material', 'batch-update-materials']);
const { t } = useI18n();

const materialRowFormRefs = ref<InstanceType<typeof MaterialRowForm>[]>([]);
const formValidationStates = ref<Record<string, boolean>>({});

const constructionId = computed(() => (props.group.id === 'unassigned' ? null : props.group.id));
const hasMaterials = computed(() => props.group.materials.length > 0);

const planningMaterialsForGroup = computed(() => {
  if (!props.planningMaterials) return [];
  return props.planningMaterials.filter((p) => p.construction === constructionId.value);
});

const { groupTotal, cumulativeTotalsPerMaterial } = useMaterialStatistics(
  computed(() => props.group.materials)
);

const definitionTotalsPerMaterial = computed(() => cumulativeTotalsPerMaterial.value);

const materialColumns = computed(() => getMaterialUsageColumns(t));

const materialPieDataQuantity = computed(() =>
  props.group.materials
    .map((material) => {
      const quantity = parseUnknownNumber(material.quantity) ?? 0;

      return {
        name:
          material.materialDefinition?.name ||
          t('label.material.unnamed_item', { id: material.id }),
        value: quantity,
      };
    })
    .filter((item) => item.value > 0)
);

const materialPieDataAmount = computed(() =>
  props.group.materials
    .map((material) => {
      const quantity = parseUnknownNumber(material.quantity);
      const unitPrice = parseUnknownNumber(material.unitPrice);
      let value: number | null = null;

      if (quantity !== null && unitPrice !== null) {
        value = quantity * unitPrice;
      } else {
        value = parseUnknownNumber(
          (material as Partial<MaterialResponse> & { amount?: unknown }).amount
        );
      }

      return {
        name:
          material.materialDefinition?.name ||
          t('label.material.unnamed_item', { id: material.id }),
        value: value ?? 0,
      };
    })
    .filter((item) => item.value > 0)
);

const materialQuantityTotal = computed(() =>
  materialPieDataQuantity.value.reduce((total, item) => total + item.value, 0)
);

const pieChartVariants = computed(() => [
  {
    key: 'quantity',
    label: t('label.material.quantity'),
    data: materialPieDataQuantity.value,
    total: materialQuantityTotal.value,
  },
  {
    key: 'amount',
    label: t('label.material.price'),
    data: materialPieDataAmount.value,
    total: groupTotal.value,
  },
]);

const formattedGroupTotal = computed(() =>
  groupTotal.value.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 2 })
);

const isBatchUpdateButtonDisabled = computed(() => {
  if (!hasMaterials.value) return true;
  const states = Object.values(formValidationStates.value);
  return states.length !== props.group.materials.length || states.some((isValid) => !isValid);
});

const handleValidationUpdate = ({ id, isValid }: { id: string; isValid: boolean }) => {
  formValidationStates.value[id] = isValid;
};

const handleAddMaterial = (
  newMaterial: Partial<MaterialResponse> & { materialDefinitionId?: string | null }
) => {
  emit('add-material', {
    ...newMaterial,
    construction: constructionId.value,
  });
};

const handleDeleteMaterial = (materialId: string) => emit('delete-material', materialId);

const collectUpdatedMaterials = () =>
  props.group.materials.map((material, index) => {
    const formRef = materialRowFormRefs.value[index];
    if (!formRef) return material;
    const latestValues = formRef.values ?? {};
    return { ...material, ...latestValues } as MaterialResponse;
  });

const handleBatchUpdateClick = () => {
  if (isBatchUpdateButtonDisabled.value) return;
  emit('batch-update-materials', collectUpdatedMaterials());
};
</script>

<style scoped></style>
