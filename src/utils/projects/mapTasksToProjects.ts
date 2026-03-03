import type { ProjectResponse, TaskResponse } from '@/types/response';

/**
 * Map tasks into their corresponding projects by projectId.
 * Returns a new array of projects with an added `tasks` field.
 */
export function mapTasksToProjects(
  projects: ProjectResponse[] = [],
  tasks: TaskResponse[] = []
): (ProjectResponse & { tasks: TaskResponse[] })[] {
  const tasksByProject = tasks.reduce<Record<string, TaskResponse[]>>((acc, t) => {
    const pid = t.projectId as string | undefined;
    if (!pid) return acc;
    if (!acc[pid]) acc[pid] = [];
    acc[pid].push(t);
    return acc;
  }, {});

  return projects.map((p) => ({
    ...p,
    tasks: tasksByProject[p.id] || [],
  }));
}
