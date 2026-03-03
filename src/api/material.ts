import type { ApiResponse } from '@/types/request';
import type { MaterialResponse } from '@/types/response';
import type { CreateMaterialSchema } from '@/utils/schemas/createMaterialSchema';

import request from '@/utils/request';

export type UpdateMaterialPayload = Partial<
  Pick<MaterialResponse, 'quantity' | 'receivedDateTime' | 'note' | 'taskId'>
>;

export const materialApi = {
  // Get all materials for current user
  getAllMaterials: (): Promise<ApiResponse<MaterialResponse[]>> => {
    return request.get('/materials');
  },
  // Get all materials for a specific project
  getMaterialsByProjectId: (projectId: string): Promise<ApiResponse<MaterialResponse[]>> => {
    return request.get(`/materials/project/${projectId}`);
  },

  // Get all materials for a specific task
  getMaterialsByTaskId: (taskId: string): Promise<ApiResponse<MaterialResponse[]>> => {
    return request.get(`/materials/task/${taskId}`);
  },

  // Get a single material by its ID
  getMaterialById: (id: string): Promise<ApiResponse<MaterialResponse>> => {
    return request.get(`/materials/${id}`);
  },

  // Create a new material
  createMaterial: (materialData: CreateMaterialSchema): Promise<ApiResponse<MaterialResponse>> => {
    return request.post('/materials', materialData);
  },

  // Update a material
  updateMaterial: (
    id: string,
    materialData: UpdateMaterialPayload
  ): Promise<ApiResponse<MaterialResponse>> => {
    return request.patch(`/materials/${id}`, materialData);
  },

  // Delete a material
  deleteMaterial: (id: string): Promise<ApiResponse<null>> => {
    return request.delete(`/materials/${id}`);
  },

  // Batch create materials
  batchCreateMaterials: (payload: {
    projectId: string;
    materials: CreateMaterialSchema[];
  }): Promise<ApiResponse<MaterialResponse[]>> => {
    return request.post('/materials/batch', payload);
  },

  // Batch update materials
  batchUpdateMaterials: (
    materials: (UpdateMaterialPayload & { id: string })[]
  ): Promise<ApiResponse<MaterialResponse[]>> => {
    return request.patch('/materials/batch', { materials });
  },

  // Batch delete materials
  batchDeleteMaterials: (ids: string[]): Promise<ApiResponse<null>> => {
    return request.delete('/materials/batch', { data: { ids } });
  },
};
