import { useMutation, useQuery, useQueryClient } from '@tanstack/vue-query';
import { storeToRefs } from 'pinia';
import { computed, type Ref } from 'vue';

import type { ApiResponse } from '@/types/request';
import type { MaterialResponse } from '@/types/response';
import type { CreateMaterialSchema } from '@/utils/schemas/createMaterialSchema';

import { materialApi, type UpdateMaterialPayload } from '@/api/material';
import { useAuthStore } from '@/stores/useAuthStore';
import { isAccessTokenValid } from '@/utils/auth';

// ==================== TYPES ====================
type CreateMaterialPayload = CreateMaterialSchema & { projectId: string };

interface BatchCreateMaterialsPayload {
  projectId: string;
  materials: CreateMaterialSchema[];
}

interface UseMaterialsReturn {
  materials: Ref<MaterialResponse[] | undefined>;
  isLoading: Ref<boolean>;
  refetchMaterials: () => Promise<void>;
  materialError: Ref<Error | null>;

  createMaterial: (materialData: CreateMaterialPayload) => Promise<MaterialResponse | null>;
  isCreatingMaterial: Ref<boolean>;
  createMaterialError: Ref<Error | null>;

  updateMaterial: (
    id: string,
    materialData: UpdateMaterialPayload
  ) => Promise<MaterialResponse | null>;
  isUpdatingMaterial: Ref<boolean>;
  updateMaterialError: Ref<Error | null>;

  deleteMaterial: (id: string) => Promise<void>;
  isDeletingMaterial: Ref<boolean>;
  deleteMaterialError: Ref<Error | null>;

  batchCreateMaterials: (
    payload: BatchCreateMaterialsPayload
  ) => Promise<MaterialResponse[] | null>;
  isBatchCreatingMaterials: Ref<boolean>;
  batchCreateMaterialsError: Ref<Error | null>;

  batchUpdateMaterials: (
    materials: (UpdateMaterialPayload & { id: string })[]
  ) => Promise<MaterialResponse[] | null>;
  isBatchUpdatingMaterials: Ref<boolean>;
  batchUpdateMaterialsError: Ref<Error | null>;

  batchDeleteMaterials: (ids: string[]) => Promise<void>;
  isBatchDeletingMaterials: Ref<boolean>;
  batchDeleteMaterialsError: Ref<Error | null>;

  fetchedAllMaterials: Ref<MaterialResponse[] | undefined>;
  isLoadingAllMaterials: Ref<boolean>;
  allMaterialsError: Ref<Error | null>;
  refetchAllMaterials: () => Promise<void>;
}

