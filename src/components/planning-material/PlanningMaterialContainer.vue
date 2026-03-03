<template>
  <div class="planning-material-container">
    <MaterialSectionShell
      :title="group.name"
      :add-label="t('label.material.add_new')"
      :is-empty="!planningMaterialsForGroup.length"
      :empty-state-message="t('message.material.empty')"
      :columns="tableColumns"
      table-min-width="1300px"
      table-max-body-height="420px"
      :batch-button-disabled="isBatchUpdateButtonDisabled"
      :batch-button-label="t('button.batch_update')"
      @batch-click="handleBatchUpdateClick"
    >
      <template #add-right>
        <TextLink :to="{ path: `/setting/common/all`, hash: '#material-definition-setting' }">
          {{ t('label.material.add_new_library') }}
        </TextLink>
      </template>

      <template #add-form>
        <PlanningMaterialFormAdd
          class="w-full"
          :construction-id="group.id === 'unassigned' ? null : group.id"
          :material-definitions="availableMaterialDefinitionsForAdd"
          :is-loading-definitions="props.isLoadingDefinitions"
          @add-planning-material="handleAddPlanningMaterial"
        />
      </template>

      <template #above-table>
        <div class="flex items-center justify-between px-2">
          <Label :label="t('label.material.planning_total_price')" />
          <span class="text-brand-color-difference font-semibold">
            $ {{ formattedGroupTotal }}
          </span>
        </div>
      </template>

      <template #rows>
        <PlanningMaterialRowForm
          v-for="item in planningMaterialsForGroup"
          :key="item.id"
          ref="planningMaterialRowRefs"
          :planning-material="item"
          :unit-options="unitOptions"
          :material-definitions="filteredMaterialDefinitions"
          @update-planning-material="handleUpdatePlanningMaterial"
          @delete-planning-material="handleDeletePlanningMaterial"
        />
      </template>

      <template #chart>
        <MaterialSectionPieChart
          :title="t('label.material.planning_total_price')"
          :variants="planningPieChartVariants"
          :empty-message="t('message.material.empty')"
        />
      </template>
    </MaterialSectionShell>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import { useI18n } from 'vue-i18n';

import PlanningMaterialFormAdd from './PlanningMaterialFormAdd.vue';
import PlanningMaterialRowForm from './PlanningMaterialRowForm.vue';

import type {
  MaterialDefinitionResponse,
  PlanningMaterialGroup,
  PlanningMaterialResponse,
} from '@/types/response';

import TextLink from '@/components/core/link/TextLink.vue';
import Label from '@/components/core/title/Label.vue';
import MaterialSectionPieChart from '@/components/material/MaterialSectionPieChart.vue';
import MaterialSectionShell from '@/components/material/MaterialSectionShell.vue';
import { getPlanningMaterialColumns } from '@/constants/materialTableColumns';
import { parseUnknownNumber } from '@/utils/number';

interface AddPlanningMaterialPayload {
  materialDefinitionId: string;
  constructionId: string | null;
}

const props = defineProps<{
  group: PlanningMaterialGroup;
  planningMaterials: PlanningMaterialResponse[] | undefined;
  materialDefinitions: MaterialDefinitionResponse[] | undefined;
  isLoadingDefinitions: boolean;
}>();

const emit = defineEmits([
  'add-planning-material',
  'delete-planning-material',
  'update-planning-material',
  'batch-update-planning-materials',
]);

const { t } = useI18n();

const planningMaterialRowRefs = ref<InstanceType<typeof PlanningMaterialRowForm>[]>([]);

const planningMaterialsForGroup = computed(() => {
  if (!props.planningMaterials) return [];
  const constructionId = props.group.id === 'unassigned' ? null : props.group.id;
  return props.planningMaterials.filter((p) => p.construction === constructionId);
});

const filteredMaterialDefinitions = computed(() => {
  if (!props.materialDefinitions || props.isLoadingDefinitions) return [];

  const constructionId = props.group.id === 'unassigned' ? null : props.group.id;
  return props.materialDefinitions.filter((def) => def.construction === constructionId);
});

// 僅用於「新增表單」：過濾掉本群組中已存在的材料，避免重複建立
const availableMaterialDefinitionsForAdd = computed(() => {
  const defs = filteredMaterialDefinitions.value;
  if (!defs.length) return [] as MaterialDefinitionResponse[];

  const existingIds = new Set(
    planningMaterialsForGroup.value.map((pm) => pm.materialDefinitionId).filter(Boolean)
  );

  return defs.filter((def) => !existingIds.has(def.id));
});

const unitOptions = computed(() => {
  const units = filteredMaterialDefinitions.value.map((def) => def.unit).filter(Boolean);
  return Array.from(new Set(units)) as string[];
});

const tableColumns = computed(() => getPlanningMaterialColumns(t));

const isBatchUpdateButtonDisabled = computed(() => !planningMaterialsForGroup.value.length);

