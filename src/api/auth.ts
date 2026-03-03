import type { SsoProvider } from '@/constants/provider';
import type { ApiResponse } from '@/types/request';
import type { AuthResponse } from '@/types/response';
import type { LoginSchema } from '@/utils/schemas/loginSchema';

import request from '@/utils/request';

export const authApi = {
  login: (data: LoginSchema): Promise<ApiResponse<AuthResponse>> => {
    return request.post('/auth/login', data);
  },
  logout: (data: { refreshToken: string }): Promise<ApiResponse<AuthResponse>> => {
    return request.post('/auth/logout', data);
  },
  ssoLogin: (provider: SsoProvider): Promise<ApiResponse<{ url: string }>> => {
    return request.post(`/auth/sso/${provider}`);
  },
  ssoCallback: (
    provider: SsoProvider,
    payload: { accessToken: string; refreshToken?: string | null }
  ): Promise<ApiResponse<AuthResponse>> => {
    return request.post(`/auth/sso/${provider}/callback`, payload);
  },
};
