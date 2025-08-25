import { z } from 'zod';

export const resendActivationSchema = z.object({
  email: z.string().min(1, 'This is required').email('Invalid email'),
});

export type ResendActivationSchema = z.infer<typeof resendActivationSchema>;