const planningGroupTotal = computed(() =>
  planningMaterialsForGroup.value.reduce((total, material) => {
    const explicitTotal = material.planningTotalPrice;
    if (typeof explicitTotal === 'number') {
      return total + explicitTotal;
    }

    const quantity = material.planningTotalQuantity ?? null;
    const unitPrice = material.unitPrice ?? null;
    if (quantity !== null && unitPrice !== null) {
      return total + quantity * unitPrice;
    }

    return total;
  }, 0)
);

const formattedGroupTotal = computed(() =>
  planningGroupTotal.value.toLocaleString(undefined, {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  })
);

const planningPieDataQuantity = computed(() =>
  planningMaterialsForGroup.value
    .map((material) => {
      const quantity = parseUnknownNumber(material.planningTotalQuantity) ?? 0;

      return {
        name:
          material.materialDefinition?.name ||
          material.materialDefinitionId ||
          t('label.material.unnamed_item', { id: material.id }),
        value: quantity,
      };
    })
    .filter((item) => item.value > 0)
    .sort((a, b) => b.value - a.value)
);

const planningPieDataAmount = computed(() => {
  const resolveValue = (material: PlanningMaterialResponse) => {
    const explicitTotal = Number(material.planningTotalPrice);
    if (Number.isFinite(explicitTotal) && explicitTotal > 0) {
      return explicitTotal;
    }

    const quantity = Number(material.planningTotalQuantity);
    const unitPrice = Number(
      material.unitPrice ?? material.materialDefinition?.defaultUnitPrice ?? null
    );
    if (Number.isFinite(quantity) && Number.isFinite(unitPrice)) {
      const derived = quantity * unitPrice;
      return Number.isFinite(derived) ? derived : null;
    }

    return null;
  };

  return planningMaterialsForGroup.value
    .map((material) => ({
      name:
        material.materialDefinition?.name ||
        material.materialDefinitionId ||
        t('label.material.unnamed_item', { id: material.id }),
      value: resolveValue(material) ?? 0,
    }))
    .filter((item) => item.value > 0)
    .sort((a, b) => b.value - a.value);
});

const planningQuantityTotal = computed(() =>
  planningPieDataQuantity.value.reduce((total, item) => total + item.value, 0)
);

const planningPieChartVariants = computed(() => [
  {
    key: 'quantity',
    label: t('label.material.quantity'),
    data: planningPieDataQuantity.value,
    total: planningQuantityTotal.value,
  },
  {
    key: 'amount',
    label: t('label.material.price'),
    data: planningPieDataAmount.value,
    total: planningGroupTotal.value,
  },
]);

const handleAddPlanningMaterial = (payload: AddPlanningMaterialPayload) => {
  emit('add-planning-material', payload);
};

const handleDeletePlanningMaterial = (id: string) => {
  emit('delete-planning-material', id);
};

const handleUpdatePlanningMaterial = (
  payload: Partial<PlanningMaterialResponse> & { id?: string }
) => {
  emit('update-planning-material', payload);
};

const handleBatchUpdateClick = () => {
  if (isBatchUpdateButtonDisabled.value) return;

  const payloads = planningMaterialsForGroup.value.map((material, index) => {
    const rowRef = planningMaterialRowRefs.value[index];
    const latestValues = rowRef?.getCurrentValues?.();

    if (!latestValues) {
      const fallbackQuantity = material.planningTotalQuantity ?? null;
      const fallbackUnitPrice = material.unitPrice ?? null;
      const fallbackTotalPrice =
        fallbackQuantity !== null && fallbackUnitPrice !== null
          ? fallbackQuantity * fallbackUnitPrice
          : null;

      return {
        projectId: material.projectId,
        construction: material.construction,
        materialDefinitionId: material.materialDefinitionId,
        planningTotalQuantity: fallbackQuantity,
        planningTotalPrice: fallbackTotalPrice,
        unitPrice: fallbackUnitPrice,
        note: material.note,
      } as Partial<Omit<PlanningMaterialResponse, 'id'>>;
    }

    const nextQuantity =
      latestValues.planningTotalQuantity ?? material.planningTotalQuantity ?? null;
    const nextUnitPrice = latestValues.unitPrice ?? material.unitPrice ?? null;
    const nextTotalPrice =
      nextQuantity !== null && nextUnitPrice !== null ? nextQuantity * nextUnitPrice : null;

    return {
      projectId: material.projectId,
      construction: material.construction,
      materialDefinitionId: latestValues.materialDefinitionId ?? material.materialDefinitionId,
      planningTotalQuantity: nextQuantity,
      planningTotalPrice: nextTotalPrice,
      unitPrice: nextUnitPrice,
      note: latestValues.note ?? material.note ?? null,
    } as Partial<Omit<PlanningMaterialResponse, 'id'>>;
  });

  emit('batch-update-planning-materials', payloads);
};
</script>

<style scoped></style>
