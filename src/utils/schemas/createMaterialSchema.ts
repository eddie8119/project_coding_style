import { z } from 'zod';

import type { TranslateFunction } from '@/types/i18n';

export const createMaterialSchema = (t: TranslateFunction) =>
  z
    .object({
      planningMaterialId: z.string().min(1, t('validation.name_required')),
      materialDefinitionId: z.string().min(1, t('validation.name_required')),
      quantity: z
        .number({
          required_error: t('validation.quantity.required'),
          invalid_type_error: t('validation.quantity.required'),
        })
        .refine((value) => value !== null && value !== undefined, {
          message: t('validation.quantity.required'),
        }),
      receivedDateTime: z.string().nullable().optional(),
      note: z.string().nullable().optional(),
      taskId: z.string().nullable().optional(),
    })
    .superRefine((data, ctx) => {
      if (data.quantity !== undefined && data.quantity !== null && data.quantity <= 0) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: t('validation.quantity.positive'),
          path: ['quantity'],
        });
      }
    });

export type CreateMaterialSchema = z.infer<ReturnType<typeof createMaterialSchema>>;
