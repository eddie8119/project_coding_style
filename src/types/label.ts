import type { DeviceStatus, ObservationType } from '@/types/device';

export enum AlarmStatus {
  RESOLVED = 'resolved',
  UNRESOLVED = 'unresolved',
}

export interface Alarm {
  ts: string;
  severity: DeviceStatus;
  alarm_name: string;
  details: string;
  status: AlarmStatus;
}

export interface DeviceWithAlarms {
  ID: string;
  tag: string;
  alarms: Alarm[];
  version: string;
  alarm_status: AlarmStatus;
  details: string;
  label: string;
}

type DeviceStatusItem = {
  items: string[];
  tag: string;
};

export interface DeviceWithStatus {
  ID: ObservationType;
  running: string[];
  stopped?: string[];
  warning: Record<string, DeviceStatusItem>;
  caution: Record<string, DeviceStatusItem>;
}
