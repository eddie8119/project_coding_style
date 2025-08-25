// import type { Device } from '@/types/device';

// import { deviceApi } from '@/api/device';
// import { entitiesApi } from '@/api/entities';

// export function useEntityDetails() {
//   /**
//    * Get entity details based on category and entity ID
//    * @param category - The category of the entity (group, tag, id)
//    * @param entityId - The ID of the entity
//    * @returns Array of device data
//    */
//   const getEntityDetails = async (category: string, entityId: string): Promise<Device[]> => {
//     if (!category || !entityId) {
//       return [];
//     }

//     try {
//       let response;

//       switch (category) {
//         case 'group':
//           response = await entitiesApi.getGroupDetails(entityId);
//           break;
//         case 'tag':
//           response = await entitiesApi.getTagDetails(entityId);
//           break;
//         case 'id':
//           response = await deviceApi.getDevice(entityId);
//           break;
//         default:
//           console.warn(`Unknown category: ${category}`);
//           return [];
//       }

//       return response?.data?.devices || [];
//     } catch (error) {
//       console.error(`Error fetching entity details for ${category}/${entityId}:`, error);
//       return [];
//     }
//   };

//   return {
//     getEntityDetails,
//   };
// }
