import type { Device, DeviceDevice, Devices } from '@/types/device';
import type { AxiosResponse } from 'axios';

import instance from '@/utils/request';

export const deviceApi = {
  getDevices(params?: Record<string, string>): Promise<AxiosResponse<Devices>> {
    return instance.get('/devices/', { params });
  },
  getDevice(entityId: string): Promise<AxiosResponse<DeviceDevice>> {
    return instance.get(`/devices/${entityId}/`);
  },
  patchDevice(deviceID: string, device_details: Partial<Device>): Promise<AxiosResponse<Device>> {
    return instance.patch(`/devices/${deviceID}/`, device_details);
  },
};
