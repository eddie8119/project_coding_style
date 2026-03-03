import { computed, type ComputedRef } from 'vue';

import type {
  MaterialResponse,
  PlanningMaterialResponse,
  ProjectResponse,
  TaskResponse,
} from '@/types/response';

import { usePlanningMaterials } from '@/composables/query/usePlanningMaterials';

// Resolve amount for a single planning material
export function resolvePlanningMaterialAmount(m: PlanningMaterialResponse): number {
  const explicit = Number(m.planningTotalPrice);
  if (Number.isFinite(explicit) && explicit > 0) return explicit;

  const qty = Number(m.planningTotalQuantity);
  const price = Number(m.unitPrice ?? m.materialDefinition?.defaultUnitPrice ?? null);
  if (Number.isFinite(qty) && Number.isFinite(price)) {
    const derived = qty * price;
    return Number.isFinite(derived) ? derived : 0;
  }
  return 0;
}

// Aggregate totals per projectId across planning materials
export function usePlanningTotalsByProjectId(options?: {
  planningMaterialsRef?: ComputedRef<PlanningMaterialResponse[] | null | undefined>;
}) {
  const provided = options?.planningMaterialsRef;
  const { planningMaterials } = usePlanningMaterials();
  const source =
    provided ??
    (planningMaterials as unknown as ComputedRef<PlanningMaterialResponse[] | null | undefined>);

  const planningTotalsByProjectId = computed<Record<string, number>>(() => {
    const list = source.value ?? [];
    return list.reduce<Record<string, number>>((acc, item) => {
      const pid = item.projectId;
      if (!pid) return acc;
      const amt = Math.max(0, resolvePlanningMaterialAmount(item));
      acc[pid] = (acc[pid] ?? 0) + amt;
      return acc;
    }, {});
  });

  return { planningTotalsByProjectId };
}

// Resolve amount for a single material (quantity * unitPrice)
export function resolveMaterialAmount(m: MaterialResponse): number {
  const qty = Number(m.quantity) || 0;
  const unit = Number(m.unitPrice) || 0;
  const v = qty * unit;
  return Number.isFinite(v) && v > 0 ? v : 0;
}

// Aggregate usage totals per projectId from tasks' materials
export function useUsageTotalsByProjectId(options: {
  projectsWithTasksRef: ComputedRef<(ProjectResponse & { tasks: TaskResponse[] })[]>;
}) {
  const source = options.projectsWithTasksRef;

  const usageTotalsByProjectId = computed<Record<string, number>>(() => {
    const projects = source.value ?? [];
    const acc: Record<string, number> = {};
    for (const p of projects) {
      const pid = p.id;
      let sum = 0;
      for (const t of p.tasks || []) {
        for (const m of t.materials || []) {
          sum += resolveMaterialAmount(m);
        }
      }
      if (sum > 0) acc[pid] = sum;
    }
    return acc;
  });

  return { usageTotalsByProjectId };
}
