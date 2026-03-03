import { computed, onMounted, type Ref } from 'vue';

export const useGanttToday = (
  dateColumnDates: Ref<Date[]>,
  columnWidth: number,
  containerRef: Ref<HTMLElement | null>
) => {
  const getMidnightTimestamp = (date: Date): number => {
    return new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime();
  };

  const todayMidnightTimestamp = getMidnightTimestamp(new Date());

  const isToday = (date: Date): boolean => getMidnightTimestamp(date) === todayMidnightTimestamp;

  const todayColumnIndex = computed<number | null>(() => {
    if (!dateColumnDates.value.length) return null;

    const index = dateColumnDates.value.findIndex((d) => isToday(d));

    return index >= 0 ? index : null;
  });

  const todayGuidelineLeft = computed<number | null>(() => {
    if (todayColumnIndex.value === null) return null;
    return todayColumnIndex.value * columnWidth;
  });

  onMounted(() => {
    if (!containerRef.value || todayColumnIndex.value === null) return;

    const container = containerRef.value;

    const targetCenterX = todayColumnIndex.value * columnWidth + columnWidth / 2;
    const desiredScrollLeft = Math.max(targetCenterX - container.clientWidth * 0.3, 0);

    container.scrollLeft = desiredScrollLeft;
  });

  return {
    isToday,
    todayColumnIndex,
    todayGuidelineLeft,
  };
};
