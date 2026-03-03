<template>
  <div v-if="normalizedMaterials.length > 0" class="text-color-difference mt-1">
    <CollapsibleSection
      :show-toggle="showCollapseToggle"
      :expand-text="t('button.fold.expand')"
      :collapse-text="t('button.fold.collapse')"
      :items-count="normalizedMaterials.length"
    >
      <ul class="space-y-1">
        <li v-for="m in normalizedMaterials" :key="m.id" class="flex items-center gap-1 text-sm">
          <span>•</span>
          <span class="font-medium">{{ m.displayName }}</span>

          <template v-if="m.hasQuantity">
            <span class="font-medium">:</span>
            <span>{{ m.qty }} {{ m.unitLabel }}</span>
            <span v-if="m.price !== null">× ${{ m.price.toFixed(2) }}</span>
          </template>

          <template v-if="m.subtotal > 0">
            <span>=</span>
            <span class="font-semibold">${{ m.subtotal.toFixed(2) }}</span>
          </template>
        </li>
      </ul>

      <div v-if="totalAmount > 0" class="mt-2 flex justify-end border-t pt-1 text-sm font-bold">
        {{ t('label.total') }}: ${{ totalAmount.toFixed(2) }}
      </div>
    </CollapsibleSection>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';

import type {
  MaterialDefinitionResponse,
  MaterialResponse,
  PlanningMaterialResponse,
} from '@/types/response';

import CollapsibleSection from '@/components/ui/CollapsibleSection.vue';
import { usePlanningMaterialsContext } from '@/context/usePlanningMaterialsContext';

const props = withDefaults(
  defineProps<{
    materials: MaterialResponse[];
    showTotal?: boolean;
    collapseThreshold?: number;
  }>(),
  {
    showTotal: true,
    collapseThreshold: 5,
  }
);

const { t } = useI18n();

// 便用 planningMaterialId / materialDefinitionId 查名稱
// 在沒有 provider 的頁面（例如 /overview）也要能正常工作，因此使用 optional 模式
const planningMaterialsRef = usePlanningMaterialsContext({ optional: true });
const planningMaterials = computed<PlanningMaterialResponse[]>(
  () => planningMaterialsRef.value ?? []
);

// 有些情況後端可能會直接在 MaterialResponse 上附帶名稱與單位資訊
type MaterialWithDefinition = MaterialResponse & {
  name?: string;
  unit?: string | null;
  materialDefinition?: Pick<MaterialDefinitionResponse, 'name' | 'unit'>;
};

// 2. 使用聯合型別取代 any，並處理邊界情況
const toNum = (val: number | string | null | undefined): number | null => {
  if (val === null || val === undefined || val === '') return null;
  const n = typeof val === 'number' ? val : parseFloat(val);
  return isNaN(n) ? null : n;
};

const normalizedMaterials = computed(() => {
  return props.materials.map((m) => {
    const materialWithDef = m as MaterialWithDefinition;
    const qty = toNum(materialWithDef.quantity);
    const price = toNum(materialWithDef.unitPrice);

    // 由 planningMaterialId 或 materialDefinitionId 推導顯示名稱
    const relatedPlanning = planningMaterials.value.find(
      (p) =>
        (materialWithDef.planningMaterialId && p.id === materialWithDef.planningMaterialId) ||
        (materialWithDef.materialDefinitionId &&
          p.materialDefinitionId === materialWithDef.materialDefinitionId)
    );

    const displayName =
      relatedPlanning?.materialDefinition?.name ??
      // 後端若有 join MaterialDefinition 給 MaterialResponse
      materialWithDef.materialDefinition?.name ??
      materialWithDef.name ??
      '';

    // 計算邏輯保持簡潔
    const subtotal = (qty ?? 0) * (price ?? 0);

    const unitLabel =
      relatedPlanning?.materialDefinition?.unit?.trim() ||
      materialWithDef.unit?.trim() ||
      materialWithDef.materialDefinition?.unit?.trim() ||
      t('label.unit');

    return {
      ...m,
      displayName,
      qty,
      price,
      unitLabel,
      hasQuantity: qty !== null,
      subtotal,
    };
  });
});

const totalAmount = computed(() =>
  normalizedMaterials.value.reduce((sum, m) => sum + m.subtotal, 0)
);

const showCollapseToggle = computed(
  () => normalizedMaterials.value.length > props.collapseThreshold
);
</script>
