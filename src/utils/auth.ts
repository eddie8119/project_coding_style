import { jwtDecode } from 'jwt-decode';

// ========== Token Utilities ==========
const ACCESS_TOKEN_KEY = 'access_token';
const REFRESH_TOKEN_KEY = 'refresh_token';
const ACCESS_ROLE_KEY = 'access_role';

export const getAccessToken = () => localStorage.getItem(ACCESS_TOKEN_KEY);
export const getRefreshToken = () => localStorage.getItem(REFRESH_TOKEN_KEY);

export const setAccessToken = (token: string) => {
  localStorage.setItem(ACCESS_TOKEN_KEY, token);
};
export const setRefreshToken = (token: string) => {
  localStorage.setItem(REFRESH_TOKEN_KEY, token);
};

export const clearTokens = () => {
  localStorage.removeItem(ACCESS_TOKEN_KEY);
  localStorage.removeItem(REFRESH_TOKEN_KEY);
  localStorage.removeItem(ACCESS_ROLE_KEY);
};

// ========== Token Validation ==========
interface JWTPayload {
  exp: number;
  iat?: number;
  [key: string]: unknown;
}

/**
 * 檢查 token 是否過期
 * @param token JWT token
 * @returns true 表示 token 有效，false 表示過期或無效
 */
export const isTokenValid = (token: string | null): boolean => {
  if (!token) return false;

  try {
    const decoded = jwtDecode<JWTPayload>(token);
    const currentTime = Date.now() / 1000; // 轉換為秒

    // 檢查 token 是否過期（留 10 秒緩衝時間）
    return decoded.exp > currentTime + 10;
  } catch (error) {
    console.error('Token validation failed:', error);
    return false;
  }
};

// 檢查當前的 access token 是否有效
export const isAccessTokenValid = (): boolean => {
  const token = getAccessToken();
  return isTokenValid(token);
};

// 檢查當前的 refresh token 是否有效
export const isRefreshTokenValid = (): boolean => {
  const token = getRefreshToken();
  return isTokenValid(token);
};

// ========== Role Utilities ==========
export const getAccessRole = () => localStorage.getItem(ACCESS_ROLE_KEY);
export const setAccessRole = (role: string) => localStorage.setItem(ACCESS_ROLE_KEY, role);
export const isAdmin = () => getAccessRole() === 'admin';
