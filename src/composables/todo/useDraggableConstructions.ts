import type { ConstructionSelection } from '@/types/selection';
import type { Ref } from 'vue';

/**
 * @composable useDraggableConstructions
 *
 * @description
 * 負責處理工程類型容器的拖曳排序功能。
 *
 * @param {Ref<ConstructionSelection[]>} containersRef - 容器陣列的響應式引用。
 * @param {(newContainers: ConstructionSelection[]) => void} updateCallback - 數據更新後的回調函數。
 *
 * @returns {
 *   getConstructionContainerPayload: (index: number) => ConstructionSelection;
 *   onConstructionContainerDrop: (dropResult: any) => void;
 * }
 */
export function useDraggableConstructions(
  containersRef: Ref<ConstructionSelection[]>,
  updateCallback: (newContainers: ConstructionSelection[]) => void
) {
  const getConstructionContainerPayload = (index: number): ConstructionSelection => {
    return containersRef.value[index];
  };

  const onConstructionContainerDrop = (dropResult: {
    removedIndex: number | null;
    addedIndex: number | null;
    payload: ConstructionSelection;
  }) => {
    const { removedIndex, addedIndex, payload } = dropResult;
    if (removedIndex === null && addedIndex === null) return;

    const newContainers = [...containersRef.value];
    let itemToAdd = payload;

    if (removedIndex !== null) {
      itemToAdd = newContainers.splice(removedIndex, 1)[0];
    }

    if (addedIndex !== null && itemToAdd) {
      newContainers.splice(addedIndex, 0, itemToAdd);
    }

    containersRef.value = newContainers;
    updateCallback(newContainers);
  };

  return {
    getConstructionContainerPayload,
    onConstructionContainerDrop,
  };
}
