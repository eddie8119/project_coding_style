import type { AlarmSetting, AlarmSettingsData, GetAlarmRecordApi } from '@/types/alarm';
import type { DeviceAlarm } from '@/types/device';
import type { AxiosResponse } from 'axios';

import instance from '@/utils/request';

export const alarmApi = {
  getAlarmsSetting(): Promise<AxiosResponse<AlarmSettingsData>> {
    return instance.get('/alarms/settings/');
  },
  postAlarmSetting(data: AlarmSetting[]) {
    return instance.post('/alarms/settings/', data);
  },
  postAlarmRecords(params: string, data: { action: string; operation: string }) {
    return instance.post(`/alarms/records/${params}/actions/`, data);
  },
  patchAlarmSetting(id: string, data: DeviceAlarm) {
    return instance.patch(`/alarms/settings/${id}/`, data);
  },
  patchAlarmSettingBatch(data: AlarmSetting[]) {
    return instance.patch(`/alarms/settings/batch/`, data);
  },

  // alarm record
  getDeviceAlarmRecords(id: string): Promise<AxiosResponse<GetAlarmRecordApi>> {
    return instance.get(`/devices/${id}/alarm-records/`);
  },
};
