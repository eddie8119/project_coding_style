import type {
  GanttCategory,
  GanttDateRange,
  GanttProject,
  GanttSchedule,
  GanttTask,
} from '@/types/gantt';
import type { PlanningTaskResponse, ProjectResponse } from '@/types/response';

export interface BuildGanttProjectFromPlanningOptions {
  project: ProjectResponse;
  tasks: PlanningTaskResponse[];
  constructionNameById: Map<string, string>;
  unclassifiedLabel: string;
}

// 將 Project + PlanningTasks 轉成前端甘特圖使用的 GanttProject
export const buildGanttProjectFromPlanning = (
  options: BuildGanttProjectFromPlanningOptions
): GanttProject | null => {
  const { project, tasks, constructionNameById, unclassifiedLabel } = options;

  if (!project.planningStartDate || !project.planningEndDate) return null;

  const startDate = new Date(project.planningStartDate);
  const endDate = new Date(project.planningEndDate);

  const dateRange: GanttDateRange = { startDate, endDate };

  const normalizeDate = (value: string | Date): Date => {
    return value instanceof Date ? value : new Date(value);
  };

  const segments: GanttDateRange[] = project.planningSegments?.map((segment) => ({
    startDate: normalizeDate(segment.startDate as unknown as string | Date),
    endDate: normalizeDate(segment.endDate as unknown as string | Date),
  })) ?? [dateRange];

  // 依 constructionType 分組成 GanttCategory
  const categoryMap = new Map<string, { id: string; name: string; tasks: GanttTask[] }>();

  // 先根據 project.constructionContainer 建立完整類別列表
  for (const item of project.constructionContainer ?? []) {
    if (!item.id) continue;
    const id = item.id;
    const name = item.name ?? unclassifiedLabel;

    if (!categoryMap.has(id)) {
      categoryMap.set(id, {
        id,
        name,
        tasks: [],
      });
    }
  }

  // 再將任務依 constructionType 塞入對應類別
  for (const task of tasks) {
    if (!task.startDate || !task.endDate) continue;

    const taskStart = new Date(task.startDate);
    const taskEnd = new Date(task.endDate);

    // 顯示時將 endDate 往前調整一天
    const adjustedEnd = new Date(taskEnd);
    adjustedEnd.setDate(adjustedEnd.getDate() - 1);

    const schedules: GanttSchedule[] = [
      {
        id: task.id,
        startDate: taskStart,
        endDate: adjustedEnd,
        type: 'execution',
      },
    ];

    const constructionId = task.constructionType;
    const categoryName = constructionId
      ? (constructionNameById.get(constructionId) ?? unclassifiedLabel)
      : unclassifiedLabel;
    const categoryId = constructionId ?? 'unclassified';

    if (!categoryMap.has(categoryId)) {
      categoryMap.set(categoryId, {
        id: categoryId,
        name: categoryName,
        tasks: [],
      });
    }

    const ganttTask: GanttTask = {
      id: task.id,
      name: categoryName,
      category: categoryName,
      categoryId,
      schedules,
      content: task.content,
    };

    categoryMap.get(categoryId)?.tasks.push(ganttTask);
  }

  const constructionOrder = new Map(
    (project.constructionContainer ?? []).map((item, index) => [item.id, index])
  );

  const categories: GanttCategory[] = Array.from(categoryMap.values()).sort((a, b) => {
    const orderA = constructionOrder.get(a.id);
    const orderB = constructionOrder.get(b.id);

    if (orderA == null && orderB == null) return 0;
    if (orderA == null) return 1;
    if (orderB == null) return -1;
    return orderA - orderB;
  });

  if (categories.length === 0) {
    return null;
  }

  const gantt: GanttProject = {
    id: project.id,
    name: project.title,
    dateRange,
    segments,
    categories,
    dateColumns: project.planningDateColumns
      ? project.planningDateColumns.map((col) => ({
          ...col,
          date: normalizeDate(col.date as unknown as string | Date),
        }))
      : undefined,
    specialHolidays: project.planningSpecialHolidays
      ? project.planningSpecialHolidays.map((cell) => ({
          ...cell,
          startDate: normalizeDate(cell.startDate as unknown as string | Date),
          endDate: normalizeDate(cell.endDate as unknown as string | Date),
        }))
      : undefined,
    paymentRemittances: project.planningPaymentRemittances
      ? project.planningPaymentRemittances.map((cell) => ({
          ...cell,
          startDate: normalizeDate(cell.startDate as unknown as string | Date),
          endDate: normalizeDate(cell.endDate as unknown as string | Date),
        }))
      : undefined,
    preConstructionNotes: project.planningPreConstructionNotes
      ? project.planningPreConstructionNotes.map((cell) => ({
          ...cell,
          startDate: normalizeDate(cell.startDate as unknown as string | Date),
          endDate: normalizeDate(cell.endDate as unknown as string | Date),
        }))
      : undefined,
  };

  return gantt;
};
