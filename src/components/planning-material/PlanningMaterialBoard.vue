<template>
  <section class="mt-10 w-full min-w-0 space-y-5">
    <PlanningMaterialSummary :grouped-materials="planningMaterialGroups" />

    <HorizontalScrollLayout>
      <PlanningMaterialContainer
        v-for="group in planningMaterialGroups"
        :key="group.id"
        :group="group"
        :planning-materials="planningMaterials"
        :material-definitions="materialDefinitions"
        :is-loading-definitions="isLoadingMaterialDefinitions"
        @add-planning-material="handleAddPlanningMaterial"
        @delete-planning-material="handleDeletePlanningMaterial"
        @batch-update-planning-materials="handleBatchUpdatePlanningMaterials"
      />
    </HorizontalScrollLayout>
  </section>
</template>

<script setup lang="ts">
import { ElMessage } from 'element-plus';
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';

import PlanningMaterialContainer from './PlanningMaterialContainer.vue';
import PlanningMaterialSummary from './PlanningMaterialSummary.vue';

import type { PlanningMaterialGroup, PlanningMaterialResponse } from '@/types/response';
import type { ConstructionSelection } from '@/types/selection';

import HorizontalScrollLayout from '@/components/app-layout/HorizontalScrollLayout.vue';
import { useMaterialDefinitions } from '@/composables/query/useMaterialDefinitions';
import { usePlanningMaterials } from '@/composables/query/usePlanningMaterials';

interface AddPlanningMaterialPayload {
  materialDefinitionId: string;
  constructionId: string | null;
  planningTotalQuantity?: number | null;
  unitPrice?: number | null;
  note?: string | null;
}

const props = defineProps<{
  constructionContainer: ConstructionSelection[] | null;
  projectId: string | undefined;
}>();

const { t } = useI18n();

const projectIdRef = computed(() => props.projectId);

const {
  planningMaterials,
  upsertPlanningMaterial,
  deletePlanningMaterial,
  batchUpsertPlanningMaterials,
} = usePlanningMaterials(projectIdRef);
const { materialDefinitions, isLoadingMaterialDefinitions } = useMaterialDefinitions();

const planningMaterialGroups = computed<PlanningMaterialGroup[]>(() => {
  if (!props.constructionContainer) return [];
  return props.constructionContainer.map((construction) => ({
    id: construction.id,
    name: construction.name,
    planningMaterials:
      planningMaterials.value?.filter((p) => p.construction === construction.id) || [],
  }));
});

const handleAddPlanningMaterial = async (payload: AddPlanningMaterialPayload) => {
  const { constructionId, ...rest } = payload;
  const projectId = projectIdRef.value;
  if (!projectId) return;

  try {
    const qty = Number(rest.planningTotalQuantity);
    if (!Number.isFinite(qty)) {
      ElMessage.error(t('validation.quantity.required'));
      return;
    }

    await upsertPlanningMaterial({
      materialDefinitionId: rest.materialDefinitionId,
      planningTotalQuantity: qty,
      unitPrice: rest.unitPrice ?? null,
      note: rest.note ?? null,
      construction: constructionId,
      projectId,
    });
    ElMessage.success(t('message.material.add.success'));
  } catch (error) {
    console.error('Failed to add planning material:', error);
    ElMessage.error(t('message.material.add.failed'));
  }
};

const handleDeletePlanningMaterial = async (id: string) => {
  try {
    await deletePlanningMaterial(id);
    ElMessage.success(t('message.material.delete.success'));
  } catch (error) {
    console.error(error);
    ElMessage.error(t('message.material.delete.failed'));
  }
};

const handleBatchUpdatePlanningMaterials = async (
  payloads: (Partial<PlanningMaterialResponse> & { id: string })[]
) => {
  const projectId = projectIdRef.value;
  if (!projectId) {
    ElMessage.error('Project ID not found for batch update.');
    return;
  }

  const enrichedPayloads = payloads.map((p) => ({
    ...p,
    projectId,
    createdAt: p.createdAt,
    updatedAt: p.updatedAt,
    materialDefinition: p.materialDefinition,
  }));

  try {
    await batchUpsertPlanningMaterials(enrichedPayloads as unknown as PlanningMaterialResponse[]);
    ElMessage.success(t('message.material.batch_update.success'));
  } catch (error) {
    console.error(error);
    ElMessage.error(t('message.material.batch_update.failed'));
  }
};
</script>
