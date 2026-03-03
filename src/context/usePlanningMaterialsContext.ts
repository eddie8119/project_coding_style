import { inject, type InjectionKey, provide, type Ref, ref } from 'vue';

import type { PlanningMaterialResponse } from '@/types/response';

export type PlanningMaterialsRef = Ref<PlanningMaterialResponse[] | undefined>;

const PlanningMaterialsKey: InjectionKey<PlanningMaterialsRef> = Symbol('PlanningMaterials');
const fallbackPlanningMaterials: PlanningMaterialsRef = ref<PlanningMaterialResponse[] | undefined>(
  undefined
);

export function providePlanningMaterials(planningMaterials: PlanningMaterialsRef) {
  provide(PlanningMaterialsKey, planningMaterials);
}

export function usePlanningMaterialsContext(options?: {
  optional?: boolean;
}): PlanningMaterialsRef {
  const ctx = inject(PlanningMaterialsKey, null);
  if (!ctx) {
    if (options?.optional) {
      return fallbackPlanningMaterials;
    }
    throw new Error(
      'usePlanningMaterialsContext must be used within a provider of planning materials'
    );
  }
  return ctx;
}
