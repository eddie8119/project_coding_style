import { computed, ref, type Ref, watch } from 'vue';

export function useCarousel<T>(items: Ref<T[]> | T[], initialIndex: number | Ref<number> = 0) {
  const currentIndex = ref(typeof initialIndex === 'number' ? initialIndex : initialIndex.value);

  // Normalize items to a Ref
  const itemsRef = computed(() => (Array.isArray(items) ? items : items.value));

  // Sync with initialIndex if it's a ref
  if (typeof initialIndex !== 'number') {
    watch(
      initialIndex,
      (newVal) => {
        currentIndex.value = newVal;
      },
      { immediate: true }
    );
  }

  const hasNext = computed(() => {
    return itemsRef.value && currentIndex.value < itemsRef.value.length - 1;
  });

  const hasPrev = computed(() => {
    return itemsRef.value && currentIndex.value > 0;
  });

  const next = () => {
    if (!itemsRef.value || !itemsRef.value.length) return;
    currentIndex.value = (currentIndex.value + 1) % itemsRef.value.length;
  };

  const prev = () => {
    if (!itemsRef.value || !itemsRef.value.length) return;
    currentIndex.value = (currentIndex.value - 1 + itemsRef.value.length) % itemsRef.value.length;
  };

  const goTo = (index: number) => {
    if (!itemsRef.value || !itemsRef.value.length) return;
    const newIndex = Math.min(Math.max(index, 0), itemsRef.value.length - 1);
    currentIndex.value = newIndex;
  };

  return {
    currentIndex,
    hasNext,
    hasPrev,
    next,
    prev,
    goTo,
  };
}
