// import { datetimeToString } from './common';
// import { getTagById } from './tag';

// import type { StatisticsData } from '@/types/datainsight';
// import type { Tag } from '@/types/tag';

// /**
//  * Interface for transformed statistics data row
//  */
// export interface TransformedStatistic {
//   ID: string;
//   tag: string;
//   unit: string;
//   avg: string | null;
//   max: number | null;
//   max_t: string | null;
//   min: number | null;
//   min_t: string | null;
// }

// /**
//  * Transform raw statistics data into table-friendly format
//  * @param statistics Raw statistics data array
//  * @param tags Tags object for ID-to-tag mapping
//  * @returns Transformed statistics data for table display
//  */
// export function transformStatistics(
//   statistics: StatisticsData[],
//   tags: Record<string, Tag> = {}
// ): TransformedStatistic[] {
//   const result: TransformedStatistic[] = [];

//   if (!statistics || statistics.length === 0) {
//     return [];
//   }

//   for (const stat of statistics) {
//     // Find all measurement units (ph, mv, temperature, etc.)
//     const units = new Set<string>();

//     for (const key of Object.keys(stat)) {
//       if (key.includes('_')) {
//         const unit = key.split('_')[1];
//         if (unit && !['ts'].includes(unit)) {
//           units.add(unit);
//         }
//       }
//     }

//     // Create a row for each unit
//     for (const unit of Array.from(units)) {
//       // Use type assertion for dynamic property access
//       const countKey = `count_${unit}` as keyof typeof stat;
//       const sumKey = `sum_${unit}` as keyof typeof stat;
//       const maxKey = `max_${unit}` as keyof typeof stat;
//       const minKey = `min_${unit}` as keyof typeof stat;
//       const maxTsKey = `max_${unit}_ts` as keyof typeof stat;
//       const minTsKey = `min_${unit}_ts` as keyof typeof stat;

//       const count = stat[countKey] as number | undefined;
//       const sum = stat[sumKey] as number | undefined;
//       const max = stat[maxKey] as number | undefined;
//       const min = stat[minKey] as number | undefined;
//       const maxTs = stat[maxTsKey] as string | undefined;
//       const minTs = stat[minTsKey] as string | undefined;

//       const avg = count && sum ? (sum / count).toFixed(3) : null;
//       const maxFormatted = max || null;
//       const minFormatted = min || null;
//       const maxTsFormatted = maxTs ? datetimeToString(Number(maxTs)) : null;
//       const minTsFormatted = minTs ? datetimeToString(Number(minTs)) : null;

//       result.push({
//         ID: stat.ID,
//         tag: getTagById(tags, stat.ID)?.name || stat.ID,
//         unit: unit,
//         avg: avg,
//         max: maxFormatted,
//         max_t: maxTsFormatted,
//         min: minFormatted,
//         min_t: minTsFormatted,
//       });
//     }
//   }

//   return result;
// }
