import { Request, Response } from 'express';

import { supabase } from '@/lib/supabase';
import { RegisterSnakeBody, ProfileUpdateSnakeBody } from '@/types/requestBody';
import { pickSnakeBody } from '@/utils/bodyTransform';
import { AppError, handleControllerError } from '@/utils/controllerError';
import { sanitizeAndCamelcase } from '@/utils/formatters';
import {
  rollbackUserRegistration,
  validatePasswordChange,
  validateRegistrationInput,
} from '@/utils/userValidation';

const REGISTER_FIELDS = [
  'email',
  'password',
  'name',
] as const satisfies readonly (keyof RegisterSnakeBody & string)[];

const PROFILE_UPDATE_FIELDS = [
  'name',
  'phone_number',
  'company',
] as const satisfies readonly (keyof ProfileUpdateSnakeBody & string)[];

export const register = async (req: Request, res: Response) => {
  try {
    const { email, password, name } = pickSnakeBody<RegisterSnakeBody>(req, [...REGISTER_FIELDS]);

    if (!email || !password || !name) {
      throw new AppError('Email, password, and name are required', {
        statusCode: 400,
        code: 'REGISTRATION_MISSING_FIELDS',
      });
    }

    // 驗證輸入
    const validation = validateRegistrationInput(email, password, name);
    if (!validation.valid) {
      throw new AppError(validation.error ?? 'Invalid registration input', {
        statusCode: 400,
        code: 'REGISTRATION_INVALID_INPUT',
      });
    }

    // 使用 admin client 建立使用者
    const { data: authData, error: signUpError } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: false, // 需要驗證
      user_metadata: { name },
    });

    if (signUpError || !authData.user) {
      if (signUpError?.message.includes('already exists')) {
        throw new AppError('User with this email already exists', {
          statusCode: 409,
          code: 'USER_ALREADY_EXISTS',
        });
      }
      throw new AppError(signUpError?.message || 'Failed to register user', {
        statusCode: 400,
        code: 'REGISTRATION_FAILED',
        detail: signUpError?.message,
      });
    }

    // 在 Profiles 資料表中新增對應的 profile
    const { data: userDoc, error: docError } = await supabase
      .from('Profiles')
      .insert([{ id: authData.user.id, email, name }])
      .select()
      .maybeSingle();

    if (docError) {
      await rollbackUserRegistration(authData.user.id);
      throw new AppError(`Failed to create user profile: ${docError.message}`, {
        statusCode: 500,
        code: 'PROFILE_CREATE_FAILED',
        detail: docError.message,
        exposeError: true,
      });
    }

    // 使用 Supabase 內建模板發送啟用郵件
    const redirectTo = `${process.env.CLIENT_URL}/auth/account-activation`;
    const { error: emailError } = await supabase.auth.admin.inviteUserByEmail(email, {
      redirectTo,
    });

    const emailSent = !emailError;

    if (emailError) {
      console.warn(`[register] Failed to send invitation email to ${email}:`, emailError);
    }

    res.status(201).json({
      success: true,
      data: {
        userDoc: sanitizeAndCamelcase(userDoc),
        emailSent, // 告訊前端郵件是否成功
      },
      message: emailSent
        ? 'User registered successfully. Please check your email to activate your account.'
        : 'User registered successfully, but failed to send activation email. Please check your email or request a new activation link.',
    });
  } catch (error: unknown) {
    return handleControllerError(res, error, 'Register error');
  }
};

// 獲取當前用戶信息
export const getCurrentUser = async (req: Request, res: Response) => {
  try {
    const user = req.user!;

    const { data: userDoc, error } = await supabase
      .from('Profiles')
      .select('*')
      .eq('id', user.id)
      .maybeSingle();

    if (error) {
      throw new AppError('Failed to get user information', {
        statusCode: 500,
        code: 'GET_USER_FAILED',
        detail: error.message,
        exposeError: true,
      });
    }

    res.json({
      success: true,
      data: {
        userDoc: sanitizeAndCamelcase(userDoc),
      },
    });
  } catch (error: unknown) {
    return handleControllerError(res, error, 'Get current user error');
  }
};

