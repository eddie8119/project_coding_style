import { computed, type ComputedRef } from 'vue';

export interface GroupCostDatum {
  name: string;
  value: number;
}

interface UseGroupCostSummaryParams<TGroup, TItem> {
  groups: ComputedRef<TGroup[]>;
  getGroupName: (group: TGroup) => string;
  getGroupItems: (group: TGroup) => TItem[] | undefined | null;
  resolveItemAmount: (item: TItem) => number;
}

export function useGroupCostSummary<TGroup, TItem>({
  groups,
  getGroupName,
  getGroupItems,
  resolveItemAmount,
}: UseGroupCostSummaryParams<TGroup, TItem>) {
  const costData = computed<GroupCostDatum[]>(() =>
    groups.value
      .map((group) => {
        const items = getGroupItems(group) ?? [];
        const total = items.reduce((sum, item) => sum + Math.max(resolveItemAmount(item), 0), 0);
        return { name: getGroupName(group), value: total };
      })
      .filter((item) => item.value > 0)
      .sort((a, b) => b.value - a.value)
  );

  const totalAmount = computed(() => costData.value.reduce((sum, item) => sum + item.value, 0));

  return {
    costData,
    totalAmount,
  };
}
