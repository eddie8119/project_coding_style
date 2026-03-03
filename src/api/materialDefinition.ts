import type { ApiResponse } from '@/types/request';
import type { MaterialDefinitionResponse } from '@/types/response';

import request from '@/utils/request';

export const materialDefinitionApi = {
  getMaterialDefinitions: (
    construction?: string
  ): Promise<ApiResponse<MaterialDefinitionResponse[]>> => {
    return request.get('/material-definitions', {
      params: { construction },
    });
  },

  createMaterialDefinition: (
    data: Partial<Omit<MaterialDefinitionResponse, 'id'>>
  ): Promise<ApiResponse<MaterialDefinitionResponse>> => {
    return request.post('/material-definitions', data);
  },

  updateMaterialDefinition: (
    id: string,
    data: Partial<Omit<MaterialDefinitionResponse, 'id'>>
  ): Promise<ApiResponse<MaterialDefinitionResponse>> => {
    return request.patch(`/material-definitions/${id}`, data);
  },

  deleteMaterialDefinition: (id: string): Promise<ApiResponse<unknown>> => {
    return request.delete(`/material-definitions/${id}`);
  },

  batchUpdateMaterialDefinitions: (
    data: (Partial<Omit<MaterialDefinitionResponse, 'id'>> & { id: string })[]
  ): Promise<ApiResponse<MaterialDefinitionResponse[]>> => {
    return request.patch('/material-definitions/batch', { materialDefinitions: data });
  },
};
