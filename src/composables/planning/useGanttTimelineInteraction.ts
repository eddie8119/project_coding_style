import { onMounted, onUnmounted, type Ref } from 'vue';

export function useGanttTimelineInteraction(
  containerRef: Ref<HTMLElement | null>,
  headerRef: Ref<HTMLElement | null>,
  hoveredDateIndex: Ref<number | null>
) {
  const handleDateHover = (index: number) => {
    hoveredDateIndex.value = index;
  };

  const clearDateHover = () => {
    hoveredDateIndex.value = null;
  };

  onMounted(() => {
    const container = containerRef.value;
    if (!container) return;

    const handleWheel = (event: WheelEvent) => {
      const { deltaX, deltaY } = event;

      if (Math.abs(deltaY) > Math.abs(deltaX)) {
        const outer = container.closest('.gantt-container') as HTMLElement | null;
        if (outer) {
          outer.scrollTop += deltaY;
          event.preventDefault();
        }
      }
    };

    // Drag to scroll logic
    let isDragging = false;
    let startX = 0;
    let initialScrollLeft = 0;

    const onMouseMove = (e: MouseEvent) => {
      if (!isDragging) return;
      e.preventDefault();
      const x = e.pageX;
      const walk = x - startX;
      container.scrollLeft = initialScrollLeft - walk;
    };

    const onMouseUp = () => {
      isDragging = false;
      container.style.cursor = 'grab';
      container.style.removeProperty('user-select');

      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
    };

    const onMouseDown = (e: MouseEvent) => {
      // Ignore if clicking on interactive elements that should handle their own events
      if (e.defaultPrevented) return;

      // Only allow left mouse button
      if (e.button !== 0) return;

      isDragging = true;
      startX = e.pageX;
      initialScrollLeft = container.scrollLeft;

      container.style.cursor = 'grabbing';
      container.style.userSelect = 'none';

      window.addEventListener('mousemove', onMouseMove);
      window.addEventListener('mouseup', onMouseUp);
    };

    // Initial cursor style
    container.style.cursor = 'grab';

    container.addEventListener('mousedown', onMouseDown);
    container.addEventListener('wheel', handleWheel, { passive: false });

    const outer = container.closest('.gantt-container') as HTMLElement | null;
    const header = headerRef.value;

    if (outer && header) {
      const handleScroll = () => {
        const offset = outer.scrollTop;
        header.style.transform = `translateY(${offset}px)`;
      };

      handleScroll();
      outer.addEventListener('scroll', handleScroll, { passive: true });

      onUnmounted(() => {
        outer.removeEventListener('scroll', handleScroll);
        header.style.transform = '';
        container.removeEventListener('wheel', handleWheel as EventListener);

        container.removeEventListener('mousedown', onMouseDown);
        window.removeEventListener('mousemove', onMouseMove);
        window.removeEventListener('mouseup', onMouseUp);
      });
    } else {
      onUnmounted(() => {
        container.removeEventListener('wheel', handleWheel as EventListener);

        container.removeEventListener('mousedown', onMouseDown);
        window.removeEventListener('mousemove', onMouseMove);
        window.removeEventListener('mouseup', onMouseUp);
      });
    }
  });

  return {
    handleDateHover,
    clearDateHover,
  } as const;
}
