import { computed, type ComputedRef, type Ref, unref } from 'vue';

// Aggregates material data for an entire group (sum, per-definition totals, per-row cumulative values).

import type { MaterialResponse } from '@/types/response';

export type MaterialSource =
  | Ref<MaterialResponse[]>
  | ComputedRef<MaterialResponse[]>
  | MaterialResponse[];

export function useMaterialStatistics(materialsSource: MaterialSource) {
  const materials = computed(() => unref(materialsSource));

  const groupTotal = computed(() =>
    materials.value.reduce((sum, material) => {
      const quantity = Number(material.quantity ?? 0);
      const unitPrice = Number(material.unitPrice ?? 0);
      if (Number.isNaN(quantity) || Number.isNaN(unitPrice)) return sum;
      return sum + quantity * unitPrice;
    }, 0)
  );

  const definitionTotals = computed<Record<string, number>>(() => {
    return materials.value.reduce(
      (acc, material) => {
        const defId = material.materialDefinitionId;
        if (!defId) {
          return acc;
        }
        const qty = Number(material.quantity);
        if (!Number.isFinite(qty)) {
          return acc;
        }
        acc[defId] = (acc[defId] ?? 0) + qty;
        return acc;
      },
      {} as Record<string, number>
    );
  });

  const cumulativeTotalsPerMaterial = computed<Record<string, { cumulative: number }>>(() => {
    const runningTotals: Record<string, number> = {};
    const perMaterial: Record<string, { cumulative: number }> = {};

    for (const material of materials.value) {
      const defId = material.materialDefinitionId;
      if (!defId) continue;
      const qty = Number(material.quantity);
      if (!Number.isFinite(qty)) continue;

      runningTotals[defId] = (runningTotals[defId] ?? 0) + qty;
      perMaterial[material.id] = { cumulative: runningTotals[defId] };
    }

    return perMaterial;
  });

  return {
    groupTotal,
    definitionTotals,
    cumulativeTotalsPerMaterial,
  };
}
