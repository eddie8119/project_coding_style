import type { ApiResponse } from '@/types/request';
import type { CommonResponse } from '@/types/response';
import type { CreateCommonSchema } from '@/utils/schemas/createCommonSchema';

import request from '@/utils/request';

export const commonApi = {
  getCommon: (): Promise<ApiResponse<CommonResponse>> => {
    return request.get('/common');
  },
  createCommon: (data: Partial<CreateCommonSchema>): Promise<ApiResponse<CommonResponse>> => {
    return request.post('/common', data);
  },
  updateCommon: (
    id: string,
    data: Partial<CreateCommonSchema>
  ): Promise<ApiResponse<CommonResponse>> => {
    return request.patch(`/common/${id}`, data);
  },
  deleteCommon: (id: string): Promise<ApiResponse<void>> => {
    return request.delete(`/common/${id}`);
  },
};
