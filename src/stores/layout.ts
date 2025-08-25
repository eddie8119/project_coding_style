// import { useWindowSize } from '@vueuse/core';
// import { defineStore } from 'pinia';
// import { ref, computed } from 'vue';

// export const useLayoutStore = defineStore('layout', () => {
//   const LARGESCREEN = 992; // 992 px
//   const width = useWindowSize().width;
//   const isLargeScreen = computed(() => width.value > LARGESCREEN);

//   const menuToggleEvent = ref<Event | null>(null);

//   const setMenuToggleEvent = (event: Event) => {
//     menuToggleEvent.value = event;
//   };

//   return { width, isLargeScreen, menuToggleEvent, setMenuToggleEvent };
// });
