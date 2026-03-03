// import { Request, Response } from 'express';
// import snakecaseKeys from 'snakecase-keys';

// import { supabase } from '@/lib/supabase';
// import { emailService } from '@/services/notification/email.service';
// import {
//   checkEmailRateLimit,
//   sendActivationEmailSafely,
//   sendPasswordResetEmailSafely,
//   EmailOperationType,
// } from '@/utils/emailHelper';
// import {
//   extractTokenFromActionLink,
//   rollbackUserRegistration,
//   validatePasswordChange,
//   validateRegistrationInput,
//   generateSecureRandomPassword,
// } from '@/utils/userValidation';

// export const register = async (req: Request, res: Response) => {
//   try {
//     const snakeCaseData = snakecaseKeys(req.body, { deep: true });
//     const { email, password, name } = snakeCaseData;

//     // 驗證輸入
//     const validation = validateRegistrationInput(email, password, name);
//     if (!validation.valid) {
//       return res.status(400).json({
//         success: false,
//         message: validation.error,
//       });
//     }

//     // 使用 admin client 建立使用者，不自動確認郵件
//     const { data: authData, error: signUpError } = await supabase.auth.admin.createUser({
//       email,
//       password,
//       email_confirm: false, // 需要驗證
//     });

//     if (signUpError || !authData.user) {
//       // 檢查是否因為 email 已存在而失敗
//       if (signUpError?.message.includes('already exists')) {
//         return res.status(409).json({
//           success: false,
//           message: 'User with this email already exists',
//         });
//       }
//       return res.status(400).json({
//         success: false,
//         message: signUpError?.message || 'Failed to register user',
//       });
//     }

//     // 在 Profiles 資料表中新增對應的 profile
//     const { data: userDoc, error: docError } = await supabase
//       .from('Profiles')
//       .insert([{ id: authData.user.id, email, name }])
//       .select()
//       .maybeSingle();

//     if (docError) {
//       // 如果 profile 建立失敗，刪除創建的 auth user 以保持資料一致性
//       await rollbackUserRegistration(authData.user.id);
//       return res.status(500).json({
//         success: false,
//         message: `Failed to create user profile: ${docError.message}`,
//       });
//     }

//     // 產生激活 token
//     const { data: linkData, error: linkError } = await supabase.auth.admin.generateLink({
//       type: 'signup',
//       email,
//       password,
//     });

//     if (linkError || !linkData.properties?.action_link) {
//       console.error('Generate activation link error:', linkError);
//       // 如果產生 token 失敗，刪除已建立的資料
//       await rollbackUserRegistration(authData.user.id);
//       return res.status(500).json({
//         success: false,
//         message: 'Failed to generate activation link',
//       });
//     }

//     // 從 action_link 中提取 token
//     const actionLink = linkData.properties.action_link;
//     const token = extractTokenFromActionLink(actionLink);

//     if (!token) {
//       await rollbackUserRegistration(authData.user.id);
//       return res.status(500).json({
//         success: false,
//         message: 'Failed to extract activation token',
//       });
//     }

//     // 檢查速率限制
//     const rateLimitCheck = checkEmailRateLimit(email, EmailOperationType.ACTIVATION);
//     if (rateLimitCheck.limited) {
//       await rollbackUserRegistration(authData.user.id);
//       return res.status(429).json({
//         success: false,
//         message: rateLimitCheck.message,
//         retryAfter: rateLimitCheck.resetTimeSeconds,
//       });
//     }

//     // 發送激活郵件（安全版本，失敗不刪除用戶）
//     const emailResult = await sendActivationEmailSafely(email, token, name);

//     // 即使郵件失敗，也返回 201（用戶已創建）
//     res.status(201).json({
//       success: emailResult.success,
//       data: {
//         user: {
//           id: authData.user.id,
//           email: authData.user.email,
//           createdAt: authData.user.created_at,
//         },
//         userDoc,
//       },
//       message: emailResult.message,
//     });
//   } catch (error) {
//     console.error('Register error:', error);
//     res.status(500).json({
//       success: false,
//       message: 'Registration failed due to an unexpected error.',
//     });
//   }
// };

