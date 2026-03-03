import { computed, unref } from 'vue';

import type { ExcelCell, GanttNoteType } from '@/types/gantt';
import type { MaybeRef } from 'vue';

type NoteCellsRef = MaybeRef<ExcelCell[] | undefined>;

const buildCellMap = (cells?: ExcelCell[]) => {
  const map = new Map<number, ExcelCell>();
  (cells ?? []).forEach((cell) => {
    map.set(cell.startDate.getTime(), cell);
  });
  return map;
};

export function useGanttTimelineNotes(props: {
  specialHolidays: NoteCellsRef;
  paymentRemittances: NoteCellsRef;
  preConstructionNotes: NoteCellsRef;
}) {
  const specialHolidayMap = computed<Map<number, ExcelCell>>(() => {
    return buildCellMap(unref(props.specialHolidays));
  });

  const paymentRemittanceMap = computed<Map<number, ExcelCell>>(() => {
    return buildCellMap(unref(props.paymentRemittances));
  });

  const preConstructionMap = computed<Map<number, ExcelCell>>(() => {
    return buildCellMap(unref(props.preConstructionNotes));
  });

  const noteRows = [
    { id: 'special' as GanttNoteType, map: specialHolidayMap },
    { id: 'payment' as GanttNoteType, map: paymentRemittanceMap },
    { id: 'preparation' as GanttNoteType, map: preConstructionMap },
  ] as const;

  return {
    specialHolidayMap,
    paymentRemittanceMap,
    preConstructionMap,
    noteRows,
  } as const;
}
