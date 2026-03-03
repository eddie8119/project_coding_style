import type {
  GanttCategory,
  GanttProject,
  GanttSchedule,
  GanttTask,
  ProgressParsedExcelData,
} from '@/types/gantt';

/**
 * 將解析的 Excel 資料轉換為甘特圖專案資料, 目前沒有使用 用於轉換為甘特圖資料 convertToGanttProject(parsedData)
 */
export const convertToGanttProject = (parsedData: ProgressParsedExcelData): GanttProject => {
  const {
    projectName,
    dateRange,
    segments,
    dateColumns,
    specialHolidays,
    paymentRemittances,
    preConstructionNotes,
    categories,
    tasks,
  } = parsedData;

  // 轉換類別和任務
  const ganttCategories: GanttCategory[] = categories.map((category) => {
    const categoryTasks = tasks.filter((task) => task.categoryId === category.id);

    const ganttTasks: GanttTask[] = categoryTasks.map((task, taskIndex) => {
      // Create a single schedule from the task's startDate and endDate
      // Adjust endDate by subtracting one day for correct frontend display
      const adjustedEndDate = new Date(task.endDate);
      adjustedEndDate.setDate(adjustedEndDate.getDate() - 1);

      const schedules: GanttSchedule[] = [
        {
          id: crypto.randomUUID(),
          startDate: task.startDate,
          endDate: adjustedEndDate,
          type: 'execution',
        },
      ];

      return {
        id: `task-${category.id}-${taskIndex}`,
        name: category.name,
        category: category.name,
        categoryId: category.id,
        schedules,
        content: task.content,
      };
    });

    return {
      id: category.id,
      name: category.name,
      tasks: ganttTasks,
    };
  });

  return {
    id: crypto.randomUUID(),
    name: projectName,
    dateRange,
    segments,
    dateColumns,
    categories: ganttCategories,
    specialHolidays,
    paymentRemittances,
    preConstructionNotes,
  };
};