// // 獲取當前用戶信息
// export const getCurrentUser = async (req: Request, res: Response) => {
//   try {
//     // authMiddleware 已經驗證並附加 req.user
//     const user = req.user!; // middleware 已驗證，使用 ! 斷言

//     const { data: userDoc } = await supabase
//       .from('Profiles')
//       .select('*')
//       .eq('id', user.id)
//       .maybeSingle();

//     res.json({
//       success: true,
//       data: {
//         user: {
//           id: user.id,
//           email: user.email,
//           name: user.name || null,
//         },
//         userDoc,
//       },
//     });
//   } catch (error) {
//     console.error('Get current user error:', error);
//     res.status(500).json({
//       success: false,
//       message: 'Failed to get user information',
//     });
//   }
// };

// // 更新用戶信息 (僅限本人)
// export const updateUser = async (req: Request, res: Response) => {
//   try {
//     const user = req.user!;

//     const snakeCaseData = snakecaseKeys(req.body, { deep: true });

//     const { password, email, ...safeUpdates } = snakeCaseData;

//     const { data: updatedUserDoc, error: updateError } = await supabase
//       .from('Profiles')
//       .update(safeUpdates)
//       .eq('id', user.id) // 使用 middleware 提供的 user.id 確保安全性
//       .select()
//       .maybeSingle();

//     if (updateError) {
//       return res.status(400).json({ success: false, message: updateError.message });
//     }

//     res.json({
//       success: true,
//       data: { userDoc: updatedUserDoc },
//       message: 'User updated successfully',
//     });
//   } catch (error) {
//     console.error('Update user error:', error);
//     res.status(500).json({
//       success: false,
//       message: 'Failed to update user',
//     });
//   }
// };

// // 刪除用戶 (僅限本人)
// export const deleteUser = async (req: Request, res: Response) => {
//   try {
//     const user = req.user!;
//     const userId = user.id;

//     // 1. 刪除 Supabase Auth user (這會觸發級聯刪除 Profiles 表中的對應資料，如果已設定)
//     const { error: deleteAuthError } = await supabase.auth.admin.deleteUser(userId);

//     if (deleteAuthError) {
//       // 如果 Auth user 刪除失敗，就不繼續刪 profile
//       return res.status(500).json({ success: false, message: deleteAuthError.message });
//     }

//     // 2. 刪除 profile table 中的資料 (如果沒有設定級聯刪除，則需要手動刪除)
//     const { error: docError } = await supabase.from('Profiles').delete().eq('id', userId);

//     if (docError) {
//       // Log the detailed error for debugging
//       console.error(
//         `Profile deletion error for user ${userId} after auth user deletion:`,
//         docError
//       );
//       // 注意：此時 Auth user 已被刪除，但 profile 刪除失敗，需要手動處理
//       return res.status(500).json({
//         success: false,
//         message: `Auth user deleted, but failed to delete profile: ${docError.message}`,
//       });
//     }

//     res.json({
//       success: true,
//       message: 'User deleted successfully',
//     });
//   } catch (error) {
//     console.error('Delete user error:', error);
//     res.status(500).json({
//       success: false,
//       message: 'Failed to delete user',
//     });
//   }
// };

// // 檢查用戶是否存在 (公開)
// export const checkUserExists = async (req: Request, res: Response) => {
//   try {
//     const { email } = req.params;
//     if (!email) {
//       return res.status(400).json({ success: false, message: 'Email is required' });
//     }

//     // 改為查詢 public.Profiles 資料表，這是更可靠且型別安全的方法
//     const { data, error } = await supabase
//       .from('Profiles')
//       .select('id')
//       .eq('email', email)
//       .maybeSingle();

//     if (error) {
//       // 如果查詢出錯，不應該讓客戶端知道詳細信息
//       console.error('Check user exists query error:', error);
//       return res.status(500).json({ success: false, message: 'Error checking user existence.' });
//     }

//     res.json({
//       success: true,
//       data: {
//         exists: data !== null, // 如果能找到資料 (不為 null)，代表使用者存在
//       },
//     });
//   } catch (error) {
//     console.error('Check user exists error:', error);
//     res.status(500).json({
//       success: false,
//       message: 'Failed to check user existence',
//     });
//   }
// };

