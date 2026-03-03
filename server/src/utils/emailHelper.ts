import { Response } from 'express';

import { emailService } from '@/services/notification/email.service';
import { getRemainingAttempts, getResetTimeInSeconds, isRateLimited } from '@/utils/rateLimiter';

/**
 * 郵件操作類型
 */
export enum EmailOperationType {
  ACTIVATION = 'activation',
  PASSWORD_RESET = 'password_reset',
}

/**
 * 郵件發送結果
 */
export interface EmailSendResult {
  success: boolean;
  message: string;
  shouldRollback: boolean; // 是否應該回滾用戶
}

/**
 * 檢查郵件操作是否受速率限制
 */
export const checkEmailRateLimit = (
  email: string,
  operationType: EmailOperationType,
  maxAttempts: number = 5,
  windowMs: number = 60 * 60 * 1000
): {
  limited: boolean;
  message?: string;
  remainingAttempts?: number;
  resetTimeSeconds?: number;
} => {
  const key = `${operationType}:${email}`;

  if (isRateLimited(key, maxAttempts, windowMs)) {
    const resetTimeSeconds = getResetTimeInSeconds(key, windowMs);
    const remainingAttempts = getRemainingAttempts(key, maxAttempts, windowMs);

    return {
      limited: true,
      message: `Too many ${operationType} requests. Please try again in ${resetTimeSeconds} seconds.`,
      remainingAttempts,
      resetTimeSeconds,
    };
  }

  return { limited: false };
};

/**
 * 發送激活郵件並處理失敗
 * @param email - 用戶郵箱
 * @param token - 激活 token
 * @param name - 用戶名稱
 * @returns 郵件發送結果
 */
export const sendActivationEmailSafely = async (
  email: string,
  token: string,
  name?: string
): Promise<EmailSendResult> => {
  try {
    const emailSent = await emailService.sendActivationEmail(email, token, name);

    if (!emailSent) {
      // 郵件發送失敗，但保留用戶
      return {
        success: false,
        message:
          'User registered successfully, but failed to send activation email. Please check your email or request a new activation link.',
        shouldRollback: false, // 不回滾，保留用戶
      };
    }

    return {
      success: true,
      message: 'Activation email sent successfully',
      shouldRollback: false,
    };
  } catch (error) {
    console.error('Send activation email error:', error);
    return {
      success: false,
      message:
        'User registered successfully, but failed to send activation email. Please request a new activation link.',
      shouldRollback: false, // 不回滾，保留用戶
    };
  }
};

/**
 * 發送密碼重置郵件並處理失敗
 * @param email - 用戶郵箱
 * @param token - 重置 token
 * @returns 郵件發送結果
 */
export const sendPasswordResetEmailSafely = async (
  email: string,
  token: string
): Promise<EmailSendResult> => {
  try {
    const emailSent = await emailService.sendPasswordResetEmail(email, token);

    if (!emailSent) {
      return {
        success: false,
        message: 'Failed to send password reset email. Please try again later.',
        shouldRollback: false,
      };
    }

    return {
      success: true,
      message: 'Password reset email sent successfully',
      shouldRollback: false,
    };
  } catch (error) {
    console.error('Send password reset email error:', error);
    return {
      success: false,
      message: 'Failed to send password reset email. Please try again later.',
      shouldRollback: false,
    };
  }
};

/**
 * 返回速率限制錯誤響應
 */
export const sendRateLimitResponse = (
  res: Response,
  email: string,
  operationType: EmailOperationType,
  maxAttempts: number = 5,
  windowMs: number = 60 * 60 * 1000
): void => {
  const rateLimitCheck = checkEmailRateLimit(email, operationType, maxAttempts, windowMs);

  if (rateLimitCheck.limited) {
    res.status(429).json({
      success: false,
      message: rateLimitCheck.message,
      retryAfter: rateLimitCheck.resetTimeSeconds,
    });
  }
};

/**
 * 返回郵件失敗但用戶保留的響應
 */
export const sendEmailFailureResponse = (
  res: Response,
  statusCode: number,
  result: EmailSendResult
): void => {
  res.status(statusCode).json({
    success: result.success,
    message: result.message,
  });
};
