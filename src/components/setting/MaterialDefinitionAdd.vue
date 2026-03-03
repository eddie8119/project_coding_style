<template>
  <form class="mt-2 w-full" @submit.prevent="onSubmit">
    <div class="flex w-full flex-col gap-3">
      <div class="flex flex-col">
        <ElInput v-model="name" :placeholder="t('label.material.name')" />
        <span v-if="nameError" class="validation-text mt-1">{{ nameError }}</span>
      </div>

      <div class="grid grid-cols-2 gap-3">
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

        <div class="flex h-full flex-col justify-center">
          <ElSelect
            v-model="unitValue"
            class="w-full"
            clearable
            :placeholder="t('label.material.unit')"
          >
            <ElOption v-for="u in unitOptions" :key="u" :label="u" :value="u" />
          </ElSelect>
        </div>
      </div>
      <div class="flex flex-col">
        <textarea
          v-model="note"
          class="input-border input-common material-field p-2;"
          :placeholder="t('label.material.note')"
        />
        <span v-if="noteError" class="validation-text mt-1">{{ noteError }}</span>
      </div>

      <div class="flex items-center gap-2">
        <template v-if="isEditing">
          <TextButton type="submit" size="sm" :disabled="!meta.valid">{{
            t('button.update')
          }}</TextButton>
          <TextButton
            v-if="isEditing"
            type="button"
            size="sm"
            color="danger"
            @click="handleDelete"
            >{{ t('button.delete') }}</TextButton
          >
        </template>
        <DashedButton
          v-else
          :custom-class="'mt-3'"
          :label="t('button.add_material')"
          :disabled="!meta.valid"
          type="submit"
        />
      </div>
    </div>
  </form>
</template>

<script setup lang="ts">
import { ElInput, ElOption, ElSelect } from 'element-plus';
import { computed, type Ref } from 'vue';
import { useI18n } from 'vue-i18n';

import type { MaterialDefinitionResponse } from '@/types/response';

import DashedButton from '@/components/core/button/DashedButton.vue';
import TextButton from '@/components/core/button/TextButton.vue';
import { useFormattedNumberInput } from '@/composables/useFormattedNumberInput';
import { useMaterialDefinitionForm } from '@/composables/validation/useMaterialDefinitionForm';

const props = defineProps<{
  initialData?: MaterialDefinitionResponse | null;
  unitOptions: string[];
}>();

const emit = defineEmits(['submit', 'delete']);

const { t } = useI18n();

const isEditing = computed(() => !!props.initialData);

const {
  meta,
  resetForm,
  name,
  nameError,
  unit,
  defaultUnitPrice,
  defaultUnitPriceError,
  note,
  noteError,
  handleSubmit,
} = useMaterialDefinitionForm(props.initialData ?? undefined);

const { formattedValue: formattedDefaultUnitPrice, handleInput: handleDefaultUnitPriceInput } =
  useFormattedNumberInput(defaultUnitPrice as Ref<number | null | undefined>);

const unitValue = computed<string | undefined>({
  get: () => unit.value as string | undefined,
  set: (value) => {
    unit.value = value;
  },
});

const onSubmit = handleSubmit((values) => {
  emit('submit', values);
  if (!isEditing.value) {
    resetForm();
  }
});

const handleDelete = () => {
  if (props.initialData?.id) {
    emit('delete', props.initialData.id);
  }
};
</script>