// // 要求重置密碼 (忘記密碼 - 發送重置郵件)
// export const forgotPassword = async (req: Request, res: Response) => {
//   try {
//     const { email } = req.body;

//     if (!email) {
//       return res.status(400).json({
//         success: false,
//         message: 'Email is required',
//       });
//     }

//     // 檢查速率限制
//     const rateLimitCheck = checkEmailRateLimit(email, EmailOperationType.PASSWORD_RESET, 5, 60 * 60 * 1000);
//     if (rateLimitCheck.limited) {
//       return res.status(429).json({
//         success: false,
//         message: rateLimitCheck.message,
//         retryAfter: rateLimitCheck.resetTimeSeconds,
//       });
//     }

//     // 檢查用戶是否存在
//     const { data: userProfile } = await supabase
//       .from('Profiles')
//       .select('id')
//       .eq('email', email)
//       .maybeSingle();

//     // 為了安全，即使用戶不存在也返回成功（防止郵箱枚舉攻擊）
//     if (!userProfile) {
//       return res.json({
//         success: true,
//         message: 'If the email exists, a password reset link has been sent',
//       });
//     }

//     // 使用 Supabase 生成重置 token
//     const { data, error } = await supabase.auth.admin.generateLink({
//       type: 'recovery',
//       email,
//     });

//     if (error || !data.properties?.action_link) {
//       console.error('Generate reset link error:', error);
//       return res.status(500).json({
//         success: false,
//         message: 'Failed to generate reset link',
//       });
//     }

//     // 從 action_link 中提取 token
//     const actionLink = data.properties.action_link;
//     const token = extractTokenFromActionLink(actionLink);

//     if (!token) {
//       return res.status(500).json({
//         success: false,
//         message: 'Failed to extract reset token',
//       });
//     }

//     // 發送郵件（安全版本）
//     const emailResult = await sendPasswordResetEmailSafely(email, token);

//     // 即使郵件失敗，也返回成功（防止郵箱枚舉）
//     res.json({
//       success: true,
//       message: emailResult.message,
//     });
//   } catch (error) {
//     console.error('Forgot password error:', error);
//     res.status(500).json({
//       success: false,
//       message: 'Failed to send password reset email',
//     });
//   }
// };

// // 重置密碼 (忘記密碼 - 使用重置連結)
// export const resetPassword = async (req: Request, res: Response) => {
//   try {
//     const { newPassword, newConfirmPassword, token } = req.body;

//     if (!token) {
//       return res.status(400).json({
//         success: false,
//         message: 'Token is required',
//       });
//     }

//     // 驗證密碼
//     const validation = validatePasswordChange(newPassword, newConfirmPassword);
//     if (!validation.valid) {
//       return res.status(400).json({
//         success: false,
//         message: validation.error,
//       });
//     }

//     // 使用 token 更新密碼
//     const { error } = await supabase.auth.updateUser({
//       password: newPassword,
//     });

//     if (error) {
//       console.error('Reset password error:', error);
//       return res.status(400).json({
//         success: false,
//         message: error.message || 'Failed to reset password',
//       });
//     }

//     res.json({
//       success: true,
//       message: 'Password reset successfully',
//     });
//   } catch (error) {
//     console.error('Reset password error:', error);
//     res.status(500).json({
//       success: false,
//       message: 'Failed to reset password',
//     });
//   }
// };

// // 更改密碼 (已登入用戶)
// export const changePassword = async (req: Request, res: Response) => {
//   try {
//     const user = req.user!;

//     const { oldPassword, newPassword, newConfirmPassword } = req.body;

//     if (!oldPassword) {
//       return res.status(400).json({
//         success: false,
//         message: 'Old password is required',
//       });
//     }

//     // 驗證新密碼
//     const validation = validatePasswordChange(newPassword, newConfirmPassword);
//     if (!validation.valid) {
//       return res.status(400).json({
//         success: false,
//         message: validation.error,
//       });
//     }

