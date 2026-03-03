/**
 * 統一管理圖片相關的 URL 配置
 */

const IMAGE_SERVER = 'http://localhost:5173';

/**
 * 獲取違規圖片的完整 URL
 * @param path - 圖片路徑
 * @returns 完整的圖片 URL
 */
export const getViolationImageUrl = (path: string): string => {
  // 移除路徑中的多餘斜線
  const cleanPath = path.replace(/^\/+|\/+$/g, '');
  return `${IMAGE_SERVER}/${cleanPath}`;
};
