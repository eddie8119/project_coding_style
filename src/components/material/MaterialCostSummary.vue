<template>
  <div class="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
    <div class="col-span-1 lg:col-span-1">
      <PiePanel
        :usage-data="costData"
        :total-amount="totalAmount"
        :title="$t('label.material.total_usage_price')"
      />
    </div>
    <div class="col-span-1 lg:col-span-2">
      <BarPanel
        :bar-chart-data="barChartData"
        :series-label="t('label.material.usage')"
        :construction-container="constructionContainer"
        :grouped-materials="groupedMaterials"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';

import type { MaterialGroup } from '@/types/response';
import type { ConstructionSelection } from '@/types/selection';

import BarPanel from '@/components/core/chart/BarPanel.vue';
import PiePanel from '@/components/core/chart/PiePanel.vue';
import { useGroupCostSummary } from '@/composables/material/useGroupCostSummary';

const props = defineProps<{
  groupedMaterials: MaterialGroup[];
  constructionContainer: ConstructionSelection[] | null;
}>();

const { t } = useI18n();

const { costData, totalAmount } = useGroupCostSummary({
  groups: computed(() => props.groupedMaterials),
  getGroupName: (group) => group.name,
  getGroupItems: (group) => group.materials,
  resolveItemAmount: (material) => {
    const quantity = Number(material.quantity) || 0;
    const unitPrice = Number(material.unitPrice) || 0;
    return quantity * unitPrice;
  },
});

const barChartData = computed(() => {
  const names = costData.value
    .map((d) => d.name)
    .slice()
    .reverse();
  const values = costData.value
    .map((d) => d.value)
    .slice()
    .reverse();
  return { names, values };
});
</script>
