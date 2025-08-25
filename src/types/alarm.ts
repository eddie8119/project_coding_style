import { AlarmStatus } from '@/types/label';

export interface DeviceAlarm {
  ID: string;
  active: true;
  group: string;
  high_bound: number;
  low_bound: number;
  product_name: string;
  tag: string;
  ph: number;
  alarm_settings: AlarmSetting[];
}

export interface AlarmSetting {
  ID_categories: string;
  active: boolean;
  severity: 'notice' | 'warning' | 'danger';
  unit: string;
  alarm_type: 'upper' | 'lower';
  threshold: number;
  interval: number;
  repeat: number;
  email?: string[];
}

export interface AlarmSettingsData {
  data: AlarmSetting[];
}

// 警報歷史記錄相關類型
export interface HandlingRecord {
  timestamp: number;
  handler: string;
  action: string;
  note: string;
}

export interface AlarmHistory {
  id: string;
  deviceId: string;
  deviceName: string;
  type: 'warning' | 'error';
  message: string;
  timestamp: number;
  status: 'pending' | 'handled';
  detail: string;
  handlingRecords: HandlingRecord[];
}

export interface AlarmHistoryData {
  data: AlarmHistory[];
}

export interface GetAlarmRecordApi {
  device: string;
  alarm_records: {
    action_status: string;
    alarm_status: string;
    version: string;
    details: string;
  }[];
}

export interface AlarmRecord {
  action_status: string;
  alarm_status: AlarmStatus;
  details: string;
  device: string;
  severity: string;
  timestamp: string;
  version: string;
}