const QUERY_KEY = 'materials';
export function useMaterials(projectId: Ref<string>): UseMaterialsReturn {
  const queryClient = useQueryClient();
  const authStore = useAuthStore();
  const { isAuthenticated } = storeToRefs(authStore);

  const isAuthAndTokenValid = computed(() => authStore.isAuthenticated && isAccessTokenValid());

  const queryKey = computed(() => [QUERY_KEY, projectId.value]);

  // ==================== Get Materials ====================
  const {
    data: materials,
    isLoading,
    refetch,
    error: materialError,
  } = useQuery<MaterialResponse[], Error>({
    queryKey: queryKey,
    queryFn: async () => {
      if (!projectId.value) return [];
      const res = await materialApi.getMaterialsByProjectId(projectId.value);
      return res.data || [];
    },
    enabled: computed(() => !!projectId.value && isAuthAndTokenValid.value),
  });

  const refetchMaterials = async () => {
    await refetch();
  };

  // ==================== Create Material ====================
  const {
    mutateAsync: createMutate,
    isPending: isCreatingMaterial,
    error: createMaterialError,
  } = useMutation<ApiResponse<MaterialResponse>, Error, CreateMaterialSchema>({
    mutationFn: materialApi.createMaterial,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKey.value });
    },
  });

  const createMaterial = async (materialData: CreateMaterialPayload) => {
    try {
      const { projectId: _projectId, ...schemaPayload } = materialData;
      const res = await createMutate(schemaPayload);
      return res.data || null;
    } catch (error) {
      console.error('Error creating material:', error);
      return null;
    }
  };

  // ==================== Update Material ====================
  const {
    mutateAsync: updateMutate,
    isPending: isUpdatingMaterial,
    error: updateMaterialError,
  } = useMutation<
    ApiResponse<MaterialResponse>,
    Error,
    { id: string; data: UpdateMaterialPayload }
  >({
    mutationFn: ({ id, data }) => materialApi.updateMaterial(id, data),
    onSuccess: (result) => {
      if (result.data) {
        queryClient.invalidateQueries({ queryKey: queryKey.value });
      }
    },
  });

  const updateMaterial = async (id: string, materialData: UpdateMaterialPayload) => {
    try {
      const res = await updateMutate({ id, data: materialData });
      return res.data || null;
    } catch (error) {
      console.error('Error updating material:', error);
      return null;
    }
  };

  // ==================== Delete Material ====================
  const {
    mutateAsync: deleteMutate,
    isPending: isDeletingMaterial,
    error: deleteMaterialError,
  } = useMutation<ApiResponse<null>, Error, string>({
    mutationFn: materialApi.deleteMaterial,
    onSuccess: (_, id) => {
      queryClient.setQueryData(queryKey.value, (oldData: MaterialResponse[] = []) =>
        oldData.filter((m) => m.id !== id)
      );
    },
  });

  const deleteMaterial = async (id: string) => {
    try {
      await deleteMutate(id);
    } catch (error) {
      console.error('Error deleting material:', error);
    }
  };

  // ==================== Batch Create Materials ====================
  const {
    mutateAsync: batchCreateMutate,
    isPending: isBatchCreatingMaterials,
    error: batchCreateMaterialsError,
  } = useMutation<ApiResponse<MaterialResponse[]>, Error, BatchCreateMaterialsPayload>({
    mutationFn: materialApi.batchCreateMaterials,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKey.value });
    },
  });

  const batchCreateMaterials = async (payload: BatchCreateMaterialsPayload) => {
    try {
      const res = await batchCreateMutate(payload);
      return res.data || null;
    } catch (error) {
      console.error('Error batch creating materials:', error);
      return null;
    }
  };

  // ==================== Batch Update Materials ====================
  const {
    mutateAsync: batchUpdateMutate,
    isPending: isBatchUpdatingMaterials,
    error: batchUpdateMaterialsError,
  } = useMutation<
    ApiResponse<MaterialResponse[]>,
    Error,
    (UpdateMaterialPayload & { id: string })[]
  >({
    mutationFn: materialApi.batchUpdateMaterials,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKey.value });
    },
  });

  const batchUpdateMaterials = async (materials: (UpdateMaterialPayload & { id: string })[]) => {
    try {
      const res = await batchUpdateMutate(materials);
      return res.data || null;
    } catch (error) {
      console.error('Error batch updating materials:', error);
      return null;
    }
  };

  // ==================== Batch Delete Materials ====================
  const {
    mutateAsync: batchDeleteMutate,
    isPending: isBatchDeletingMaterials,
    error: batchDeleteMaterialsError,
  } = useMutation<ApiResponse<null>, Error, string[]>({
    mutationFn: materialApi.batchDeleteMaterials,
    onSuccess: (_, ids) => {
      queryClient.setQueryData(queryKey.value, (oldData: MaterialResponse[] = []) => {
        const idSet = new Set(ids);
        return oldData.filter((m) => !idSet.has(m.id));
      });
    },
  });

  const batchDeleteMaterials = async (ids: string[]) => {
    try {
      await batchDeleteMutate(ids);
    } catch (error) {
      console.error('Error batch deleting materials:', error);
    }
  };

  const {
    data: fetchedAllMaterials,
    isLoading: isLoadingAllMaterials,
    error: allMaterialsError,
    refetch: refetchAllMaterials,
  } = useQuery<MaterialResponse[], Error>({
    queryKey: [QUERY_KEY, 'all'],
    queryFn: async () => {
      if (!isAuthenticated.value) return [];
      const res = await materialApi.getAllMaterials();
      return res.data || [];
    },
    enabled: computed(() => isAuthenticated.value),
    staleTime: 1000 * 10 * 3,
  });

  return {
    materials,
    isLoading,
    refetchMaterials,
    materialError,
    createMaterial,
    isCreatingMaterial,
    createMaterialError,
    updateMaterial,
    isUpdatingMaterial,
    updateMaterialError,
    deleteMaterial,
    isDeletingMaterial,
    deleteMaterialError,
    batchCreateMaterials,
    isBatchCreatingMaterials,
    batchCreateMaterialsError,
    batchUpdateMaterials,
    isBatchUpdatingMaterials,
    batchUpdateMaterialsError,
    batchDeleteMaterials,
    isBatchDeletingMaterials,
    batchDeleteMaterialsError,
    fetchedAllMaterials,
    isLoadingAllMaterials,
    allMaterialsError,
    refetchAllMaterials: async () => {
      await refetchAllMaterials();
    },
  };
}
