import type { TaskResponse } from '@/types/response';

// 建立 onsite 任務查詢表：依 constructionType + 日期 分組
export type OnsiteTaskCategoryDateMap = Map<string, Map<number, TaskResponse[]>>;

export const buildOnsiteTaskByCategoryAndDate = (
  tasks: TaskResponse[]
): OnsiteTaskCategoryDateMap => {
  const outer: OnsiteTaskCategoryDateMap = new Map();

  tasks.forEach((task) => {
    // 1. 先決定要用哪一個日期欄位：優先 endDateTime，否則退回 reminderDateTime
    const dateString = task.endDateTime ?? task.reminderDateTime;

    if (!dateString || !task.constructionType) return;

    const categoryId = task.constructionType;
    const endDate = new Date(dateString);

    // 正規化為「日期欄位」同樣的 00:00，避免 13:00 等時間導致 key 對不到
    const normalizedDate = new Date(endDate.getFullYear(), endDate.getMonth(), endDate.getDate());
    const dateKey = normalizedDate.getTime();

    if (!outer.has(categoryId)) {
      outer.set(categoryId, new Map<number, TaskResponse[]>());
    }

    const dateMap = outer.get(categoryId);
    if (!dateMap) return;

    if (!dateMap.has(dateKey)) {
      dateMap.set(dateKey, []);
    }
    dateMap.get(dateKey)?.push(task);
  });

  return outer;
};
