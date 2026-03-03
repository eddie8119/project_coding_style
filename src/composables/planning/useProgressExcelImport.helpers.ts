import type { CreatePlanningTaskPayload } from '@/api/planningTask';
import type { ProgressParsedExcelData } from '@/types/gantt';
import type { ProjectResponse } from '@/types/response';
import type { ConstructionSelection } from '@/types/selection';
import type { Ref } from 'vue';

export const toIsoStringOrNull = (value: unknown): string | null => {
  if (!value) return null;
  return value instanceof Date ? value.toISOString() : String(value);
};

export const buildConstructionFromParsed = (
  parsedCategories: ProgressParsedExcelData['categories']
): ConstructionSelection[] =>
  parsedCategories.map((category) => ({
    id: category.id,
    name: category.name,
  }));

export const syncTaskCategoryIdsWithConstruction = (
  parsedData: ProgressParsedExcelData,
  constructionContainer: ConstructionSelection[]
) => {
  const { categories, tasks } = parsedData;

  if (!categories || categories.length === 0) return;

  const finalIdByName = new Map<string, string>();
  constructionContainer.forEach((item) => {
    if (item.name) {
      finalIdByName.set(item.name, item.id);
    }
  });

  const originalIdByName = new Map<string, string>();
  categories.forEach((category) => {
    originalIdByName.set(category.name, category.id);
  });

  const idMap = new Map<string, string>();
  originalIdByName.forEach((oldId, name) => {
    const finalId = finalIdByName.get(name);
    if (finalId && finalId !== oldId) {
      idMap.set(oldId, finalId);
    }
  });

  parsedData.categories = categories.map((category) => {
    const finalId = finalIdByName.get(category.name);
    if (!finalId || finalId === category.id) return category;

    return {
      ...category,
      id: finalId,
    };
  });

  if (!tasks || tasks.length === 0 || idMap.size === 0) return;

  parsedData.tasks = tasks.map((task) => {
    const newCategoryId = idMap.get(task.categoryId);
    if (!newCategoryId) return task;

    return {
      ...task,
      categoryId: newCategoryId,
    };
  });
};

export const findExistingProjectForParsed = (
  parsedData: ProgressParsedExcelData,
  _fileName: string,
  fetchedProjects: Ref<ProjectResponse[] | undefined>
) => {
  const projects = fetchedProjects.value || [];
  // 目前以 projectName 對應到 title，未來若有檔名欄位可再擴充條件
  return projects.find((project) => project.title === parsedData.projectName) || null;
};

export const buildPlanningTasksPayload = (
  tasks: ProgressParsedExcelData['tasks'] | undefined
): CreatePlanningTaskPayload[] =>
  (tasks ?? [])
    .map((task) => ({
      constructionType: task.categoryId,
      content: task.content,
      startDate: toIsoStringOrNull(task.startDate),
      endDate: toIsoStringOrNull(task.endDate),
    }))
    .filter((task) => task.content.trim() !== '');
