import { ElMessage } from 'element-plus';
import { storeToRefs } from 'pinia';
import { useI18n } from 'vue-i18n';

import { useProjects } from '@/composables/query/useProjects';
import { useSubscriptionStore } from '@/stores/useSubscriptionStore';

export const useProjectCreationGuard = () => {
  const { t } = useI18n();

  // Keep project list in sync so subscription limits are accurate
  useProjects();

  const subscriptionStore = useSubscriptionStore();
  const { canCreateProject, maxProjects } = storeToRefs(subscriptionStore);

  const ensureCanCreateProject = () => {
    if (canCreateProject.value) {
      return true;
    }

    ElMessage.warning(
      t('message.error.project_limit_reached', {
        limit: maxProjects.value,
      })
    );

    return false;
  };

  return {
    canCreateProject,
    maxProjects,
    ensureCanCreateProject,
  };
};
