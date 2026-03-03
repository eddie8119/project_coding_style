/**
 * localStorage 相關工具函數
 */

/**
 * 從 localStorage 獲取數據
 * @param key localStorage 的鍵名
 * @returns 解析後的數據，如果不存在或解析失敗則返回 null
 */
export function getFromLocalStorage<T>(key: string): T | null {
  try {
    const data = localStorage.getItem(key);
    if (!data) return null;
    return JSON.parse(data) as T;
  } catch (e) {
    console.error('從 localStorage 獲取數據失敗:', e);
    return null;
  }
}

/**
 * 保存數據到 localStorage
 * @param key localStorage 的鍵名
 * @param data 要保存的數據
 */
export function saveToLocalStorage<T>(key: string, data: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (e) {
    console.error('保存數據到 localStorage 失敗:', e);
  }
}

/**
 * 從 localStorage 中移除數據
 * @param key localStorage 的鍵名
 */
export function removeFromLocalStorage(key: string): void {
  try {
    localStorage.removeItem(key);
  } catch (e) {
    console.error('從 localStorage 移除數據失敗:', e);
  }
}

/**
 * 檢查 localStorage 中是否存在指定鍵名的數據
 * @param key localStorage 的鍵名
 * @returns 是否存在
 */
export function existsInLocalStorage(key: string): boolean {
  return localStorage.getItem(key) !== null;
}
