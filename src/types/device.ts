import type { AlarmSetting } from '@/types/alarm';

export enum DeviceStatus {
  RUNNING = 'running',
  CAUTION = 'caution',
  STOPPED = 'stopped',
  WARNING = 'warning',
}

export enum DeviceActionStatus {
  NOT_AVAILABLE = 'not available',
  IDLE = 'idle',
  ERROR = 'error',
  RUNNING = 'running',
}
export enum ObservationType {
  PH = 'ph',
  ORP = 'orp',
  NH3N = 'nh3n',
  FLOURIDE = 'flouride',
}

// 基本來自api設備資訊
interface BasicDevice {
  ID: string;
  status: DeviceStatus;
  action_status: DeviceActionStatus;
  categories: string;
  group: string;
  high_alarm: number;
  high_bound: number;
  location: string;
  low_alarm: number;
  low_bound: number;
  main_unit: ObservationType;
  label: string;
  product_name: string;
  product_serial: string;
  sensor_serial: string;
  sensor_name: string;
  tag: string;
}

export interface PHDevice extends BasicDevice {
  ph: number;
  temperature: number;
  mv: number;
  zero: number;
  slope: number;
}

export interface ORPDevice extends BasicDevice {
  mv: number;
  offset: number;
}

export interface NH3NDevice extends BasicDevice {
  ppm: number;
  sensitivity: number;
}

export interface FlourideDevice extends BasicDevice {
  ppm: number;
  sensitivity: number;
}

export type Device = PHDevice | ORPDevice | NH3NDevice | FlourideDevice;

// 設備集合
export interface Devices {
  devices: Device[];
}

// 單一設備
export interface DeviceDevice {
  device: Device;
}

// 設備告警
export interface DeviceAlarm {
  ID: string;
  active: boolean;
  categories: string;
  product_name: string;
  location: string;
  main_unit: ObservationType;
  group: string;
  tag: string;
  low_bound: number;
  high_bound: number;
  alarm_settings: AlarmSetting[];
}
