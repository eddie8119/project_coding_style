import { z } from 'zod';

import { Role } from '@/types/role';

export const emailSchema = z.object({
  email: z.string().min(1, 'This is required').email('Invalid email'),
  role: z.enum([Role.ADMIN, Role.EDITOR, Role.VIEWER]),
});

export type EmailSchema = z.infer<typeof emailSchema>;
