<template>
  <form class="mt-2 w-full" @submit.prevent="handleSubmit">
    <div class="flex w-full flex-col gap-3">
      <div class="flex h-full flex-col justify-center">
        <ElSelect
          v-model="materialDefinitionId"
          filterable
          :placeholder="t('placeholder.material.name')"
          class="w-full"
          :loading="props.isLoadingDefinitions"
        >
          <ElOption
            v-for="item in props.materialDefinitions"
            :key="item.id"
            :label="item.name"
            :value="item.id"
          />
        </ElSelect>
        <span v-if="materialDefinitionIdError" class="validation-text mt-1">{{
          materialDefinitionIdError
        }}</span>
      </div>

      <div class="grid grid-cols-2 gap-3">
        <div class="flex flex-col">
          <input
            :value="formattedPlanningQuantity"
            type="text"
            inputmode="decimal"
            class="input-border input-common material-field"
            :placeholder="t('placeholder.material.planning_total_quantity')"
            @input="handlePlanningQuantityInput"
          />
          <span v-if="planningTotalQuantityError" class="validation-text mt-1">
            {{ planningTotalQuantityError }}
          </span>
        </div>
        <div class="flex flex-col">
          <input
            :value="formattedUnitPrice"
            type="text"
            inputmode="decimal"
            class="input-border input-common material-field"
            :placeholder="t('placeholder.material.unit_price')"
            @input="handleUnitPriceInput"
          />
          <span v-if="unitPriceError" class="validation-text mt-1">{{ unitPriceError }}</span>
        </div>
      </div>

      <div class="flex flex-col">
        <textarea
          v-model="note"
          class="input-border input-common material-field p-2;"
          :placeholder="t('placeholder.material.note')"
        />
        <span v-if="noteError" class="validation-text mt-1">{{ noteError }}</span>
      </div>
    </div>
    <DashedButton
      :custom-class="'mt-3'"
      :label="t('button.add_material')"
      :disabled="!meta.valid"
      type="submit"
    />
  </form>
</template>

<script setup lang="ts">
import { ElOption, ElSelect } from 'element-plus';
import { watch } from 'vue';
import { useI18n } from 'vue-i18n';

import type { MaterialDefinitionResponse } from '@/types/response';

import DashedButton from '@/components/core/button/DashedButton.vue';
import { useFormattedNumberInput } from '@/composables/useFormattedNumberInput';
import { usePlanningMaterialForm } from '@/composables/validation/usePlanningMaterialForm';

const props = defineProps<{
  constructionId: string | null;
  materialDefinitions: MaterialDefinitionResponse[] | undefined;
  isLoadingDefinitions: boolean;
}>();
const emit = defineEmits(['add-planning-material']);

const { t } = useI18n();

const {
  meta,
  resetForm,
  handleSubmit: veeHandleSubmit,
  materialDefinitionId,
  materialDefinitionIdError,
  planningTotalQuantity,
  planningTotalQuantityError,
  unitPrice,
  unitPriceError,
  note,
  noteError,
} = usePlanningMaterialForm();

const { formattedValue: formattedPlanningQuantity, handleInput: handlePlanningQuantityInput } =
  useFormattedNumberInput(planningTotalQuantity);

const { formattedValue: formattedUnitPrice, handleInput: handleUnitPriceInput } =
  useFormattedNumberInput(unitPrice);

const handleSubmit = veeHandleSubmit((values) => {
  emit('add-planning-material', { ...values, constructionId: props.constructionId });
  resetForm();
});

// 當使用者選擇材料後，自動帶入該材料的 defaultUnitPrice 作為預設單價
watch(materialDefinitionId, (id) => {
  if (!id) return;
  const def = props.materialDefinitions?.find((d) => d.id === id);
  if (def && typeof def.defaultUnitPrice === 'number') {
    unitPrice.value = def.defaultUnitPrice;
  }
});
</script>
