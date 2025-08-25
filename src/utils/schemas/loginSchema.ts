import { z } from 'zod';

export const loginSchema = z.object({
  email: z.string().min(1, 'This is required').email('Invalid email'),
  password: z.string().min(5, {
    message: 'At least 5 characters',
  }),
});

export type LoginSchema = z.infer<typeof loginSchema>;
