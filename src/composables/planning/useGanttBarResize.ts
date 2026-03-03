import { onUnmounted, ref } from 'vue';

import type { GanttSchedule } from '@/types/gantt';

interface UseGanttBarResizeOptions {
  schedule: GanttSchedule;
  columnWidth: number;
  onUpdate: (payload: { id: string; startDate: Date; endDate: Date }) => void;
}

export const useGanttBarResize = (options: UseGanttBarResizeOptions) => {
  const { schedule, columnWidth, onUpdate } = options;

  const isResizing = ref(false);
  const resizeDirection = ref<'left' | 'right' | null>(null);
  const tempStartDate = ref<Date | null>(null);
  const tempEndDate = ref<Date | null>(null);

  const initialMouseX = ref(0);
  const initialStartDate = ref<Date | null>(null);
  const initialEndDate = ref<Date | null>(null);

  const addDays = (date: Date, days: number) => {
    const result = new Date(date);
    result.setDate(result.getDate() + days);
    return result;
  };

  const stopResize = () => {
    if (isResizing.value && tempStartDate.value && tempEndDate.value) {
      if (
        tempStartDate.value.getTime() !== schedule.startDate.getTime() ||
        tempEndDate.value.getTime() !== schedule.endDate.getTime()
      ) {
        onUpdate({
          id: schedule.id,
          startDate: tempStartDate.value,
          endDate: tempEndDate.value,
        });
      }
    }

    isResizing.value = false;
    resizeDirection.value = null;
    tempStartDate.value = null;
    tempEndDate.value = null;

    window.removeEventListener('mousemove', handleResize);
    window.removeEventListener('mouseup', stopResize);
  };

  const handleResize = (event: MouseEvent) => {
    if (
      !isResizing.value ||
      !resizeDirection.value ||
      !initialStartDate.value ||
      !initialEndDate.value
    ) {
      return;
    }

    const deltaX = event.clientX - initialMouseX.value;
    const deltaDays = Math.round(deltaX / columnWidth);

    if (resizeDirection.value === 'left') {
      const newStart = addDays(initialStartDate.value, deltaDays);
      if (newStart <= initialEndDate.value) {
        tempStartDate.value = newStart;
      } else {
        tempStartDate.value = initialEndDate.value;
      }
    } else {
      const newEnd = addDays(initialEndDate.value, deltaDays);
      if (newEnd >= initialStartDate.value) {
        tempEndDate.value = newEnd;
      } else {
        tempEndDate.value = initialStartDate.value;
      }
    }
  };

  const startResize = (event: MouseEvent, direction: 'left' | 'right') => {
    isResizing.value = true;
    resizeDirection.value = direction;
    initialMouseX.value = event.clientX;
    initialStartDate.value = new Date(schedule.startDate);
    initialEndDate.value = new Date(schedule.endDate);

    tempStartDate.value = new Date(schedule.startDate);
    tempEndDate.value = new Date(schedule.endDate);

    window.addEventListener('mousemove', handleResize);
    window.addEventListener('mouseup', stopResize);
  };

  onUnmounted(() => {
    window.removeEventListener('mousemove', handleResize);
    window.removeEventListener('mouseup', stopResize);
  });

  return {
    isResizing,
    tempStartDate,
    tempEndDate,
    startResize,
  };
};
