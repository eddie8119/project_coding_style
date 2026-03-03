<template>
  <form class="mt-2 w-full" @submit.prevent="handleSubmit">
    <div class="flex w-full flex-col gap-3">
      <div class="grid grid-cols-2 items-center gap-3">
        <div class="flex h-full flex-col justify-center">
          <ElSelect
            v-model="planningMaterialId"
            filterable
            :placeholder="t('placeholder.material.select_planning_name')"
            class="w-full"
            :loading="props.isLoadingPlanning"
            @change="handleMaterialSelect"
          >
            <ElOption
              v-for="item in props.planningMaterials"
              :key="item.id"
              :label="item.materialDefinition?.name"
              :value="item.id"
            />
          </ElSelect>
          <span v-if="planningMaterialIdError" class="validation-text mt-1">{{
            planningMaterialIdError
          }}</span>
        </div>
        <div class="flex h-full flex-col justify-center">
          <div class="date-picker-wrapper w-full">
            <ElDatePicker
              v-model="datePickerModel"
              type="date"
              format="YYYY/MM/DD"
              :placeholder="
                t('placeholder.select_received_date') + ' (' + t('common.optional') + ')'
              "
              class="h-10 w-full"
            />
          </div>
          <span v-if="receivedDateTimeError" class="validation-text mt-1">{{
            receivedDateTimeError
          }}</span>
        </div>
      </div>

      <div class="grid grid-cols-2 gap-3">
        <div class="flex flex-col">
          <input
            :value="formattedQuantity"
            type="text"
            inputmode="decimal"
            class="input-border input-common material-field"
            :placeholder="t('placeholder.material.quantity')"
            @input="handleQuantityInput"
          />
          <span v-if="quantityError" class="validation-text mt-1">{{ quantityError }}</span>
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
import { ElDatePicker, ElOption, ElSelect } from 'element-plus';
import { type Ref } from 'vue';
import { useI18n } from 'vue-i18n';

import type { PlanningMaterialResponse } from '@/types/response';

import DashedButton from '@/components/core/button/DashedButton.vue';
import { useFormattedNumberInput } from '@/composables/useFormattedNumberInput';
import { useMaterialForm } from '@/composables/validation/useMaterialForm';

const props = defineProps<{
  constructionId: string | null;
  planningMaterials: PlanningMaterialResponse[] | undefined;
  isLoadingPlanning: boolean;
}>();
const emit = defineEmits(['add-material']);
const { t } = useI18n();

const {
  meta,
  resetForm,
  setValues,
  planningMaterialId,
  planningMaterialIdError,
  quantity,
  quantityError,
  note,
  noteError,
  receivedDateTimeError,
  receivedDateModel: datePickerModel,
  handleSubmit: veeHandleSubmit,
} = useMaterialForm();

const { formattedValue: formattedQuantity, handleInput: handleQuantityInput } =
  useFormattedNumberInput(quantity as Ref<number | null | undefined>);

const handleMaterialSelect = (selectedId: string) => {
  const selectedPlanningMaterial = props.planningMaterials?.find((p) => p.id === selectedId);
  if (selectedPlanningMaterial) {
    setValues({
      planningMaterialId: selectedPlanningMaterial.id,
      materialDefinitionId: selectedPlanningMaterial.materialDefinitionId,
    });
  }
};

const handleSubmit = veeHandleSubmit((values) => {
  emit('add-material', values);
  resetForm();
});
</script>

<style scoped>
:deep(.date-picker-wrapper .el-date-editor) {
  width: 100%;
}
</style>
