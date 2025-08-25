import type { Device } from '@/types/device';

export interface Locations {
  locations: { name: string }[];
}

export interface LocationDetails {
  name: string;
  devices: Device[];
}

export interface Groups {
  groups: { name: string }[];
}

export interface Tags {
  tags: { name: string }[];
}

export interface GroupDetails {
  name: string;
  devices: Device[];
}

export interface TagDetails {
  name: string;
  devices: Device[];
}
