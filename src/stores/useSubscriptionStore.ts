import { defineStore } from 'pinia';
import { computed, ref } from 'vue';

import { SUBSCRIPTION_PLAN_LIMITS } from '@/config/subscriptionPlanLimits';
import { useProjectsStore } from '@/stores/useProjectsStore';

export const useSubscriptionStore = defineStore('subscription', () => {
  // 所有專案列表（由 useProjects composable 同步）
  const projectsStore = useProjectsStore();

  // 目前使用者方案（預設 free，可之後由後端資料覆蓋）
  const currentPlan = ref<keyof typeof SUBSCRIPTION_PLAN_LIMITS>('free');

  // 設定目前方案
  function setPlan(plan: keyof typeof SUBSCRIPTION_PLAN_LIMITS) {
    if (SUBSCRIPTION_PLAN_LIMITS[plan]) {
      currentPlan.value = plan;
    }
  }

  // ===== 訂閱規則 / 權限判斷 =====
  const maxProjects = computed(() => SUBSCRIPTION_PLAN_LIMITS[currentPlan.value].maxProjects);
  const projectCount = computed(() => projectsStore.projects.length);
  const canCreateProject = computed(() => projectCount.value < maxProjects.value);

  // domain helper：回傳可否建立專案與相關資訊，給 UI 使用
  const getCreateProjectLimitStatus = () => ({
    allowed: canCreateProject.value,
    limit: maxProjects.value,
    count: projectCount.value,
    plan: currentPlan.value,
  });

  return {
    // state
    currentPlan,

    // actions
    setPlan,

    // computed / domain
    maxProjects,
    projectCount,
    canCreateProject,
    getCreateProjectLimitStatus,
  };
});
