<template>
  <div class="mr-0 flex items-center justify-end gap-1 md:mr-0 md:justify-start">
    <ElButton
      v-for="button in actionButtons"
      :key="button.key"
      :type="button.type"
      size="default"
      :icon="button.icon"
      circle
      :class="button.class"
      @click="button.handler"
    />
  </div>

  <!-- Delete Confirmation Dialog -->
  <DeleteDialog
    v-model="showDeleteDialog"
    :is-crucial="true"
    :subject="t('project.project')"
    :target="projectTitle ?? ''"
    @confirm="handleDelete"
  />

  <!-- Share Project Dialog -->
  <!-- <ShareLinkDialog
    v-model="showShareDialog"
    :project-id="projectId"
    :subject="t('project.project')"
    :initial-is-shared="fetchedProject?.isShared"
  /> -->

  <!-- Collaborators Dialog -->
  <CollaboratorDialog v-model="showCollaboratorsDialog" :project-id="projectId" />

  <!-- Global Collaborators Dialog -->
  <!-- <GlobalCollaboratorsDialog v-model="showGlobalCollaboratorsDialog" /> -->
</template>

<script setup lang="ts">
import { Delete, User } from '@element-plus/icons-vue';
import { ElMessage } from 'element-plus';
import { ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRouter } from 'vue-router';

import CollaboratorDialog from '@/components/core/dialog/CollaboratorDialog.vue';
import DeleteDialog from '@/components/core/dialog/DeleteDialog.vue';
// import GlobalCollaboratorsDialog from '@/components/core/dialog/GlobalCollaboratorsDialog.vue';
import { useProject } from '@/composables/query/useProject';
import { getProjectStorageKey } from '@/utils/storage/projectStorage';

const props = defineProps<{
  projectId: string;
  projectTitle: string | undefined;
}>();

const { t } = useI18n();
const router = useRouter();
const { deleteProject } = useProject(props.projectId);

// Delete project
const showDeleteDialog = ref(false);
// Collaborators management
const showCollaboratorsDialog = ref(false);
// Global collaborators management
// const showGlobalCollaboratorsDialog = ref(false);

const actionButtons = [
  {
    key: 'collaborators',
    type: undefined,
    class: 'bg-primary-panel',
    icon: User,
    handler: () => (showCollaboratorsDialog.value = true),
  },
  // {
  //   key: 'globalCollaborators',
  //   type: undefined,
  //   class: 'bg-primary-panel',
  //   icon: UserFilled,
  //   handler: () => (showGlobalCollaboratorsDialog.value = true),
  // },
  {
    key: 'delete',
    type: 'danger',
    class: '',
    icon: Delete,
    handler: () => (showDeleteDialog.value = true),
  },
];

// Delete project
const handleDelete = async () => {
  try {
    await deleteProject(props.projectId);

    // 清除 localStorage 中該項目的儲存
    const storageKey = getProjectStorageKey(props.projectId);
    localStorage.removeItem(storageKey);

    ElMessage.success(t('message.success.deleted'));
    router.push({ name: 'todo-projects' });
  } catch (error) {
    console.error('Failed to delete project:', error);
    ElMessage.error(t('message.error.deleted'));
  } finally {
    showDeleteDialog.value = false;
  }
};
</script>

<style scoped></style>
