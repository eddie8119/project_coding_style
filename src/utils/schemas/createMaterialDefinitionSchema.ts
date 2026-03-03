import { z } from 'zod';

import type { TranslateFunction } from '@/types/i18n';

export const createMaterialDefinitionSchema = (t: TranslateFunction) =>
  z
    .object({
      id: z.string().optional(),
      name: z.string().min(1, t('validation.name_required')),
      unit: z
        .string({
          required_error: t('validation.unit_required'),
          invalid_type_error: t('validation.unit_required'),
        })
        .min(1, t('validation.unit_required')),
      defaultUnitPrice: z
        .number({
          required_error: t('validation.unit_price.required'),
          invalid_type_error: t('validation.unit_price.required'),
        })
        .refine((value) => value !== null && value !== undefined, {
          message: t('validation.unit_price.required'),
        }),
      note: z.string().nullable().optional(),
      construction: z.string().nullable().optional(),
    })
    .superRefine((data, ctx) => {
      if (data.defaultUnitPrice !== undefined && data.defaultUnitPrice !== null) {
        if (data.defaultUnitPrice < 0) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: t('validation.unit_price.negative'),
            path: ['defaultUnitPrice'],
          });
        }
      }
    });

export type CreateMaterialDefinitionSchema = z.infer<
  ReturnType<typeof createMaterialDefinitionSchema>
>;
