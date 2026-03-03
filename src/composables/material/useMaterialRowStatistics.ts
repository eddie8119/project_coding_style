import { computed, type ComputedRef, type Ref, unref } from 'vue';

// Provides per-row material stats (definition totals vs planning targets) for display in MaterialRowForm.

import type { PlanningMaterialResponse } from '@/types/response';

type MaybeRef<T> = T | Ref<T> | ComputedRef<T>;

interface UseMaterialRowStatisticsOptions {
  cumulativeSource: MaybeRef<{ cumulative: number } | undefined>;
  planningMaterial: MaybeRef<PlanningMaterialResponse | undefined>;
}

export function useMaterialRowStatistics({
  cumulativeSource,
  planningMaterial,
}: UseMaterialRowStatisticsOptions) {
  const definitionTotalQuantity = computed(() => {
    const cumulative = unref(cumulativeSource)?.cumulative;
    if (typeof cumulative !== 'number' || Number.isNaN(cumulative)) {
      return null;
    }
    return cumulative;
  });

  const formattedDefinitionTotal = computed(() => {
    if (definitionTotalQuantity.value === null) {
      return '-';
    }
    return definitionTotalQuantity.value.toLocaleString();
  });

  const planningTargetQuantity = computed(() => {
    const target = unref(planningMaterial)?.planningTotalQuantity;
    if (target === undefined || target === null) {
      return null;
    }
    const numericTarget = Number(target);
    return Number.isFinite(numericTarget) ? numericTarget : null;
  });

  const completionRate = computed(() => {
    const total = definitionTotalQuantity.value;
    const plan = planningTargetQuantity.value;
    if (total === null || plan === null || plan <= 0) {
      return null;
    }
    return (total / plan) * 100;
  });

  const formattedCompletionRate = computed(() => {
    if (completionRate.value === null) {
      return '-';
    }
    return `${Math.min(completionRate.value, 999).toFixed(0)}%`;
  });

  return {
    definitionTotalQuantity,
    formattedDefinitionTotal,
    planningTargetQuantity,
    completionRate,
    formattedCompletionRate,
  };
}
