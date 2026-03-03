<template>
  <section class="mt-10 w-full min-w-0 space-y-5">
    <H1Title :title="t('title.material_construction')" />
    <MaterialCostSummary
      v-if="materials && materials.length > 0"
      :grouped-materials="materialGroups"
      :construction-container="constructionContainer"
    />

    <HorizontalScrollLayout>
      <MaterialContainer
        v-for="group in materialGroups"
        :key="group.id"
        :group="group"
        :is-loading-planning="isPlanningMaterialsLoading"
        :planning-materials="planningMaterials"
        @add-material="handleAddMaterial"
        @delete-material="handleDeleteMaterial"
        @batch-update-materials="handleBatchUpdateMaterials"
      />
    </HorizontalScrollLayout>
  </section>
</template>

<script setup lang="ts">
import { ElMessage } from 'element-plus';
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRoute } from 'vue-router';

import type { MaterialResponse, TaskResponse } from '@/types/response';
import type { ConstructionSelection } from '@/types/selection';

import HorizontalScrollLayout from '@/components/app-layout/HorizontalScrollLayout.vue';
import H1Title from '@/components/core/title/H1Title.vue';
import MaterialContainer from '@/components/material/MaterialContainer.vue';
import MaterialCostSummary from '@/components/material/MaterialCostSummary.vue';
import { useMaterials } from '@/composables/query/useMaterials';
import { usePlanningMaterials } from '@/composables/query/usePlanningMaterials';

const props = defineProps<{
  constructionContainer: ConstructionSelection[] | null;
  tasks: TaskResponse[] | undefined;
}>();

const { t } = useI18n();
const route = useRoute();
const projectId = computed(() => route.params.id as string);

const { materials, createMaterial, deleteMaterial, batchUpdateMaterials } = useMaterials(projectId);
const { planningMaterials, isPlanningMaterialsLoading } = usePlanningMaterials(projectId);

const materialGroups = computed(() => {
  if (!props.constructionContainer || !planningMaterials.value) return [];
  return props.constructionContainer.map((construction) => {
    const planningMaterialsForGroup = planningMaterials.value.filter(
      (p) => p.construction === construction.id
    );
    const planningMaterialIdsForGroup = planningMaterialsForGroup.map((p) => p.id);
    const planningTotalPrice = planningMaterialsForGroup.reduce((sum, planningMaterial) => {
      const raw = Number(planningMaterial.planningTotalPrice ?? 0);
      return Number.isFinite(raw) ? sum + Math.max(0, raw) : sum;
    }, 0);

    const materialsForGroup =
      materials.value?.filter((m) => planningMaterialIdsForGroup.includes(m.planningMaterialId)) ||
      [];

    return {
      id: construction.id,
      name: construction.name,
      materials: materialsForGroup,
      planningTotalPrice,
    };
  });
});

const handleAddMaterial = async (newMaterial: Partial<MaterialResponse>) => {
  if (!newMaterial.planningMaterialId || !newMaterial.materialDefinitionId) {
    ElMessage.warning(t('message.material.add.missing_name'));
    return;
  }

  const payload = {
    planningMaterialId: newMaterial.planningMaterialId,
    materialDefinitionId: newMaterial.materialDefinitionId,
    // Ensure quantity is a required number per schema
    quantity: Number(newMaterial.quantity),
    receivedDateTime: newMaterial.receivedDateTime ?? null,
    note: newMaterial.note ?? null,
    taskId: newMaterial.taskId ?? undefined,
    projectId: projectId.value,
  };

  try {
    // Basic validation to prevent NaN being sent
    if (!Number.isFinite(payload.quantity)) {
      ElMessage.error(t('validation.quantity.required'));
      return;
    }
    await createMaterial(payload);
    ElMessage.success(t('message.material.add.success'));
  } catch (error) {
    console.error(error);
    ElMessage.error(t('message.material.add.failed'));
  }
};

const handleDeleteMaterial = async (materialId: string) => {
  try {
    await deleteMaterial(materialId);
    ElMessage.success(t('message.material.delete.success'));
  } catch (error) {
    console.error(error);
    ElMessage.error(t('message.material.delete.failed'));
  }
};

const handleBatchUpdateMaterials = async (materialsToUpdate: MaterialResponse[]) => {
  try {
    await batchUpdateMaterials(materialsToUpdate as (Partial<MaterialResponse> & { id: string })[]);
    ElMessage.success(t('message.material.batch_update.success'));
  } catch (error) {
    console.error(error);
    ElMessage.error(t('message.material.batch_update.failed'));
  }
};
</script>
