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

export interface DeviceMeasurementDataType {
  ph: number;
  mv: number;
  temperature: number;
  ppm?: number;
}

export interface DeviceLatestCalibrationDataType {
  zero: number;
  slope: number;
  sensitivity?: number;
  offset?: number;
}

export interface DeviceLatestMeasureDataType {
  ph?: number;
  mv?: number;
  temperature?: number;
  ppm?: number;
}
