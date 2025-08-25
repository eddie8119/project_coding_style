/**
 * 用於管理TABLE 開啟對話框 和編輯操作。
 *
 */

import { ref } from 'vue';

import type { Ref } from 'vue/dist/vue.js';

interface UseDialogReturn<T> {
  showEditDialog: Ref<boolean>;
  selectedObject: Ref<T | null>;
  editObject: (object: T) => void;
  closeDialog: () => void;
}

export function useDialog<T>(): UseDialogReturn<T> {
  const showEditDialog = ref<boolean>(false);
  const selectedObject = ref<T | null>(null);

  const editObject = (object: T): void => {
    showEditDialog.value = true;
    selectedObject.value = { ...object };
  };

  const closeDialog = (): void => {
    selectedObject.value = null;
    showEditDialog.value = false;
  };

  return {
    showEditDialog,
    selectedObject,
    editObject,
    closeDialog,
  };
}
