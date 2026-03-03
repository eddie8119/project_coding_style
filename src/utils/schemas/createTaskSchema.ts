import { z } from 'zod';

import type { TranslateFunction } from '../../types/i18n';

export const createTaskSchema = (t: TranslateFunction) =>
  z.object({
    title: z.string().min(1, t('validation.title.required')),
    description: z.string().min(1, t('validation.description_required')),
    materials: z
      .array(
        z
          .object({
            taskId: z.string().nullish(),
            // 以 planningMaterialId 為主鍵，materialDefinitionId 作為輔助資訊
            planningMaterialId: z.string().optional(),
            materialDefinitionId: z.string().nullish(),
            name: z.string().optional(),
            quantity: z.number().nullish(),
            unitPrice: z.number().nullish(),
            unit: z.string().nullish(),
            // 與前端 DatePicker 對齊，使用字串（"YYYY-MM-DD HH:mm"）或 null
            receivedDateTime: z.string().nullish(),
            note: z.string().nullish(),
          })
          .superRefine((data, ctx) => {
            // 只在選擇了材料 (planningMaterialId) 的情況下檢查數量與單價
            if (data.planningMaterialId && data.planningMaterialId.trim() !== '') {
              // 如果有 quantity，必須為正數
              if (data.quantity !== undefined && data.quantity !== null && data.quantity <= 0) {
                ctx.addIssue({
                  code: z.ZodIssueCode.custom,
                  message: t('validation.quantity.positive'),
                  path: ['quantity'],
                });
              }
              // 如果有 unitPrice，必須 >= 0
              if (data.unitPrice !== undefined && data.unitPrice !== null && data.unitPrice < 0) {
                ctx.addIssue({
                  code: z.ZodIssueCode.custom,
                  message: t('validation.unit_price.negative'),
                  path: ['unitPrice'],
                });
              }
            }
          })
      )
      .optional(),
    constructionType: z.string(),
    projectId: z.string(),
    status: z.enum(['todo', 'inProgress', 'done']),
    reminderDateTime: z.string().optional(),
    endDateTime: z.string().optional(),
    pinLocation: z
      .array(
        z.object({
          floorPlanKey: z.string(),
          xPercent: z.number().min(0).max(100),
          yPercent: z.number().min(0).max(100),
          floorPlanUrl: z.string().optional(),
        })
      )
      .nullable()
      .optional(),
  });

export type CreateTaskSchema = z.infer<ReturnType<typeof createTaskSchema>>;
