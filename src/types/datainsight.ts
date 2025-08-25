export interface DatainsightsHistoryParams {
  ids: string;
  unit: string;
  start_time?: string;
  end_time?: string;
}

export interface StatisticsData {
  ID: string;
  categories: string;
  count_mv: number;
  count_ph: number;
  count_temperature: number;
  max_mv: number;
  max_mv_ts: string;
  max_ph: number;
  max_ph_ts: string;
  max_temperature: number;
  max_temperature_ts: string;
  min_mv: number;
  min_mv_ts: string;
  min_ph: number;
  min_ph_ts: string;
  min_temperature: number;
  min_temperature_ts: string;
  sum_mv: number;
  sum_ph: number;
  sum_temperature: number;
}

export interface Statistics {
  data: StatisticsData[];
}

export interface CaliData {
  ID: string;
  health: number;
  slope: number;
  ts: string;
  version: string;
  zero: number;
  ppm: number;
  sensitivity: number;
  offset: number;
}

export interface CalibrationData {
  data: CaliData[];
}

export interface Measure {
  ID: string;
  mv: number;
  ph: number;
  temperature: number;
  ts: string;
  version: string;
  ppm: number;
  sensitivity: number;
}

export interface MeasureData {
  data: Measure[];
}
