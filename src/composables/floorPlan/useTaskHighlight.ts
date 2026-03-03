import { computed, ref } from 'vue';

interface UseTaskHighlightOptions {
  defaultDuration?: number;
}

export const useTaskHighlight = (options?: UseTaskHighlightOptions) => {
  const defaultDuration = options?.defaultDuration ?? 1200;

  const hoveredTaskId = ref<string | null>(null);
  const flashedTaskId = ref<string | null>(null);
  let flashTimer: ReturnType<typeof setTimeout> | null = null;

  const clearFlashTimer = () => {
    if (flashTimer) {
      clearTimeout(flashTimer);
      flashTimer = null;
    }
  };

  const highlightTemporarily = (taskId: string, duration = defaultDuration) => {
    if (!taskId) return;
    clearFlashTimer();
    flashedTaskId.value = taskId;
    flashTimer = setTimeout(() => {
      flashedTaskId.value = null;
      flashTimer = null;
    }, duration);
  };

  const setHoveredTask = (taskId: string | null) => {
    hoveredTaskId.value = taskId;
  };

  const clearHoveredTask = () => {
    hoveredTaskId.value = null;
  };

  const clearFlashHighlight = () => {
    clearFlashTimer();
    flashedTaskId.value = null;
  };

  const highlightedTaskId = computed(() => hoveredTaskId.value ?? flashedTaskId.value);

  const dispose = () => {
    clearFlashTimer();
    hoveredTaskId.value = null;
    flashedTaskId.value = null;
  };

  return {
    highlightedTaskId,
    highlightTemporarily,
    setHoveredTask,
    clearHoveredTask,
    clearFlashHighlight,
    dispose,
  };
};
