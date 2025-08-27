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

// LatestCalibration
export interface BasicLatestCalibration {
  ID: string;
  ts: string;
  version: string;
}

export interface PhLatestCalibration extends BasicLatestCalibration {
  health: number;
  slope: number;
  zero: number;
}

export interface ORPLatestCalibration extends BasicLatestCalibration {
  mv: number;
}

export interface NH3NLatestCalibration extends BasicLatestCalibration {
  sensitivity: number;
}

export interface FlourideLatestCalibration extends BasicLatestCalibration {
  sensitivity: number;
}

export type LatestCalibration =
  | PhLatestCalibration
  | ORPLatestCalibration
  | NH3NLatestCalibration
  | FlourideLatestCalibration;
