import type { TaskResponse } from '@/types/response';

/**
 * Search tasks by query string across title, description, and materials
 * @param tasks - Array of tasks to search
 * @param query - Search query string
 * @returns Filtered array of tasks matching the query
 */
export function searchTasks(tasks: TaskResponse[], query: string): TaskResponse[] {
  if (!query || query.trim() === '') {
    return tasks;
  }

  const normalizedQuery = query.toLowerCase().trim();

  return tasks.filter((task) => {
    // Search in title
    const titleMatch = task.title?.toLowerCase().includes(normalizedQuery);

    // Search in description
    const descriptionMatch = task.description?.toLowerCase().includes(normalizedQuery);

    // Search in materials
    const materialsMatch = task.materials?.some((material) =>
      material.materialDefinition?.name?.toLowerCase().includes(normalizedQuery)
    );

    return titleMatch || descriptionMatch || materialsMatch;
  });
}
