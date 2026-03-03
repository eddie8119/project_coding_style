import { eachDayOfInterval, isSameMonth } from 'date-fns';
import { computed } from 'vue';

import type { ExcelDateColumn, GanttTimelineDateProps, MonthSegment } from '@/types/gantt';

const DEFAULT_COLUMN_WIDTH = 45;

export function useGanttTimelineDates(
  props: GanttTimelineDateProps,
  columnWidth: number = DEFAULT_COLUMN_WIDTH
) {
  const projectDateColumns = computed<ExcelDateColumn[]>(() => {
    if (props.dateColumns && props.dateColumns.length > 0) {
      return props.dateColumns;
    }

    const { startDate, endDate } = props.dateRange;
    if (!startDate || !endDate) return [];

    const dates = eachDayOfInterval({
      start: new Date(startDate),
      end: new Date(endDate),
    });

    return dates.map((date, index) => ({
      date,
      colIndex: index + 1,
    }));
  });

  const dateColumnDates = computed(() => projectDateColumns.value.map((col) => col.date));

  const timelineContentWidth = computed(() => dateColumnDates.value.length * columnWidth);

  const monthSegments = computed<MonthSegment[]>(() => {
    const dates = dateColumnDates.value;
    const segments: MonthSegment[] = [];

    if (dates.length === 0) return segments;

    let segmentStartIndex = 0;

    for (let i = 1; i <= dates.length; i += 1) {
      const prevDate = dates[segmentStartIndex];
      const currentDate = dates[i];

      if (!currentDate || !isSameMonth(currentDate, prevDate)) {
        const span = i - segmentStartIndex;
        segments.push({
          key: `${prevDate.getFullYear()}-${prevDate.getMonth()}`,
          date: prevDate,
          span,
        });

        segmentStartIndex = i;
      }
    }

    return segments;
  });

  const formatDay = (date: Date): string => {
    return date.getDate().toString();
  };

  const isWeekend = (date: Date): boolean => {
    const day = date.getDay();
    return day === 0 || day === 6;
  };

  return {
    columnWidth,
    projectDateColumns,
    dateColumnDates,
    timelineContentWidth,
    monthSegments,
    formatDay,
    isWeekend,
  } as const;
}
