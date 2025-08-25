import { z } from 'zod';

export const forgotPasswordSchema = z.object({
  email: z.string().min(1, 'This is required').email('Invalid email'),
});

export type ForgotPasswordSchema = z.infer<typeof forgotPasswordSchema>;
