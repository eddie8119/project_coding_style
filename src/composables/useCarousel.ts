import { computed, nextTick, onActivated, onDeactivated, ref, watch } from 'vue';

export function useCarousel(listRef: { value: any[] }) {
  const carouselContainer = ref<HTMLElement | null>(null);
  const alertCard = ref<HTMLElement[] | null>(null);
  const pageSize = ref(3);
  const currentPage = ref(0);

  const updatePageSize = () => {
    if (!carouselContainer.value || !alertCard.value || alertCard.value.length === 0) return;
    const containerHeight = carouselContainer.value.clientHeight;
    const cardHeight = alertCard.value[0].clientHeight + 12; // 12px 為 space-y-3 間距
    const maxCards = Math.max(1, Math.floor(containerHeight / cardHeight));
    pageSize.value = maxCards;
  };

  const totalPages = computed(() => {
    return Math.ceil(listRef.value.length / pageSize.value);
  });

  const carouselList = computed(() => {
    const start = currentPage.value * pageSize.value;
    return listRef.value.slice(start, start + pageSize.value);
  });

  let intervalId: number | undefined;

  onActivated(() => {
    nextTick(() => {
      updatePageSize();
    });
    window.addEventListener('resize', updatePageSize);
    intervalId = window.setInterval(() => {
      if (totalPages.value > 0) {
        currentPage.value = (currentPage.value + 1) % totalPages.value;
      }
    }, 10000);
  });

  onDeactivated(() => {
    window.removeEventListener('resize', updatePageSize);
    if (intervalId) clearInterval(intervalId);
  });

  watch(
    () => listRef.value.length,
    () => {
      currentPage.value = 0;
      nextTick(() => {
        updatePageSize();
      });
    }
  );

  return {
    carouselContainer,
    alertCard,
    pageSize,
    currentPage,
    updatePageSize,
    totalPages,
    carouselList,
  };
}