//     // 驗證舊密碼 - 嘗試用舊密碼登入
//     const { error: signInError } = await supabase.auth.signInWithPassword({
//       email: user.email,
//       password: oldPassword,
//     });

//     if (signInError) {
//       return res.status(400).json({
//         success: false,
//         message: 'Old password is incorrect',
//       });
//     }

//     // 更新密碼
//     const { error: updateError } = await supabase.auth.updateUser({
//       password: newPassword,
//     });

//     if (updateError) {
//       console.error('Change password error:', updateError);
//       return res.status(400).json({
//         success: false,
//         message: updateError.message || 'Failed to change password',
//       });
//     }

//     // 發送密碼更改成功通知郵件
//     await emailService.sendPasswordChangedNotification(user.email);

//     res.json({
//       success: true,
//       message: 'Password changed successfully',
//     });
//   } catch (error) {
//     console.error('Change password error:', error);
//     res.status(500).json({
//       success: false,
//       message: 'Failed to change password',
//     });
//   }
// };

// // 激活帳戶 (驗證郵件)
// export const activateAccount = async (req: Request, res: Response) => {
//   try {
//     const { token } = req.body;

//     if (!token) {
//       return res.status(400).json({
//         success: false,
//         message: 'Activation token is required',
//       });
//     }

//     // 使用 token 驗證郵件
//     const { data, error } = await supabase.auth.verifyOtp({
//       type: 'signup',
//       token,
//       email: req.body.email,
//     });

//     if (error || !data.user) {
//       console.error('Email verification error:', error);
//       return res.status(400).json({
//         success: false,
//         message: error?.message || 'Invalid or expired activation token',
//       });
//     }

//     // 驗證成功了，註戶已激活
//     res.json({
//       success: true,
//       data: {
//         user: {
//           id: data.user.id,
//           email: data.user.email,
//         },
//       },
//       message: 'Email verified successfully. Your account is now active.',
//     });
//   } catch (error) {
//     console.error('Activate account error:', error);
//     res.status(500).json({
//       success: false,
//       message: 'Failed to activate account',
//     });
//   }
// };

// // 重新發送激活郵件
// export const resendActivation = async (req: Request, res: Response) => {
//   try {
//     const { email } = req.body;

//     if (!email) {
//       return res.status(400).json({
//         success: false,
//         message: 'Email is required',
//       });
//     }

//     // 檢查速率限制
//     const rateLimitCheck = checkEmailRateLimit(email, EmailOperationType.ACTIVATION, 3, 60 * 60 * 1000);
//     if (rateLimitCheck.limited) {
//       return res.status(429).json({
//         success: false,
//         message: rateLimitCheck.message,
//         retryAfter: rateLimitCheck.resetTimeSeconds,
//       });
//     }

//     // 檢查用戶是否存在
//     const { data: userProfile } = await supabase
//       .from('Profiles')
//       .select('id')
//       .eq('email', email)
//       .maybeSingle();

//     if (!userProfile) {
//       return res.json({
//         success: true,
//         message: 'If the email exists, a new activation link has been sent',
//       });
//     }

//     // 產生新的激活 token
//     const { data: linkData, error: linkError } = await supabase.auth.admin.generateLink({
//       type: 'signup',
//       email,
//       password: generateSecureRandomPassword(),
//     });

//     if (linkError || !linkData.properties?.action_link) {
//       console.error('Generate activation link error:', linkError);
//       return res.status(500).json({
//         success: false,
//         message: 'Failed to generate activation link',
//       });
//     }

//     // 從 action_link 中提取 token
//     const actionLink = linkData.properties.action_link;
//     const token = extractTokenFromActionLink(actionLink);

//     if (!token) {
//       return res.status(500).json({
//         success: false,
//         message: 'Failed to extract activation token',
//       });
//     }

//     // 發送激活郵件（安全版本）
//     const emailResult = await sendActivationEmailSafely(email, token);

//     // 即使郵件失敗，也返回成功
//     res.json({
//       success: true,
//       message: emailResult.message,
//     });
//   } catch (error) {
//     console.error('Resend activation error:', error);
//     res.status(500).json({
//       success: false,
//       message: 'Failed to resend activation email',
//     });
//   }
// };
