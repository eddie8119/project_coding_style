/**
 * 清除專案相關的 localStorage 工具函數
 */
import { PROJECT_STORAGE_PREFIX } from './projectStorage';

/**
 * 清除所有與專案相關的 localStorage 數據
 * 這個函數會掃描所有 localStorage 項目，並刪除所有以專案前綴開頭的項目
 */
export function clearAllProjectLocalStorage(): void {
  try {
    const keysToRemove: string[] = [];

    // 掃描所有 localStorage 項目
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith(PROJECT_STORAGE_PREFIX)) {
        keysToRemove.push(key);
      }
    }

    // 刪除所有找到的項目
    keysToRemove.forEach((key) => {
      localStorage.removeItem(key);
    });
  } catch (error) {
    console.error('清除專案 localStorage 時發生錯誤:', error);
  }
}

/**
 * 設置頁面關閉時清除所有專案 localStorage 的事件處理器
 */
export function setupClearLocalStorageOnUnload(): void {
  window.addEventListener('beforeunload', () => {
    clearAllProjectLocalStorage();
  });
}
