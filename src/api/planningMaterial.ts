import type { ApiResponse } from '@/types/request';
import type { PlanningMaterialResponse } from '@/types/response';

import request from '@/utils/request';

export interface PlanningMaterialPayload {
  id?: string;
  projectId: string;
  construction: string | null;
  materialDefinitionId?: string;
  planningTotalQuantity?: number | null;
  unitPrice?: number | null;
  note?: string | null;
}

export const planningMaterialApi = {
  deletePlanningMaterial: (id: string): Promise<ApiResponse<null>> => {
    return request.delete(`/planning-materials/${id}`);
  },
  getPlanningMaterialsByProjectId: (
    projectId: string
  ): Promise<ApiResponse<PlanningMaterialResponse[]>> => {
    return request.get(`/planning-materials/project/${projectId}`);
  },
  getAllPlanningMaterials: (): Promise<ApiResponse<PlanningMaterialResponse[]>> => {
    return request.get('/planning-materials');
  },

  upsertPlanningMaterial: (
    data: PlanningMaterialPayload
  ): Promise<ApiResponse<PlanningMaterialResponse>> => {
    return request.post('/planning-materials/upsert', data);
  },

  batchUpsertPlanningMaterials: (
    data: PlanningMaterialPayload[]
  ): Promise<ApiResponse<PlanningMaterialResponse[]>> => {
    return request.post('/planning-materials/batch-upsert', { planningMaterials: data });
  },
};
