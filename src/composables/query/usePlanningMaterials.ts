import { useMutation, useQuery, useQueryClient } from '@tanstack/vue-query';
import { storeToRefs } from 'pinia';
import { computed, isRef, ref, type Ref } from 'vue';

import type { ApiResponse } from '@/types/request';
import type { PlanningMaterialResponse } from '@/types/response';
import type { CreateMaterialPlanningSchema } from '@/utils/schemas/createMaterialPlanningSchema';

import { planningMaterialApi, type PlanningMaterialPayload } from '@/api/planningMaterial';
import { useAuthStore } from '@/stores/useAuthStore';

const QUERY_KEY = 'planning-materials';

export function usePlanningMaterials(projectIdOrRef?: Ref<string | undefined> | string) {
  const queryClient = useQueryClient();
  const authStore = useAuthStore();
  const { isAuthenticated } = storeToRefs(authStore);

  const projectId = projectIdOrRef
    ? isRef(projectIdOrRef)
      ? projectIdOrRef
      : ref(projectIdOrRef)
    : ref(undefined);

  const queryKey = computed(() =>
    projectId.value ? [QUERY_KEY, { projectId: projectId.value }] : [QUERY_KEY]
  );

  const {
    data: planningMaterials,
    isLoading: isPlanningMaterialsLoading,
    isFetching,
    isError,
    error,
    refetch,
  } = useQuery<PlanningMaterialResponse[], Error>({
    queryKey: queryKey,
    queryFn: async () => {
      if (!isAuthenticated.value) return [];
      const res = projectId.value
        ? await planningMaterialApi.getPlanningMaterialsByProjectId(projectId.value)
        : await planningMaterialApi.getAllPlanningMaterials();
      return res.data || [];
    },
    enabled: computed(() => {
      // 如果有 projectId，則 projectId 必須有值才 fetch
      // 如果沒有 projectId，則只要登入就 fetch
      return isAuthenticated.value && (projectIdOrRef ? !!projectId.value : true);
    }),
  });

  const { mutateAsync: upsertPlanningMaterial, isPending: isUpserting } = useMutation<
    ApiResponse<PlanningMaterialResponse>,
    Error,
    CreateMaterialPlanningSchema & { projectId: string; construction: string | null }
  >({
    mutationFn: async (data) => {
      const { projectId, construction, ...rest } = data;
      const payload: PlanningMaterialPayload = { ...rest, projectId, construction };
      const res = await planningMaterialApi.upsertPlanningMaterial(payload);
      if (!res.success) {
        throw new Error(res.message ?? 'Failed to upsert planning material');
      }
      return res;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKey.value });
    },
  });

  const { mutateAsync: batchUpsertPlanningMaterials, isPending: isBatchUpserting } = useMutation<
    ApiResponse<PlanningMaterialResponse[]>,
    Error,
    (Partial<Omit<PlanningMaterialResponse, 'id'>> & { id: string; projectId: string })[]
  >({
    mutationFn: async (data) => {
      const payloads: PlanningMaterialPayload[] = data.map((item) => ({
        id: item.id,
        projectId: item.projectId,
        construction: item.construction ?? null,
        materialDefinitionId: item.materialDefinitionId,
        planningTotalQuantity: item.planningTotalQuantity,
        unitPrice: item.unitPrice,
        note: item.note ?? null,
      }));
      return planningMaterialApi.batchUpsertPlanningMaterials(payloads);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKey.value });
    },
  });

  const { mutateAsync: deletePlanningMaterialMutation, isPending: isDeleting } = useMutation<
    ApiResponse<null>,
    Error,
    string
  >({
    mutationFn: async (id) => {
      const res = await planningMaterialApi.deletePlanningMaterial(id);
      if (!res.success) {
        throw new Error(res.message ?? 'Failed to delete planning material');
      }
      return res;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKey.value });
    },
  });

  const deletePlanningMaterial = async (id: string): Promise<ApiResponse<null>> => {
    return deletePlanningMaterialMutation(id);
  };

  return {
    planningMaterials,
    isPlanningMaterialsLoading,
    isFetching,
    isError,
    error,
    refetch,
    upsertPlanningMaterial,
    isUpserting,
    batchUpsertPlanningMaterials,
    isBatchUpserting,
    deletePlanningMaterial,
    isDeleting,
  };
}
