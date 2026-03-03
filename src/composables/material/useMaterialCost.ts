import { computed, ref } from 'vue';

import type { MaterialResponse } from '@/types/response';

import { resolveMaterialAmount } from '@/composables/material/usePlanningMaterialCost';
import { useMaterials } from '@/composables/query/useMaterials';

export function useMaterialCost() {
  const projectId = ref('');
  const { fetchedAllMaterials } = useMaterials(projectId);

  const usageTotalsByProjectId = computed<Record<string, number>>(() => {
    const list = fetchedAllMaterials?.value ?? [];
    return list.reduce<Record<string, number>>((acc, m: MaterialResponse) => {
      const pid = m.projectId;
      if (!pid) return acc;
      const amt = resolveMaterialAmount(m);
      acc[pid] = (acc[pid] ?? 0) + amt;
      return acc;
    }, {});
  });

  return { usageTotalsByProjectId };
}
