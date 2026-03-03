<template>
  <TextButton
    variant="primary"
    size="md"
    class="my-4 h-[30px] w-full px-6 md:w-auto"
    @click="handleCreateProject"
  >
    {{ t('button.create_project') }}
  </TextButton>

  <!-- 建立專案對話框 -->
  <CreateProjectDialog v-model="showCreateProjectDialog" />

  <ProjectsSection />
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useI18n } from 'vue-i18n';

import TextButton from '@/components/core/button/TextButton.vue';
import CreateProjectDialog from '@/components/core/dialog/CreateProjectDialog.vue';
import ProjectsSection from '@/components/projects/ProjectsSection.vue';
import { useProjectCreationGuard } from '@/composables/guard/useProjectCreationGuard';

const { t } = useI18n();

const showCreateProjectDialog = ref(false);
const { ensureCanCreateProject } = useProjectCreationGuard();

const handleCreateProject = () => {
  if (!ensureCanCreateProject()) return;

  showCreateProjectDialog.value = true;
};
</script>

<style scoped></style>