// 更新用戶信息 (僅限本人)
export const updateUser = async (req: Request, res: Response) => {
  try {
    const user = req.user!;

    const safeUpdates = pickSnakeBody<ProfileUpdateSnakeBody>(req, [...PROFILE_UPDATE_FIELDS]);

    const { data: updatedUserDoc, error: updateError } = await supabase
      .from('Profiles')
      .update(safeUpdates)
      .eq('id', user.id) // 使用 middleware 提供的 user.id 確保安全性
      .select()
      .maybeSingle();

    if (updateError) {
      throw new AppError(updateError.message || 'Failed to update user', {
        statusCode: 400,
        code: 'USER_UPDATE_FAILED',
        detail: updateError.message,
      });
    }

    // 注意：若有更新名稱，前端應負責使用 supabase.auth.updateUser 來同步至 Supabase Auth user_metadata

    res.json({
      success: true,
      data: { userDoc: sanitizeAndCamelcase(updatedUserDoc) },
      message: 'User updated successfully',
    });
  } catch (error: unknown) {
    return handleControllerError(res, error, 'Update user error');
  }
};

// 刪除用戶 (僅限本人)
export const deleteUser = async (req: Request, res: Response) => {
  try {
    const user = req.user!;
    const userId = user.id;

    // 1. 刪除 Supabase Auth user (這會觸發級聯刪除 Profiles 表中的對應資料，如果已設定)
    const { error: deleteAuthError } = await supabase.auth.admin.deleteUser(userId);

    if (deleteAuthError) {
      throw new AppError(deleteAuthError.message || 'Failed to delete auth user', {
        statusCode: 500,
        code: 'AUTH_USER_DELETE_FAILED',
        detail: deleteAuthError.message,
        exposeError: true,
      });
    }

    // 2. 刪除 profile table 中的資料 (如果沒有設定級聯刪除，則需要手動刪除)
    const { error: docError } = await supabase.from('Profiles').delete().eq('id', userId);

    if (docError) {
      console.error(
        `Profile deletion error for user ${userId} after auth user deletion:`,
        docError
      );
      throw new AppError(`Auth user deleted, but failed to delete profile: ${docError.message}`, {
        statusCode: 500,
        code: 'PROFILE_DELETE_FAILED',
        detail: docError.message,
        exposeError: true,
      });
    }

    res.json({
      success: true,
      message: 'User deleted successfully',
    });
  } catch (error: unknown) {
    return handleControllerError(res, error, 'Delete user error');
  }
};

// 檢查用戶是否存在 (公開)
export const checkUserExists = async (req: Request, res: Response) => {
  try {
    const { email } = req.params;
    if (!email) {
      throw new AppError('Email is required', {
        statusCode: 400,
        code: 'EMAIL_REQUIRED',
      });
    }

    // 改為查詢 public.Profiles 資料表，這是更可靠且型別安全的方法
    const { data, error } = await supabase
      .from('Profiles')
      .select('id')
      .eq('email', email)
      .maybeSingle();

    if (error) {
      console.error('Check user exists query error:', error);
      throw new AppError('Error checking user existence.', {
        statusCode: 500,
        code: 'CHECK_USER_EXISTS_FAILED',
        detail: error.message,
        exposeError: true,
      });
    }

    res.json({
      success: true,
      data: {
        exists: data !== null, // 如果能找到資料 (不為 null)，代表使用者存在
      },
    });
  } catch (error: unknown) {
    return handleControllerError(res, error, 'Check user exists error');
  }
};

// 要求重置密碼 (忘記密碼 - 發送重置郵件)
export const forgotPassword = async (req: Request, res: Response) => {
  try {
    const { email } = req.body;

    if (!email) {
      throw new AppError('Email is required', {
        statusCode: 400,
        code: 'EMAIL_REQUIRED',
      });
    }

    // 使用 Supabase 內建的重置密碼流程
    // 由 Supabase 直接寄出郵件（使用 Dashboard 設定的模板）
    const redirectTo = `${process.env.CLIENT_URL}/auth/reset-password`;
    const { error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo });

    // 為了安全，即使出錯也返回成功（防止郵箱枚舉攻擊）
    if (error) {
      console.error('resetPasswordForEmail error:', error);
    }

    return res.json({
      success: true,
      message: 'If the email exists, a password reset link has been sent',
    });
  } catch (error: unknown) {
    return handleControllerError(res, error, 'Forgot password error');
  }
};

