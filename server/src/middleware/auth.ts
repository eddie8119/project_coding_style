import { NextFunction, Request, Response } from 'express';

import { supabase } from '@/lib/supabase';
import { getUserIdOrUnauthorized } from '@/utils/auth';

// 定義用戶接口
interface User {
  id: string;
  email: string;
  name?: string;
}

// 擴展 Express 的 Request 類型
declare global {
  namespace Express {
    interface Request {
      user?: User;
      userId?: string;
    }
  }
}

/**
 * 驗證用戶身份並將用戶信息附加到 request 對象上
 */
export const authMiddleware = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // 從請求頭中獲取 token
    const token = req.headers.authorization?.replace('Bearer ', '');

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'No authentication token provided',
      });
    }

    // 驗證 token 並獲取用戶信息
    const { data, error } = await supabase.auth.getUser(token);

    if (error || !data.user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid or expired authentication token',
      });
    }

    const { user } = data;
    // 驗證完 JWT（或 session），就會把解析出來的用戶資訊 將用戶信息附加到 request 對象上
    // 一次驗證，全程可用
    req.user = {
      id: user.id,
      email: user.email!,
      name: user.user_metadata?.name,
    };

    // 將當前請求的 JWT 設為 Supabase 認證上下文，讓後續 DB 操作在該用戶身份下執行（符合 RLS）
    // 注意：此為每請求設置，避免跨請求干擾
    try {
      // For supabase-js v2, setAuth applies the bearer token on subsequent requests
      // If your version requires setSession, switch to:
      // await supabase.auth.setSession({ access_token: token, refresh_token: '' as any });
      await (supabase as any).auth.setAuth(token);
    } catch {}

    next();
  } catch (error: any) {
    console.error('Authentication error:', error);
    return res.status(500).json({
      success: false,
      message: 'Authentication failed',
      error: error.message,
    });
  }
};

export function requireUserId(req: Request, res: Response, next: NextFunction) {
  const userId = getUserIdOrUnauthorized(req, res);
  if (!userId) return; // 已經回應 401
  // 可以掛到 req 上，讓後續 handler 直接用
  (req as any).userId = userId;
  next();
}
