import type { Device } from '@/types/device';
import type { GroupDetails, Groups, LocationDetails, Locations, Tags } from '@/types/entities';
import type { AxiosResponse } from 'axios';

import instance from '@/utils/request';

export const entitiesApi = {
  getLocations(): Promise<AxiosResponse<Locations>> {
    return instance.get('/entities/locations/');
  },
  getLocationDetails(location: string): Promise<AxiosResponse<LocationDetails>> {
    return instance.get(`/entities/locations/${location}/`);
  },
  getGroups(): Promise<AxiosResponse<Groups>> {
    return instance.get('/entities/groups/');
  },
  getGroupDetails(entityId: string): Promise<AxiosResponse<GroupDetails>> {
    return instance.get(`/entities/groups/${entityId}/`);
  },
  getTags(): Promise<AxiosResponse<Tags>> {
    return instance.get('/entities/tags/');
  },
  getTagDetails(tag: string): Promise<AxiosResponse<Device[]>> {
    return instance.get(`/entities/tags/${tag}/`);
  },
};
