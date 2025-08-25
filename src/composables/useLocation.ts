/**
 * 用於提供位置相關的功能，包括獲取位置列表、位置詳情等
 *
 * @returns {Object} 返回位置相關的狀態和方法
 */

// import { ElMessage } from 'element-plus';
// import { ref } from 'vue';

// import { useUpdateTime } from './useUpdateTime';

// import type { LocationData } from '@/types/location';
// import type { Ref } from 'vue/dist/vue.js';

// import { entitiesApi } from '@/api/entities';

// interface UseLocationReturn {
//   locationIndex: Ref<number>;
//   locationDetailsCache: Record<string, Awaited<ReturnType<typeof entitiesApi.getLocationDetails>>>;
//   error: Ref<Error | null>;
//   fetchLocations: () => Promise<{ locations: LocationData[] }>;
//   getLocationDetails: (
//     locationName: string
//   ) => Promise<Awaited<ReturnType<typeof entitiesApi.getLocationDetails>>> | null;
// }

// export const useLocation = (): UseLocationReturn => {
//   const { updateLastUpdateTime } = useUpdateTime();
//   const locationIndex = ref<number>(0);
//   const locationDetailsCache = ref<
//     Record<string, Awaited<ReturnType<typeof entitiesApi.getLocationDetails>>>
//   >({});
//   const error = ref<Error | null>(null);

//   const fetchLocations = async () => {
//     try {
//       locationIndex.value = 0;
//       const response = await entitiesApi.getLocations();
//       return { locations: response.data.locations };
//     } catch (err) {
//       console.error('Error fetching locations:', err);
//       ElMessage.error('Failed to fetch locations');
//       error.value = err as Error;
//       throw err;
//     }
//   };

//   const getLocationDetails = async (locationName: string) => {
//     if (!locationName) return null;

//     try {
//       // Check cache first
//       if (!locationDetailsCache.value[locationName]) {
//         const response = await entitiesApi.getLocationDetails(locationName);
//         locationDetailsCache.value[locationName] = response;
//         updateLastUpdateTime();
//         return response;
//       }

//       return locationDetailsCache.value[locationName];
//     } catch (err) {
//       console.error('Error fetching location details:', err);
//       ElMessage.error('Failed to fetch location details');
//       error.value = err as Error;
//       return null;
//     }
//   };

//   return {
//     locationIndex,
//     locationDetailsCache,
//     error,
//     fetchLocations,
//     getLocationDetails,
//   };
// };
