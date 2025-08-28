import type {
  ActivationData,
  ChangePasswordData,
  EditProfileData,
  ForgotPasswordData,
  RegisterData,
  ResendActivationData,
  ResetPasswordData,
} from '@/types/user';

import instance from '@/utils/request';

interface RegisterPayload {
  email: string;
  password: string;
  confirm_password: string;
}

interface ChangePasswordPayload {
  old_password: string;
  new_password: string;
  new_confirm_password: string;
}

interface ResetPasswordPayload {
  new_password: string;
  new_confirm_password: string;
  token: string;
  uid: string;
}

export const usersApi = {
  // 註冊
  register(data: RegisterData) {
    const { email, password, confirmPassword } = data;

    const payload: RegisterPayload = {
      email,
      password,
      confirm_password: confirmPassword,
    };

    return instance.post('/users/', payload);
  },

  // 帳戶激活
  activateAccount(data: ActivationData) {
    return instance.post('/users/activation/', data);
  },

  // 重發激活郵件
  resendActivation(data: ResendActivationData) {
    return instance.post('/users/activation/resend/', data);
  },

  // 要求重置密碼
  forgotPassword(data: ForgotPasswordData) {
    return instance.post('/users/reset-password/', data);
  },

  // 重置密碼(忘記密碼)
  resetPassword(data: ResetPasswordData) {
    const { newPassword, newConfirmPassword, token, uid } = data;

    const payload: ResetPasswordPayload = {
      new_password: newPassword,
      new_confirm_password: newConfirmPassword,
      token,
      uid,
    };

    return instance.patch('/users/reset-password/confirm/', payload);
  },

  // 更改密碼(知道密碼)
  changePassword(data: ChangePasswordData) {
    const { oldPassword, newPassword, newConfirmPassword } = data;

    const payload: ChangePasswordPayload = {
      old_password: oldPassword,
      new_password: newPassword,
      new_confirm_password: newConfirmPassword,
    };

    return instance.put('/users/change-password/', payload);
  },

  // 取得個人資料
  getUserProfile() {
    return instance.get('/users/profile/');
  },

  // 更新個人資料
  updateUserProfile(data: EditProfileData) {
    return instance.put('/users/profile/', data);
  },
};
