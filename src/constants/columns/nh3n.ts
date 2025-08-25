import type { Column } from '@/types/common';

export const NH3N_DEVICES_MONITOR_COLUMNS: Column[] = [
  { field: 'index' },
  { field: 'product_name' },
  { field: 'sensor_name' },
  { field: 'tag' },
  { field: 'status', align: 'center' },
  // { field: 'action_status' },
  { field: 'ppm_measurement_value' },
  { field: 'sensitivity' },
];

export const NH3N_DEVICES_ALARM_COLUMNS: Column[] = [
  { field: 'index' },
  { field: 'ID' },
  { field: 'tag' },
  { field: 'status', align: 'center' },
  { field: 'alarm_settings', align: 'center' },
];

export const NH3N_ALARM_HISTORY_COLUMNS: Column[] = [
  { field: 'index' },
  { field: 'timestamp' },
  { field: 'severity' },
  { field: 'alarm_status' },
  { field: 'details' },
];

export const NH3N_MATERIAL_COLUMNS: Column[] = [
  { field: 'index' },
  { field: 'material_name' },
  { field: 'remaining_quantity', align: 'center' },
  // { field: 'total_consumption', align: 'center' },
  { field: 'last_replacement_time', align: 'center' },
  { field: 'last_purchase_time', align: 'center' },
];

export const NH3N_DEVICE_USAGE_COLUMNS: Column[] = [
  { field: 'index' },
  { field: 'replace_date' },
  { field: 'water_area' },
  { field: 'useing_days' },
];

export const NH3N_MATERIAL_ACTIONS: string[] = ['Edit', 'Maintenance', 'Buy', 'Delete'];
export const NH3N_ALARM_ACTIONS: string[] = []; //'Edit'
