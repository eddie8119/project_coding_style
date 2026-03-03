import type { TaskResponse } from '@/types/response';
import type { Ref } from 'vue';

// 擴展 TaskResponse 類型以包含用於排序的 order 屬性，使其可選
export type DraggableTask = TaskResponse & { order?: number };

/**
 * @composable useTaskDragAndDrop
 *
 * @description
 * 處理看板中任務卡片的拖放邏輯。
 * 負責更新任務的順序和所屬的工程類型。
 *
 * @param {Ref<DraggableTask[] | null>} allTasksRef - 包含所有任務的響應式引用。
 * @param {(updatedTasks: DraggableTask[]) => void} updateCallback - 數據更新後的回調函數。
 *
 * @returns {{ handleTaskDrop: (dropResult: any, targetConstructionType: string) => void }}
 */
export function useTaskDragAndDrop(
  allTasksRef: Ref<DraggableTask[] | null>,
  updateCallback: (updatedTasks: DraggableTask[]) => void
) {
  const handleTaskDrop = (
    dropResult: {
      removedIndex: number | null;
      addedIndex: number | null;
      payload: DraggableTask;
    },
    targetConstructionType: string
  ) => {
    const { addedIndex, payload } = dropResult;

    if (allTasksRef.value === null || addedIndex === null) {
      return;
    }

    // 創建一個工作副本
    const workingTasks = [...allTasksRef.value];

    // 找到被拖動的任務
    const draggedTask = workingTasks.find((task) => task.id === payload.id);
    if (!draggedTask) return;

    // 1. 從工作副本中「移除」被拖動的任務，以便後續插入
    const taskIndex = workingTasks.findIndex((t) => t.id === draggedTask.id);
    if (taskIndex > -1) {
      workingTasks.splice(taskIndex, 1);
    }

    // 2. 更新任務的工程類型
    draggedTask.constructionType = targetConstructionType;

    // 3. 找到目標容器中，插入點之後的第一個任務
    const tasksInTargetContainer = workingTasks
      .filter((t) => t.constructionType === targetConstructionType)
      .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));

    const taskAfter = addedIndex !== null ? tasksInTargetContainer[addedIndex] : undefined;

    let insertIndex = -1;
    if (taskAfter) {
      // 如果找到了後面的任務，就插入到它前面
      insertIndex = workingTasks.findIndex((t) => t.id === taskAfter.id);
    } else {
      // 如果沒找到（即拖曳到末尾），則找到目標容器最後一個任務的位置
      if (tasksInTargetContainer.length > 0) {
        const lastTask = tasksInTargetContainer[tasksInTargetContainer.length - 1];
        insertIndex = workingTasks.findIndex((t) => t.id === lastTask.id) + 1;
      } else {
        // 如果目標容器是空的，則需要找到容器本身的位置，這裡簡化處理，先放在末尾
        // 一個更穩健的方法是需要知道容器的順序
        insertIndex = workingTasks.length;
      }
    }

    // 在計算出的位置插入任務
    if (insertIndex !== -1) {
      workingTasks.splice(insertIndex, 0, draggedTask);
    } else {
      workingTasks.push(draggedTask); // Fallback
    }

    // 4. 重新計算所有容器的 order
    const reorderAll = (tasks: DraggableTask[]) => {
      const containerMap: { [key: string]: DraggableTask[] } = {};

      tasks.forEach((task) => {
        const type = task.constructionType || 'uncategorized';
        if (!containerMap[type]) {
          containerMap[type] = [];
        }
        containerMap[type].push(task);
      });

      Object.values(containerMap).forEach((group) => {
        group.forEach((task, index) => {
          task.order = index;
        });
      });
    };

    reorderAll(workingTasks);

    // 5. 觸發回調
    updateCallback(workingTasks);
  };

  return {
    handleTaskDrop,
  };
}
