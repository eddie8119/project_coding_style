<template>
  <div class="grid grid-cols-1 gap-4 md:grid-cols-3">
    <PiePanel
      :usage-data="costData"
      :total-amount="totalAmount"
      :title="$t('label.material.total_usage_price')"
    />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';

import type { PlanningMaterialGroup } from '@/types/response';

import PiePanel from '@/components/core/chart/PiePanel.vue';
import { useGroupCostSummary } from '@/composables/material/useGroupCostSummary';
import { resolvePlanningMaterialAmount } from '@/composables/material/usePlanningMaterialCost';

const props = defineProps<{
  groupedMaterials: PlanningMaterialGroup[];
}>();

const { costData, totalAmount } = useGroupCostSummary({
  groups: computed(() => props.groupedMaterials),
  getGroupName: (group) => group.name,
  getGroupItems: (group) => group.planningMaterials ?? [],
  resolveItemAmount: resolvePlanningMaterialAmount,
});
</script>
