import { z } from 'zod';

export const tagSchema = z.object({
  tag: z.string().min(1, 'This is required'),
});

export type TagSchema = z.infer<typeof tagSchema>;
