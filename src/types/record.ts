// todo: GaugeProps 之後要改成 DeviceProps  就可以刪除了
export interface GaugeProps {
  ID: string;
  active: boolean;
  categories: string;
  group: string;
  high_alarm: number;
  high_bound: number;
  location: string;
  low_alarm: number;
  low_bound: number;
  main_unit: string;
  ph: number;
  product_name: string;
  tag: string;
  ts: string;
  version: string;
}

export interface DeviceProps {
  ID: string;
  active: boolean;
  categories: string;
  group: string;
  high_alarm: number;
  high_bound: number;
  location: string;
  low_alarm: number;
  low_bound: number;
  main_unit: string;
  ph: number;
  product_name: string;
  tag: string;
  ts: string;
  version: string;
}
