import { type MutateFunction, useMutation, useQuery, useQueryClient } from '@tanstack/vue-query';
import { computed, watch } from 'vue';

import type { CommonResponse } from '@/types/response';
import type { ConstructionSelection } from '@/types/selection';
import type { CreateCommonSchema } from '@/utils/schemas/createCommonSchema';
import type { ComputedRef, Ref } from 'vue';

import { commonApi } from '@/api/common';
import { useCommonStore } from '@/stores/useCommonStore';

interface UseCommonReturnType {
  // 獲取通用資料
  fetchedCommon: Ref<CommonResponse | undefined>;
  isLoadingCommon: Ref<boolean>;
  commonError: Ref<Error | null>;
  refetchCommon: () => Promise<void>;

  // 建立通用資料
  createCommon: MutateFunction<
    CommonResponse | undefined,
    Error,
    Partial<CreateCommonSchema>,
    unknown
  >;
  isCreatingCommon: Ref<boolean>;
  createCommonError: Ref<Error | null>;

  // 更新通用資料
  updateCommon: MutateFunction<
    CommonResponse | undefined,
    Error,
    {
      id: string;
      data: Partial<CreateCommonSchema>;
    },
    unknown
  >;
  isUpdatingCommon: Ref<boolean>;
  updateCommonError: Ref<Error | null>;

  // 刪除通用資料
  deleteCommon: (id: string) => Promise<void>;
  isDeletingCommon: Ref<boolean>;
  deleteCommonError: Ref<Error | null>;

  // Computed properties
  constructionItemsFromCommon: ComputedRef<ConstructionSelection[]>;
  unitItemsFromCommon: ComputedRef<string[]>;
  projectTypeItemsFromCommon: ComputedRef<string[]>;
}

const QUERY_KEY = 'common';

export function useCommon(): UseCommonReturnType {
  const queryClient = useQueryClient();
  const commonStore = useCommonStore();

  // ==================== 獲取通用資料 ====================
  const {
    data: fetchedCommon,
    isLoading: isLoadingCommon,
    refetch: refetchQueryCommon,
    error: commonError,
  } = useQuery({
    queryKey: [QUERY_KEY],
    queryFn: async () => {
      const response = await commonApi.getCommon();
      return response.data;
    },
  });

  const refetchCommon = async (): Promise<void> => {
    await refetchQueryCommon();
  };

  // ==================== 建立通用資料 ====================
  const {
    mutateAsync: createCommon,
    isPending: isCreatingCommon,
    error: createCommonError,
  } = useMutation({
    mutationFn: async (data: Partial<CreateCommonSchema>) => {
      const response = await commonApi.createCommon(data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
    },
  });

  // ==================== 更新通用資料 ====================
  const {
    mutateAsync: updateCommon,
    isPending: isUpdatingCommon,
    error: updateCommonError,
  } = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<CreateCommonSchema> }) => {
      const response = await commonApi.updateCommon(id, data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
    },
  });

  // ==================== 刪除通用資料 ====================
  const {
    mutateAsync: deleteCommon,
    isPending: isDeletingCommon,
    error: deleteCommonError,
  } = useMutation({
    mutationFn: async (id: string) => {
      const response = await commonApi.deleteCommon(id);
      if (!response) {
        throw new Error('刪除通用資料失敗');
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
    },
  });

  // 分離 construction 和 unit
  const constructionItemsFromCommon = computed<ConstructionSelection[]>(() => {
    return fetchedCommon.value?.construction || [];
  });

  const unitItemsFromCommon = computed(() => {
    return fetchedCommon.value?.unit || [];
  });

  const projectTypeItemsFromCommon = computed(() => {
    return fetchedCommon.value?.projectType || [];
  });

  watch(
    [constructionItemsFromCommon, unitItemsFromCommon, projectTypeItemsFromCommon],
    ([constructions, units, projectTypes]) => {
      commonStore.setConstructionItems(constructions);
      commonStore.setUnitItems(units);
      commonStore.setProjectTypeItems(projectTypes);
    },
    { immediate: true }
  );

  return {
    // 獲取通用資料
    fetchedCommon,
    isLoadingCommon,
    commonError,
    refetchCommon,
    // 建立通用資料
    createCommon,
    isCreatingCommon,
    createCommonError,
    // 更新通用資料
    updateCommon,
    isUpdatingCommon,
    updateCommonError,
    // 刪除通用資料
    deleteCommon,
    isDeletingCommon,
    deleteCommonError,

    // state
    constructionItemsFromCommon,
    unitItemsFromCommon,
    projectTypeItemsFromCommon,
  };
}
