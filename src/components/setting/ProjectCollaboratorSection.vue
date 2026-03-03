<template>
  <div class="flex flex-col">
    <H2Title :title="title" />
    <!-- 空狀態 -->
    <div
      v-if="projects.length === 0"
      class="rounded-lg border border-dashed border-gray-300 p-8 text-center"
    >
      <p class="text-gray-500">{{ emptyMessage }}</p>
    </div>

    <div v-else class="flex flex-wrap gap-4">
      <ProjectCollaboratorCard
        v-for="project in projects"
        :key="project.id"
        :project="project"
        :is-owner="isOwner"
        :collaborator-count="getCollaboratorCount(project.id)"
        :selected-project-id="selectedProjectId"
        :collaborators="collaborators"
        :is-loading-collaborators="isLoadingCollaborators"
        :is-adding="isAdding"
        :is-updating="isUpdating"
        :is-removing="isRemoving"
        @expand="handleSelectProject"
        @collapse="handleCloseCollaborators"
        @add="handleAddCollaborator"
        @update-role="handleUpdateRole"
        @remove="handleRemoveCollaborator"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import type {
  CollaboratorRole,
  ProjectCollaboratorResponse,
  ProjectResponse,
} from '@/types/response';

import H2Title from '@/components/core/title/H2Title.vue';
import ProjectCollaboratorCard from '@/components/setting/ProjectCollaboratorCard.vue';

type Collaborator = ProjectCollaboratorResponse;

const props = defineProps<{
  title: string;
  projects: ProjectResponse[];
  isOwner: boolean;
  emptyMessage: string;
  selectedProjectId: string | null;
  selectedProject: ProjectResponse | null;
  collaborators: Collaborator[] | undefined;
  isLoadingCollaborators: boolean;
  isAdding: boolean;
  isUpdating: boolean;
  isRemoving: boolean;
  collaboratorCounts?: Record<string, number>;
}>();

const emit = defineEmits<{
  selectProject: [projectId: string | null];
  addCollaborator: [payload: { collaboratorEmail: string; role: CollaboratorRole }];
  updateRole: [payload: { collaboratorId: string; role: CollaboratorRole }];
  removeCollaborator: [collaboratorId: string];
}>();

const handleSelectProject = (projectId: string) => {
  emit('selectProject', projectId);
};

const handleCloseCollaborators = () => {
  emit('selectProject', null);
};

const handleAddCollaborator = (payload: { collaboratorEmail: string; role: CollaboratorRole }) => {
  emit('addCollaborator', payload);
};

const handleUpdateRole = (payload: { collaboratorId: string; role: CollaboratorRole }) => {
  emit('updateRole', payload);
};

const handleRemoveCollaborator = (collaboratorId: string) => {
  emit('removeCollaborator', collaboratorId);
};

const getCollaboratorCount = (projectId: string): number | undefined => {
  return props.collaboratorCounts?.[projectId];
};
</script>
