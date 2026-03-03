import { computed } from 'vue';

import { GANTT_LAYOUT } from '@/constants/ganttLayout';

export const useGanttTimelineLayout = (columnWidth: number) => {
  const gridBackgroundStyle = computed(() => ({
    backgroundImage:
      'linear-gradient(to right, var(--gantt-grid-line) 0, var(--gantt-grid-line) 1px, transparent 1px, transparent 100%)',
    backgroundSize: `${columnWidth}px 100%`,
    backgroundRepeat: 'repeat',
    backgroundPosition: '0 0',
  }));

  const monthRowStyle = computed(() => ({
    height: `${GANTT_LAYOUT.monthRowHeight}px`,
  }));

  const dateRowStyle = computed(() => ({
    height: `${GANTT_LAYOUT.dateRowHeight}px`,
  }));

  const noteRowStyle = computed(() => ({
    height: `${GANTT_LAYOUT.noteRowHeight}px`,
  }));

  const categoryRowStyle = computed(() => ({
    height: `${GANTT_LAYOUT.categoryRowHeight}px`,
  }));

  return {
    gridBackgroundStyle,
    monthRowStyle,
    dateRowStyle,
    noteRowStyle,
    categoryRowStyle,
  };
};
