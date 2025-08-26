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

export interface LatestCalibrationDataType {
  zero: number;
  slope: number;
  sensitivity?: number;
  offset?: number;
}
