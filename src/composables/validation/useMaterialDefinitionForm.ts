import { toTypedSchema } from '@vee-validate/zod';
import { useField, useForm } from 'vee-validate';
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';

import type { MaterialDefinitionResponse } from '@/types/response';

import { createMaterialDefinitionSchema } from '@/utils/schemas/createMaterialDefinitionSchema';

export function useMaterialDefinitionForm(initialValues?: Partial<MaterialDefinitionResponse>) {
  const { t } = useI18n();

  const validationSchema = computed(() => toTypedSchema(createMaterialDefinitionSchema(t)));

  const { handleSubmit, meta, values, resetForm, setValues } = useForm<MaterialDefinitionResponse>({
    validationSchema,
    // coerce partial input into full type for vee-validate; schema will enforce required fields
    initialValues: (initialValues as MaterialDefinitionResponse | undefined) ?? {
      id: '',
      name: '',
      unit: undefined,
      defaultUnitPrice: undefined,
      note: null,
      construction: '',
    },
  });

  const { value: name, errorMessage: nameError } = useField<string>('name');
  const { value: unit } = useField<string | undefined>('unit');
  const { value: defaultUnitPrice, errorMessage: defaultUnitPriceError } = useField<
    number | null | undefined
  >('defaultUnitPrice');
  const { value: note, errorMessage: noteError } = useField<string | null>('note');

  return {
    handleSubmit,
    meta,
    values,
    resetForm,
    setValues,

    name,
    nameError,
    unit,
    defaultUnitPrice,
    defaultUnitPriceError,
    note,
    noteError,
  };
}
