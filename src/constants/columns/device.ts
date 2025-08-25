import type { Column } from '@/types/common';

export const DEVICE_COLUMNS: Column[] = [
  { field: 'ID' },
  { field: 'tag' },
  { field: 'product_name' },
  { field: 'location' },
  { field: 'group' },
  { field: 'main_unit', align: 'center' },
  { field: 'low_bound', align: 'center' },
  { field: 'low_alarm', align: 'center' },
  { field: 'high_alarm', align: 'center' },
  { field: 'high_bound', align: 'center' },
];

export const ENTITY_CALIBRATION_COLUMNS: Column[] = [
  { field: 'ID' },
  { field: 'tag' },
  { field: 'ts' },
  { field: 'health' },
  { field: 'zero' },
  { field: 'slope' },
];

export const ENTITY_STATISTICS_COLUMNS: Column[] = [
  { field: 'ID' },
  { field: 'tag' },
  { field: 'unit', align: 'center' },
  { field: 'avg', align: 'center' },
  { field: 'max', align: 'center' },
  { field: 'max_t', align: 'center' },
  { field: 'min', align: 'center' },
  { field: 'min_t', align: 'center' },
];
