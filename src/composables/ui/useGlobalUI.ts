import { computed, ref } from 'vue';
import { type RouteMeta, useRoute } from 'vue-router';

import { initTheme, setTheme } from '@/utils/theme';

interface GlobalUiMeta extends RouteMeta {
  showFab?: boolean;
  showQuickDraft?: boolean;
  showQuickPlan?: boolean;
  showNotification?: boolean;
}

export function useGlobalUI() {
  const route = useRoute();

  // Theme management
  const isDarkMode = ref<boolean>(initTheme());

  const routeUiMeta = computed<Required<GlobalUiMeta>>(() => {
    const meta = route.meta as GlobalUiMeta;
    return {
      showFab: meta.showFab ?? true,
      showQuickDraft: meta.showQuickDraft ?? true,
      showQuickPlan: meta.showQuickPlan ?? true,
      showNotification: meta.showNotification ?? true,
    } as const;
  });

  // Global component visibility
  const shouldShowQuickDraft = computed(() => routeUiMeta.value.showQuickDraft);
  const shouldShowQuickPlan = computed(() => routeUiMeta.value.showQuickPlan);
  const shouldShowNotification = computed(() => routeUiMeta.value.showNotification);
  const shouldShowFab = computed(() => routeUiMeta.value.showFab);

  return {
    isDarkMode,
    shouldShowQuickDraft,
    shouldShowQuickPlan,
    shouldShowNotification,
    shouldShowFab,
    setTheme,
  };
}
