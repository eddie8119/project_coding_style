<template>
  <tr class="border-b border-gray-100 transition hover:bg-gray-50/60">
    <!-- Name -->
    <td class="w-[25%] px-0.5 py-2 align-middle">
      <div class="flex flex-col">
        <input
          v-model="name"
          type="text"
          class="input-border input-common material-field"
          :placeholder="t('label.material.name')"
        />
        <span v-if="nameError" class="validation-text mt-1">{{ nameError }}</span>
      </div>
    </td>

    <!-- Unit -->
    <td class="w-[10%] px-0.5 py-2 align-middle">
      <div class="flex flex-col">
        <select v-model="unit" class="input-border input-common material-field">
          <option value="" disabled>{{ t('label.material.unit') }}</option>
          <option v-for="u in unitOptions" :key="u" :value="u">{{ u }}</option>
        </select>
      </div>
    </td>

    <!-- Default Unit Price -->
    <td class="w-[18%] px-0.5 py-2 align-middle">
      <div class="flex flex-col">
        <input
          :value="formattedDefaultUnitPrice"
          type="text"
          inputmode="decimal"
          class="input-border input-common material-field"
          :placeholder="t('label.material.default_unit_price')"
          @input="handleDefaultUnitPriceInput"
        />
        <span v-if="defaultUnitPriceError" class="validation-text mt-1">
          {{ defaultUnitPriceError }}
        </span>
      </div>
    </td>

    <!-- Note -->
    <td class="w-[30%] px-0.5 py-2 align-middle">
      <div class="flex flex-col gap-1">
        <textarea
          v-model="note"
          rows="1"
          class="input-border input-common material-field resize-none"
          :placeholder="t('label.material.note')"
        />
        <span v-if="noteError" class="validation-text mt-1">{{ noteError }}</span>
      </div>
    </td>

    <!-- Actions -->
    <td class="w-[4%] px-0.5 py-2 align-middle">
      <DeleteRowAction
        wrapper-class="flex justify-center"
        button-class="text-secondary-red hover:text-red-700"
        :label="t('common.delete')"
        :subject="t('project.material')"
        :target="name || props.initialData.name"
        @confirm="handleDelete"
      />
    </td>
  </tr>
</template>

<script setup lang="ts">
import { type Ref } from 'vue';
import { useI18n } from 'vue-i18n';

import type { MaterialDefinitionResponse } from '@/types/response';

import DeleteRowAction from '@/components/material/DeleteRowAction.vue';
import { useFormattedNumberInput } from '@/composables/useFormattedNumberInput';
import { useMaterialDefinitionForm } from '@/composables/validation/useMaterialDefinitionForm';

const props = defineProps<{
  initialData: MaterialDefinitionResponse;
  unitOptions: string[];
}>();

const emit = defineEmits<{
  (e: 'delete', id: string): void;
}>();

const { t } = useI18n();

const { values, name, nameError, unit, defaultUnitPrice, defaultUnitPriceError, note, noteError } =
  useMaterialDefinitionForm(props.initialData);

const { formattedValue: formattedDefaultUnitPrice, handleInput: handleDefaultUnitPriceInput } =
  useFormattedNumberInput(defaultUnitPrice as Ref<number | null | undefined>);

const handleDelete = () => {
  if (props.initialData.id) {
    emit('delete', props.initialData.id);
  }
};

defineExpose({ values });
</script>

<style scoped></style>
