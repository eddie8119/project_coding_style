import { z } from 'zod';

const passwordRules = {
  min: 8,
  hasUpperCase: /[A-Z]/,
  hasSpecialChar: /[!@#$%^&*]/,
  hasAlphaNumeric: /[0-9a-zA-Z]/,
};

export const registerSchema = z
  .object({
    email: z.string().min(1, 'This is required').email('Invalid email'),
    password: z
      .string()
      .min(passwordRules.min, `At least ${passwordRules.min} characters`)
      .regex(passwordRules.hasUpperCase, 'Must contain at least 1 uppercase letter')
      .regex(passwordRules.hasSpecialChar, 'Must contain at least 1 special character (!@#$%^&*)')
      .regex(passwordRules.hasAlphaNumeric, 'Must contain alphanumeric characters'),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

export type RegisterSchema = z.infer<typeof registerSchema>;
