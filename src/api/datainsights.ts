import type {
  CalibrationData,
  MeasureData,
  Statistics,
  DatainsightsHistoryParams,
} from '@/types/datainsight';
import type { AxiosResponse } from 'axios';

import instance from '@/utils/request';

export const datainsightsApi = {
  getLatestMeasure(ids: string): Promise<AxiosResponse<MeasureData>> {
    return instance.get('/datainsights/latest-measure/', { params: { ids } });
  },
  getLatestCalibration(ids: string): Promise<AxiosResponse<CalibrationData>> {
    return instance.get('/datainsights/latest-calibration/', { params: { ids } });
  },
  getMeasureHistory(params: DatainsightsHistoryParams) {
    return instance.get('/datainsights/measure-history/', { params });
  },
  getCalibrationHistory(params: DatainsightsHistoryParams) {
    return instance.get('/datainsights/calibration-history/', { params });
  },
  getStatistics(ids: string): Promise<AxiosResponse<Statistics>> {
    return instance.get('/datainsights/statistics/', { params: { ids } });
  },
};
