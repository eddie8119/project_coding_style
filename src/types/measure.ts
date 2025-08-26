export enum Measurement {
  PH = 'ph',
  ELEC = 'elec',
  TEMP = 'temperature',
  ZERO = 'zero',
  SLOPE = 'slope',
  PPM = 'ppm',
  SENSITIVITY = 'sensitivity',
  OFFSET = 'offset',
}

export interface DeviceLatestMeasureDataType {
  ph?: number;
  mv?: number;
  temperature?: number;
  ppm?: number;
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

// MeasureHistory
export interface BasicMeasureHistory {
  ID: string;
  version: string;
}

export interface PhMeasureHistory extends BasicMeasureHistory {
  ph: number;
}

export interface ORPMeasureHistory extends BasicMeasureHistory {
  mv: number;
}

export interface NH3NMeasureHistory extends BasicMeasureHistory {
  ppm: number;
}

export interface FlourideMeasureHistory extends BasicMeasureHistory {
  ppm: number;
}

export type MeasureHistory =
  | PhMeasureHistory
  | ORPMeasureHistory
  | NH3NMeasureHistory
  | FlourideMeasureHistory;
