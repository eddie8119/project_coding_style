import type { AxiosResponse } from 'axios';

import instance from '@/utils/request';

interface GetLabelsParams {
  label?: string;
  alarm_status?: string;
}

export const labelApi = {
  // device statuses
  getLabels(): Promise<AxiosResponse> {
    return instance.get('/labels/device-statuses/');
  },
  getAlarmRecords(params?: GetLabelsParams): Promise<AxiosResponse> {
    return instance.get(`/labels/alarm-records/`, { params });
  },
};
