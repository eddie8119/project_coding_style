<template>
  <Loading v-if="isLoadingProjects" />

  <div v-else class="flex flex-col gap-8">
    <!-- 我創建的專案 -->
    <ProjectCollaboratorSection
      :title="t('title.owned_projects')"
      :projects="ownedProjectsData || []"
      :is-owner="true"
      :empty-message="t('message.no_owned_projects')"
      :selected-project-id="selectedProjectId"
      :selected-project="selectedProject"
      :collaborators="collaborators"
      :is-loading-collaborators="isLoadingCollaborators"
      :is-adding="isAdding"
      :is-updating="isUpdating"
      :is-removing="isRemoving"
      @select-project="selectProject"
      @add-collaborator="handleAddCollaborator"
      @update-role="handleUpdateRole"
      @remove-collaborator="handleRemoveCollaborator"
    />

    <!-- 我作為協作者的專案 -->
    <ProjectCollaboratorSection
      :title="t('title.collaborating_projects')"
      :projects="collaboratingProjectsData || []"
      :is-owner="false"
      :empty-message="t('message.no_collaborating_projects')"
      :selected-project-id="selectedProjectId"
      :selected-project="selectedProject"
      :collaborators="collaborators"
      :is-loading-collaborators="isLoadingCollaborators"
      :is-adding="false"
      :is-updating="false"
      :is-removing="false"
      @select-project="selectProject"
    />
  </div>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n';

import Loading from '@/components/core/loading/Loading.vue';
import ProjectCollaboratorSection from '@/components/setting/ProjectCollaboratorSection.vue';
import { useProjectCollaborators } from '@/composables/query/useCollaborators';
import { useProjectCollaboratorManagement } from '@/composables/query/useProjectCollaboratorManagement';

const { t } = useI18n();

// 專案管理（內部取得）
const {
  ownedProjects: ownedProjectsData,
  collaboratingProjects: collaboratingProjectsData,
  isLoadingProjects,
  selectedProjectId,
  selectedProject,
  selectProject,
} = useProjectCollaboratorManagement();

// 協作者（內部取得）
const {
  collaborators,
  isLoadingCollaborators,
  isAdding,
  isUpdating,
  isRemoving,
  handleAddCollaborator,
  handleUpdateRole,
  handleRemoveCollaborator,
} = useProjectCollaborators(selectedProjectId.value as string);
</script>
