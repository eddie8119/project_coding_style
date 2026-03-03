import type { ApiResponse } from '@/types/request';
import type { DraftResponse } from '@/types/response';

import request from '@/utils/request';

export const draftApi = {
  getDraft: (): Promise<ApiResponse<DraftResponse>> => {
    return request.get('/draft');
  },
  createdraft: (data: Partial<DraftResponse>): Promise<ApiResponse<DraftResponse>> => {
    return request.post('/draft', data);
  },
  updatedraft: (id: string, data: Partial<DraftResponse>): Promise<ApiResponse<DraftResponse>> => {
    return request.patch(`/draft/${id}`, data);
  },
  deletedraft: (id: string): Promise<ApiResponse<void>> => {
    return request.delete(`/draft/${id}`);
  },
};
