import type { LoginSchema } from '@/utils/schemas/loginSchema';

import instance from '@/utils/request';

export const authApi = {
  login: (data: LoginSchema) => {
    return instance.post('/auth/token/login/', data);
  },
  logout: (data: { refreshToken: string }) => {
    return instance.post('/auth/token/revoke/', data);
  },
};