// 重置密碼 (忘記密碼 - 使用重置連結)
// 重置密碼 (忘記密碼 - 使用重置連結)
// 注意：此端點預期在用戶點擊郵件中的重置連結後，由前端在已驗證的 session 中呼叫
export const resetPassword = async (req: Request, res: Response) => {
  try {
    const { newPassword, newConfirmPassword } = req.body;

    // 驗證密碼
    const validation = validatePasswordChange(newPassword, newConfirmPassword);
    if (!validation.valid) {
      throw new AppError(validation.error ?? 'Invalid password input', {
        statusCode: 400,
        code: 'PASSWORD_VALIDATION_FAILED',
      });
    }

    // 使用從 'req.user' 來的 session 更新密碼，而不是 Admin API
    // 這需要前端在用戶點擊重置連結後，確保 Supabase client 處於已驗證狀態
    const { error } = await supabase.auth.updateUser({ password: newPassword });

    if (error) {
      console.error('Reset password error:', error);
      throw new AppError(error.message || 'Failed to reset password. The link may have expired.', {
        statusCode: 400,
        code: 'RESET_PASSWORD_FAILED',
        detail: error.message,
      });
    }

    res.json({
      success: true,
      message: 'Password reset successfully',
    });
  } catch (error: unknown) {
    return handleControllerError(res, error, 'Reset password error');
  }
};

// 更改密碼 (已登入用戶)
export const changePassword = async (req: Request, res: Response) => {
  try {
    const user = req.user!;

    const { oldPassword, newPassword, newConfirmPassword } = req.body;

    if (!oldPassword) {
      throw new AppError('Old password is required', {
        statusCode: 400,
        code: 'OLD_PASSWORD_REQUIRED',
      });
    }

    // 驗證新密碼
    const validation = validatePasswordChange(newPassword, newConfirmPassword);
    if (!validation.valid) {
      return res.status(400).json({
        success: false,
        message: validation.error,
      });
    }

    // 驗證舊密碼 - 嘗試用舊密碼登入
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: user.email,
      password: oldPassword,
    });

    if (signInError) {
      throw new AppError('Old password is incorrect', {
        statusCode: 400,
        code: 'OLD_PASSWORD_INCORRECT',
        detail: signInError.message,
      });
    }

    // 更新密碼
    const { error: updateError } = await supabase.auth.updateUser({
      password: newPassword,
    });

    if (updateError) {
      console.error('Change password error:', updateError);
      throw new AppError(updateError.message || 'Failed to change password', {
        statusCode: 400,
        code: 'CHANGE_PASSWORD_FAILED',
        detail: updateError.message,
      });
    }

    // Supabase 會自動發送密碼更改通知郵件
    res.json({
      success: true,
      message: 'Password changed successfully',
    });
  } catch (error: unknown) {
    return handleControllerError(res, error, 'Change password error');
  }
};

// 激活帳戶 (驗證郵件)
export const activateAccount = async (req: Request, res: Response) => {
  try {
    const { token } = req.body;

    if (!token) {
      throw new AppError('Activation token is required', {
        statusCode: 400,
        code: 'ACTIVATION_TOKEN_REQUIRED',
      });
    }

    // 使用 token 驗證郵件
    const { data, error } = await supabase.auth.verifyOtp({
      type: 'signup',
      token,
      email: req.body.email,
    });

    if (error || !data.user) {
      console.error('Email verification error:', error);
      throw new AppError(error?.message || 'Invalid or expired activation token', {
        statusCode: 400,
        code: 'ACTIVATION_FAILED',
        detail: error?.message,
      });
    }

    // 驗證成功了，註戶已激活
    res.json({
      success: true,
      data: {
        user: {
          id: data.user.id,
          email: data.user.email,
        },
      },
      message: 'Email verified successfully. Your account is now active.',
    });
  } catch (error: unknown) {
    return handleControllerError(res, error, 'Activate account error');
  }
};

// 重新發送激活郵件
export const resendActivation = async (req: Request, res: Response) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Email is required',
      });
    }

    // 檢查用戶是否存在
    const { data: userProfile } = await supabase
      .from('Profiles')
      .select('id')
      .eq('email', email)
      .maybeSingle();

    if (!userProfile) {
      return res.json({
        success: true,
        message: 'If the email exists, a new activation link has been sent',
      });
    }

    // 使用 Supabase 內建郵件模板發送驗證郵件
    const redirectTo = `${process.env.CLIENT_URL || 'http://localhost:5173'}/auth/account-activation`;

    const { error: emailError } = await supabase.auth.admin.inviteUserByEmail(email, {
      redirectTo,
    });

    const emailSent = !emailError;

    if (emailError) {
      console.warn(`[resendActivation] Failed to send invitation email to ${email}:`, emailError);
    }

    res.json({
      success: true,
      message: emailSent
        ? 'Activation email sent successfully'
        : 'If the email exists, a new activation link has been sent',
    });
  } catch (error: unknown) {
    return handleControllerError(res, error, 'Resend activation error');
  }
};
