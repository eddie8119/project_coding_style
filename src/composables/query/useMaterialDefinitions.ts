import { useMutation, useQuery, useQueryClient } from '@tanstack/vue-query';
import { computed, type Ref } from 'vue';

import type { ApiResponse } from '@/types/request';
import type { MaterialDefinitionResponse } from '@/types/response';

import { materialDefinitionApi } from '@/api/materialDefinition';
import { useAuthStore } from '@/stores/useAuthStore';

const QUERY_KEY = ['material-definitions'];

interface UseMaterialDefinitionsReturn {
  materialDefinitions: Ref<MaterialDefinitionResponse[] | undefined>;
  isLoadingMaterialDefinitions: Ref<boolean>;
  materialDefinitionsError: Ref<Error | null>;
  refetchMaterialDefinitions: () => Promise<void>;

  createMaterialDefinition: (
    data: Partial<Omit<MaterialDefinitionResponse, 'id'>>
  ) => Promise<MaterialDefinitionResponse | null>;
  isCreatingMaterialDefinition: Ref<boolean>;

  updateMaterialDefinition: (
    data: Partial<MaterialDefinitionResponse> & { id: string }
  ) => Promise<MaterialDefinitionResponse | null>;
  isUpdatingMaterialDefinition: Ref<boolean>;

  deleteMaterialDefinition: (id: string) => Promise<boolean>;
  isDeletingMaterialDefinition: Ref<boolean>;

  batchUpdateMaterialDefinitions: (
    data: (Partial<Omit<MaterialDefinitionResponse, 'id'>> & { id: string })[]
  ) => Promise<MaterialDefinitionResponse[] | null>;
  isBatchUpdatingMaterialDefinitions: Ref<boolean>;
}

export function useMaterialDefinitions(): UseMaterialDefinitionsReturn {
  const queryClient = useQueryClient();
  const authStore = useAuthStore();
  const isAuthenticated = computed(() => authStore.isAuthenticated);

  const {
    data: materialDefinitions,
    isLoading: isLoadingMaterialDefinitions,
    refetch,
    error,
  } = useQuery<MaterialDefinitionResponse[], Error>({
    queryKey: QUERY_KEY,
    queryFn: async () => {
      if (!isAuthenticated.value) return [];
      const res = await materialDefinitionApi.getMaterialDefinitions();

      // API 目前直接回傳陣列，而非 Axios 風格的 { data: [...] }
      if (Array.isArray(res)) {
        return res;
      }

      // 若之後改為 Axios response，則讀取 res.data
      const maybeData = (res as { data?: MaterialDefinitionResponse[] }).data;
      return Array.isArray(maybeData) ? maybeData : [];
    },
    enabled: isAuthenticated,
  });

  const refetchMaterialDefinitions = async () => {
    await refetch();
  };

  const { mutateAsync: createMutate, isPending: isCreatingMaterialDefinition } = useMutation<
    ApiResponse<MaterialDefinitionResponse>,
    Error,
    Partial<Omit<MaterialDefinitionResponse, 'id'>>
  >({
    mutationFn: (data) => materialDefinitionApi.createMaterialDefinition(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY });
    },
  });

  const createMaterialDefinition = async (
    data: Partial<Omit<MaterialDefinitionResponse, 'id'>>
  ): Promise<MaterialDefinitionResponse | null> => {
    try {
      const res = await createMutate(data);
      return res.data || null;
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error(e);
      return null;
    }
  };

  const { mutateAsync: updateMutate, isPending: isUpdatingMaterialDefinition } = useMutation<
    ApiResponse<MaterialDefinitionResponse>,
    Error,
    Partial<MaterialDefinitionResponse> & { id: string }
  >({
    mutationFn: (data) => materialDefinitionApi.updateMaterialDefinition(data.id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY });
    },
  });

  const updateMaterialDefinition = async (
    data: Partial<MaterialDefinitionResponse> & { id: string }
  ): Promise<MaterialDefinitionResponse | null> => {
    try {
      const res = await updateMutate(data);
      return res.data || null;
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error(e);
      return null;
    }
  };

  const { mutateAsync: deleteMutate, isPending: isDeletingMaterialDefinition } = useMutation<
    ApiResponse<unknown>,
    Error,
    string
  >({
    mutationFn: (id) => materialDefinitionApi.deleteMaterialDefinition(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY });
    },
  });

  const deleteMaterialDefinition = async (id: string): Promise<boolean> => {
    try {
      await deleteMutate(id);
      return true;
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error(e);
      return false;
    }
  };

  const { mutateAsync: batchUpdateMutate, isPending: isBatchUpdatingMaterialDefinitions } =
    useMutation<
      ApiResponse<MaterialDefinitionResponse[]>,
      Error,
      (Partial<Omit<MaterialDefinitionResponse, 'id'>> & { id: string })[]
    >({
      mutationFn: (data) => materialDefinitionApi.batchUpdateMaterialDefinitions(data),
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: QUERY_KEY });
      },
    });

  const batchUpdateMaterialDefinitions = async (
    data: (Partial<Omit<MaterialDefinitionResponse, 'id'>> & { id: string })[]
  ): Promise<MaterialDefinitionResponse[] | null> => {
    try {
      const res = await batchUpdateMutate(data);
      return res.data || null;
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error(e);
      return null;
    }
  };

  return {
    materialDefinitions,
    isLoadingMaterialDefinitions,
    materialDefinitionsError: error as Ref<Error | null>,
    refetchMaterialDefinitions,
    createMaterialDefinition,
    isCreatingMaterialDefinition,
    updateMaterialDefinition,
    isUpdatingMaterialDefinition,
    deleteMaterialDefinition,
    isDeletingMaterialDefinition,
    // batch
    batchUpdateMaterialDefinitions,
    isBatchUpdatingMaterialDefinitions,
  };
}
