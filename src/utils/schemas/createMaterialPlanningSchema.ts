import { z } from 'zod';

import type { TranslateFunction } from '@/types/i18n';

export const createMaterialPlanningSchema = (t: TranslateFunction) =>
  z
    .object({
      id: z.string().optional(),
      materialDefinitionId: z.string().min(1, t('validation.material.required')),
      totalQuantity: z.number().nullable().optional(),
      totalPrice: z.number().nullable().optional(),
      planningTotalQuantity: z
        .number({
          required_error: t('validation.quantity.required'),
          invalid_type_error: t('validation.quantity.required'),
        })
        .refine((value) => value !== null && value !== undefined, {
          message: t('validation.quantity.required'),
        }),
      planningTotalPrice: z.number().nullable().optional(),
      unitPrice: z.number().nullable().optional(),
      note: z.string().nullable().optional(),
    })
    .superRefine((data, ctx) => {
      type NumericField =
        | 'totalQuantity'
        | 'totalPrice'
        | 'planningTotalQuantity'
        | 'planningTotalPrice'
        | 'unitPrice';

      const numericFields: NumericField[] = [
        'totalQuantity',
        'totalPrice',
        'planningTotalQuantity',
        'planningTotalPrice',
        'unitPrice',
      ];

      for (const field of numericFields) {
        const value = data[field];
        if (value !== undefined && value !== null && value < 0) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: t('validation.unit_price.negative'),
            path: [field],
          });
        }
      }
    });

export type CreateMaterialPlanningSchema = z.infer<ReturnType<typeof createMaterialPlanningSchema>>;
