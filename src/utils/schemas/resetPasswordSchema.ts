import { z } from 'zod';

const passwordRules = {
  min: 8,
  hasUpperCase: /[A-Z]/,
  hasSpecialChar: /[!@#$%^&*]/,
  hasAlphaNumeric: /[0-9a-zA-Z]/,
};

export const resetPasswordSchema = z
  .object({
    newPassword: z
      .string()
      .min(passwordRules.min, `At least ${passwordRules.min} characters`)
      .regex(passwordRules.hasUpperCase, 'Must contain at least 1 uppercase letter')
      .regex(passwordRules.hasSpecialChar, 'Must contain at least 1 special character (!@#$%^&*)')
      .regex(passwordRules.hasAlphaNumeric, 'Must contain alphanumeric characters'),
    newConfirmPassword: z.string(),
  })
  .refine((data) => data.newPassword === data.newConfirmPassword, {
    message: 'Passwords do not match',
    path: ['newConfirmPassword'],
  });

export type ResetPasswordSchema = z.infer<typeof resetPasswordSchema>;
