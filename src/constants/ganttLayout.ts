export const GANTT_LAYOUT = {
  headerProjectInfoHeight: 64, // px (專案資訊高度)
  monthRowHeight: 32,
  dateRowHeight: 32,
  noteRowHeight: 24,
  noteRowCount: 3,
  categoryRowHeight: 56,
  gridLineColor: '#e2e8f0',
} as const;

export const getGanttHeaderTotalHeight = (noteRowCount = GANTT_LAYOUT.noteRowCount) => {
  return (
    GANTT_LAYOUT.monthRowHeight +
    GANTT_LAYOUT.dateRowHeight +
    noteRowCount * GANTT_LAYOUT.noteRowHeight
  );
};

export const getGanttSidebarHeaderHeight = (noteRowCount = GANTT_LAYOUT.noteRowCount) => {
  return GANTT_LAYOUT.headerProjectInfoHeight + noteRowCount * GANTT_LAYOUT.noteRowHeight;
};
