import type { Column } from '@/types/common';

export const PH_DEVICES_MONITOR_COLUMNS: Column[] = [
  { field: 'index' },
  { field: 'product_name' },
  { field: 'sensor_name' },
  { field: 'tag' },
  { field: 'status', align: 'center' },
  // { field: 'action_status' },
  { field: 'ph_measurement_value', align: 'center' },
  { field: 'temperature', align: 'center' },
  { field: 'mv', align: 'center' },
  { field: 'zero', align: 'center' },
  { field: 'slope', align: 'center' },
];

export const PH_DEVICES_ALARM_COLUMNS: Column[] = [
  { field: 'index' },
  { field: 'ID' },
  { field: 'tag' },
  { field: 'status', align: 'center' },
  { field: 'alarm_settings', align: 'center' },
];

export const PH_ALARM_HISTORY_COLUMNS: Column[] = [
  { field: 'index' },
  { field: 'timestamp' },
  { field: 'severity' },
  { field: 'alarm_status' },
  { field: 'details' },
];

export const PH_MATERIAL_COLUMNS: Column[] = [
  { field: 'index' },
  { field: 'material_name' },
  { field: 'remaining_quantity', align: 'center' },
  // { field: 'total_consumption', align: 'center' },
  { field: 'last_replacement_time', align: 'center' },
  { field: 'last_purchase_time', align: 'center' },
];

export const PH_DEVICE_USAGE_COLUMNS: Column[] = [
  { field: 'index' },
  { field: 'replace_date' },
  { field: 'water_area' },
  { field: 'useing_days' },
];

export const PH_MATERIAL_ACTIONS: string[] = ['Edit', 'Maintenance', 'Buy', 'Delete'];
export const PH_ALARM_ACTIONS: string[] = []; //'Edit'
