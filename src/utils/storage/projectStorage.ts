/**
 * 專案數據管理工具函數
 */
import { ref } from 'vue';

import { getFromLocalStorage, saveToLocalStorage } from './localStorage';

import type { Ref } from 'vue';

export const PROJECT_STORAGE_PREFIX = 'project_';

/**
 * 獲取專案的本地存儲鍵名
 * @param projectId 專案ID
 */
export function getProjectStorageKey(projectId: string): string {
  return `${PROJECT_STORAGE_PREFIX}${projectId}`;
}

/**
 * 初始化專案本地數據
 * @param projectId 專案ID
 * @param fetchedProject API 獲取的專案數據
 * @returns 本地專案數據的 ref
 */
export function initProjectLocalStorage<T>(projectId: string, fetchedProject: T): Ref<T> {
  const localProject = ref<T>(fetchedProject as T) as Ref<T>;
  const storageKey = getProjectStorageKey(projectId);

  // 檢查 localStorage 中是否已有數據
  const storedData = getFromLocalStorage<T>(storageKey);

  if (storedData) {
    // 檢查版本是否一致，如果資料庫數據更新則使用資料庫數據
    // 這裡假設 fetchedProject 和 storedData 都有 updatedAt 屬性
    const fetchedDate = new Date((fetchedProject as { updatedAt?: Date | string }).updatedAt || 0);
    const storedDate = new Date((storedData as { updatedAt?: Date | string }).updatedAt || 0);

    if (storedDate < fetchedDate) {
      // 資料庫數據更新，使用資料庫數據
      localProject.value = fetchedProject as T;
      saveToLocalStorage(storageKey, localProject.value);
    } else {
      // 本地數據更新，使用本地數據
      localProject.value = storedData;
    }
  } else {
    // 沒有本地數據，使用資料庫數據
    localProject.value = fetchedProject as T;
    saveToLocalStorage(storageKey, localProject.value);
  }

  return localProject;
}

/**
 * 保存專案數據到本地存儲
 * @param projectId 專案ID
 * @param projectData 專案數據
 * @returns 是否有更改
 */
export function saveProjectToLocalStorage<T>(projectId: string, projectData: T): boolean {
  const storageKey = getProjectStorageKey(projectId);
  const storedData = getFromLocalStorage<T>(storageKey);

  // 檢查數據是否有變化
  if (JSON.stringify(storedData) !== JSON.stringify(projectData)) {
    saveToLocalStorage(storageKey, projectData);
    return true; // 有更改
  }

  return false; // 無更改
}

/**
 * 設置 beforeunload 事件處理程序
 * @param hasChanges 是否有未保存的更改
 * @param projectId 專案ID
 * @param projectData 專案數據
 * @returns 事件處理函數
 */
export function setupBeforeUnloadHandler<T>(
  hasChanges: Ref<boolean>,
  projectId: string,
  projectData: Ref<T>
): (event: BeforeUnloadEvent) => string | undefined {
  const handler = (event: BeforeUnloadEvent) => {
    if (hasChanges.value) {
      // 提示用戶頁面有未保存的內容
      const message = '您有未保存的更改，確定要離開嗎？';
      event.preventDefault();
      event.returnValue = message;

      // 嘗試同步保存數據（注意：這可能不會完成）
      try {
        // 使用 navigator.sendBeacon 進行非同步請求
        const url = `/api/projects/${projectId}`;
        const data = new Blob([JSON.stringify(projectData.value)], { type: 'application/json' });
        navigator.sendBeacon(url, data);
      } catch (error) {
        console.error('窗口關閉時保存數據失敗:', error);
      }

      return message;
    }
    return undefined;
  };

  return handler;
}
