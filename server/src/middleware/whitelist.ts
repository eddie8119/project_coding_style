import camelcaseKeys from 'camelcase-keys';
import { NextFunction, Request, Response } from 'express';
import snakecaseKeys from 'snakecase-keys';

import { isEmailWhitelisted } from '@/config/whitelist';
import { supabase } from '@/lib/supabase';

/**
 * Middleware to check if an email is whitelisted.
 * @param emailField The field name in req.body that contains the email to check.
 */
export const checkWhitelist = (emailField: string = 'email') => {
  return async (req: Request, res: Response, next: NextFunction) => {
    // Determine the email from the body
    // Handle both snake_case and camelCase requests by normalizing
    let email = req.body[emailField];

    if (!email) {
      // Try to find it in snake_cased body or camelCased body if not found directly
      const snakeData = snakecaseKeys(req.body, { deep: true });
      const camelData = camelcaseKeys(req.body, { deep: true });

      // Convert field name to snake_case and camelCase to try to match
      const snakeField = snakecaseKeys({ [emailField]: '' });
      const snakeKey = Object.keys(snakeField)[0];

      const camelField = camelcaseKeys({ [emailField]: '' });
      const camelKey = Object.keys(camelField)[0];

      email = snakeData[snakeKey] || camelData[camelKey];
    }

    if (email && !isEmailWhitelisted(email)) {
      // 白名單
      try {
        await supabase.from('BetaWaitlistEmails').insert([
          {
            email,
            created_at: new Date().toISOString(),
          },
        ]);
      } catch (error) {
        console.error('Failed to record non-whitelisted email:', email, error);
      }

      return res.status(403).json({
        success: false,
        message: 'Access denied. This email is not whitelisted.',
      });
    }

    next();
  };
};
