import { z } from 'zod';

import type { TranslateFunction } from '@/types/i18n';

export const constructionSelectionSchema = z.object({
  id: z.string(),
  name: z.string(),
});

export const createCommonSchema = (t: TranslateFunction) =>
  z.object({
    construction: z
      .array(constructionSelectionSchema)
      .min(1, t('validation.construction_required')),
    unit: z.array(z.string()).optional(),
  });

export type CreateCommonSchema = z.infer<ReturnType<typeof createCommonSchema>>;
