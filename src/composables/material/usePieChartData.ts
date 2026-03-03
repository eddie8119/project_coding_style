import { computed, type ComputedRef } from 'vue';
import { useI18n } from 'vue-i18n';

import { parseUnknownNumber } from '@/utils/number';

export interface PieChartItem {
  name: string;
  value: number;
}

export interface PieChartVariant {
  key: string;
  label: string;
  data: PieChartItem[];
  total?: number;
}

interface MaterialWithQuantityAndPrice {
  quantity?: number | null;
  unitPrice?: number | null;
  amount?: number | null;
  materialDefinition?: { name?: string; defaultUnitPrice?: number };
  id: string;
}

interface PlanningMaterialWithQuantityAndPrice {
  planningTotalQuantity?: number | null;
  unitPrice?: number | null;
  planningTotalPrice?: number | null;
  materialDefinition?: { name?: string; defaultUnitPrice?: number };
  materialDefinitionId?: string;
  id: string;
}

type MaterialLike = MaterialWithQuantityAndPrice | PlanningMaterialWithQuantityAndPrice;

const isMaterialType = (item: MaterialLike): item is MaterialWithQuantityAndPrice => {
  return 'quantity' in item;
};

const isPlanningMaterialType = (
  item: MaterialLike
): item is PlanningMaterialWithQuantityAndPrice => {
  return 'planningTotalQuantity' in item;
};

export function usePieChartData(
  materials: ComputedRef<MaterialLike[]>,
  getItemName: (item: MaterialLike) => string,
  getTotalAmount?: (groupTotal: number) => number
) {
  const { t } = useI18n();

  const pieDataQuantity = computed(() =>
    materials.value
      .map((material) => {
        let quantity = 0;

        if (isMaterialType(material)) {
          quantity = parseUnknownNumber(material.quantity) ?? 0;
        } else if (isPlanningMaterialType(material)) {
          quantity = parseUnknownNumber(material.planningTotalQuantity) ?? 0;
        }

        return {
          name: getItemName(material),
          value: quantity,
        };
      })
      .filter((item) => item.value > 0)
      .sort((a, b) => b.value - a.value)
  );

  const quantityTotal = computed(() =>
    pieDataQuantity.value.reduce((total, item) => total + item.value, 0)
  );

  const pieDataAmount = computed(() => {
    const resolveValue = (material: MaterialLike): number | null => {
      let explicitAmount: number | null = null;
      let quantity: number | null = null;
      let unitPrice: number | null = null;

      if (isMaterialType(material)) {
        quantity = parseUnknownNumber(material.quantity);
        unitPrice = parseUnknownNumber(material.unitPrice);
        explicitAmount = parseUnknownNumber(
          (material as Partial<MaterialWithQuantityAndPrice> & { amount?: unknown }).amount
        );
      } else if (isPlanningMaterialType(material)) {
        quantity = parseUnknownNumber(material.planningTotalQuantity);
        unitPrice = parseUnknownNumber(material.unitPrice);
        explicitAmount = parseUnknownNumber(material.planningTotalPrice);
      }

      if (typeof explicitAmount === 'number' && explicitAmount > 0) {
        return explicitAmount;
      }

      if (quantity !== null && unitPrice !== null) {
        return quantity * unitPrice;
      }

      return null;
    };

    return materials.value
      .map((material) => ({
        name: getItemName(material),
        value: resolveValue(material) ?? 0,
      }))
      .filter((item) => item.value > 0)
      .sort((a, b) => b.value - a.value);
  });

  const createVariants = (amountTotal: number): PieChartVariant[] => [
    {
      key: 'quantity',
      label: t('label.material.quantity'),
      data: pieDataQuantity.value,
      total: quantityTotal.value,
    },
    {
      key: 'amount',
      label: t('label.material.price'),
      data: pieDataAmount.value,
      total: getTotalAmount ? getTotalAmount(amountTotal) : amountTotal,
    },
  ];

  return {
    pieDataQuantity,
    pieDataAmount,
    quantityTotal,
    createVariants,
  };
}
