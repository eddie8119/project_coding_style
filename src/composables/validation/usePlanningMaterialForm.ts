import { toTypedSchema } from '@vee-validate/zod';
import { useField, useForm } from 'vee-validate';
import { useI18n } from 'vue-i18n';

import { createMaterialPlanningSchema } from '@/utils/schemas/createMaterialPlanningSchema';

interface PlanningMaterialFormInitialValues {
  materialDefinitionId?: string;
  construction?: string | null;
  planningTotalQuantity?: number | null;
  unitPrice?: number | null;
  note?: string | null;
}

export function usePlanningMaterialForm(initialValues?: PlanningMaterialFormInitialValues) {
  const { t } = useI18n();
  const validationSchema = toTypedSchema(createMaterialPlanningSchema(t));

  const { handleSubmit, meta, resetForm, setValues } = useForm({
    validationSchema,
    initialValues: {
      materialDefinitionId: initialValues?.materialDefinitionId ?? '',
      planningTotalQuantity: initialValues?.planningTotalQuantity ?? undefined,
      unitPrice: initialValues?.unitPrice ?? null,
      note: initialValues?.note ?? '',
    },
  });

  const { value: materialDefinitionId, errorMessage: materialDefinitionIdError } =
    useField<string>('materialDefinitionId');
  const { value: constructionId, errorMessage: constructionIdError } = useField<string | null>(
    'constructionId'
  );
  const { value: planningTotalQuantity, errorMessage: planningTotalQuantityError } = useField<
    number | null
  >('planningTotalQuantity');
  const { value: unitPrice, errorMessage: unitPriceError } = useField<number | null>('unitPrice');
  const { value: note, errorMessage: noteError } = useField<string | null>('note');

  return {
    handleSubmit,
    meta,
    resetForm,
    setValues,
    materialDefinitionId,
    materialDefinitionIdError,
    constructionId,
    constructionIdError,
    planningTotalQuantity,
    planningTotalQuantityError,
    unitPrice,
    unitPriceError,
    note,
    noteError,
  };
}
