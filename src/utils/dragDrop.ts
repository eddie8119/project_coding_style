import type { DropResult } from 'vue3-smooth-dnd';

/**
 * 處理拖拽排序的工具函數
 * @param collection 原始陣列
 * @param dropResult 拖拽結果
 * @returns 重新排序後的陣列
 */
export function applyDrag<T>(collection: T[], dropResult: DropResult): T[] {
  const { removedIndex, addedIndex, payload } = dropResult;

  if (removedIndex === null && addedIndex === null) return collection;

  const result = [...collection];
  let itemToAdd: T | undefined = (payload as T | undefined) ?? undefined;

  if (removedIndex !== null) {
    const removedItems = result.splice(removedIndex, 1);
    itemToAdd = removedItems.length ? removedItems[0] : undefined;
  }

  if (addedIndex !== null && itemToAdd !== undefined) {
    result.splice(addedIndex, 0, itemToAdd);
  }

  return result;
}

/**
 * 生成拖拽項目的 payload
 * @param index 項目索引
 * @returns payload 函數
 */
export function generateItemPayload<T>(items: T[]) {
  return (index: number): T => {
    return items[index];
  };
}
