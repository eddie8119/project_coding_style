import type { ApiResponse } from '@/types/request';
import type { PlanningTaskResponse } from '@/types/response';

import request from '@/utils/request';

export interface CreatePlanningTaskPayload {
  constructionType?: string | null;
  content: string;
  startDate?: string | null;
  endDate?: string | null;
}

export const planningTaskApi = {
  createPlanningTask: (
    data: CreatePlanningTaskPayload,
    projectId: string
  ): Promise<ApiResponse<PlanningTaskResponse>> => {
    return request.post(`/planning-tasks/${projectId}`, data);
  },
  getPlanningTaskById: (id: string): Promise<ApiResponse<PlanningTaskResponse>> => {
    return request.get(`/planning-tasks/detail/${id}`);
  },
  updatePlanningTask: (
    id: string,
    data: Partial<CreatePlanningTaskPayload>
  ): Promise<ApiResponse<PlanningTaskResponse>> => {
    return request.patch(`/planning-tasks/detail/${id}`, data);
  },
  deletePlanningTask: (id: string): Promise<ApiResponse<void>> => {
    return request.delete(`/planning-tasks/${id}`);
  },

  // 批次規劃任務
  getAllPlanningTasks: (): Promise<ApiResponse<PlanningTaskResponse[]>> => {
    return request.get(`/planning-tasks`);
  },
  getPlanningTasksByProjectId: (
    projectId: string
  ): Promise<ApiResponse<PlanningTaskResponse[]>> => {
    return request.get(`/planning-tasks/${projectId}`);
  },
  createPlanningTasks: (
    data: CreatePlanningTaskPayload[],
    projectId: string
  ): Promise<ApiResponse<PlanningTaskResponse[]>> => {
    return request.post(`/planning-tasks/${projectId}/batch`, { planningTasks: data });
  },
  updateProjectPlanningTasks: (
    data: PlanningTaskResponse[],
    projectId: string
  ): Promise<ApiResponse<PlanningTaskResponse[]>> => {
    return request.patch(`/planning-tasks/${projectId}`, { planningTasks: data });
  },
  replacePlanningTasksByProjectId: (
    data: CreatePlanningTaskPayload[],
    projectId: string
  ): Promise<ApiResponse<PlanningTaskResponse[]>> => {
    return request.put(`/planning-tasks/${projectId}/replace`, { planningTasks: data });
  },
  deletePlanningTaskByProjectId: (projectId: string): Promise<ApiResponse<void>> => {
    return request.delete(`/planning-tasks/${projectId}`);
  },
};
