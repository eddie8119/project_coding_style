import { toTypedSchema } from '@vee-validate/zod';
import { useField, useForm } from 'vee-validate';
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';

import type { MaterialResponse } from '@/types/response';

import { createMaterialSchema } from '@/utils/schemas/createMaterialSchema';

export function useMaterialForm(initialValues?: Partial<MaterialResponse>) {
  const { t } = useI18n();
  const validationSchema = toTypedSchema(createMaterialSchema(t));

  const { handleSubmit, meta, values, resetForm, setValues } = useForm({
    validationSchema,
    initialValues: initialValues
      ? {
          planningMaterialId: initialValues.planningMaterialId,
          materialDefinitionId: initialValues.materialDefinitionId,
          quantity: initialValues.quantity ?? undefined,
          receivedDateTime: initialValues.receivedDateTime
            ? new Date(initialValues.receivedDateTime).toISOString()
            : undefined,
          note: initialValues.note ?? undefined,
          taskId: initialValues.taskId ?? undefined,
        }
      : {},
  });

  const { value: planningMaterialId, errorMessage: planningMaterialIdError } =
    useField<string>('planningMaterialId');
  const { value: materialDefinitionId, errorMessage: materialDefinitionIdError } =
    useField<string>('materialDefinitionId');
  const { value: quantity, errorMessage: quantityError } = useField<number | undefined>('quantity');
  const { value: receivedDateTime, errorMessage: receivedDateTimeError } = useField<string | null>(
    'receivedDateTime'
  );
  const { value: note, errorMessage: noteError } = useField<string | null>('note');

  const receivedDateModel = computed<Date | undefined>({
    get: () => (receivedDateTime.value ? new Date(receivedDateTime.value) : undefined),
    set: (val) => {
      receivedDateTime.value = val ? val.toISOString() : null;
    },
  });

  return {
    handleSubmit,
    // Form state
    meta,
    values,
    resetForm,
    setValues,

    // Fields
    planningMaterialId,
    materialDefinitionId,
    quantity,
    receivedDateTime,
    note,

    // Errors
    planningMaterialIdError,
    materialDefinitionIdError,
    quantityError,
    receivedDateTimeError,
    noteError,

    // Models
    receivedDateModel,
  };
}
