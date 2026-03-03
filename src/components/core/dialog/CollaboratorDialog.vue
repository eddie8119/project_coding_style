<template>
  <BasicEditDialog
    v-model="dialogVisible"
    :title="t('title.manage_project_collaborators')"
    :is-submitting="isSubmitting"
    :error-message="errorMessage"
    :show-footer-button="false"
    @cancel="onCancel"
  >
    <p class="text-color-difference mb-4 text-sm">
      {{ t('dialog.collaborators_description') }}
    </p>
    <CollaboratorManagement
      :key="resetKey"
      :collaborators="collaborators || []"
      :is-loading="isLoadingCollaborators"
      :is-adding="isAdding"
      :is-updating="isUpdating"
      :is-removing="isRemoving"
      :empty-message="t('message.sign.no_collaborators')"
      @add="handleAddCollaborator"
      @update-role="handleUpdateRole"
      @remove="handleRemoveCollaborator"
    />
  </BasicEditDialog>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';

import type { CollaboratorRole } from '@/types/response';

import CollaboratorManagement from '@/components/collaborator/CollaboratorManagement.vue';
import BasicEditDialog from '@/components/core/dialog/BasicEditDialog.vue';
import { useProjectCollaborators } from '@/composables/query/useCollaborators';
import { useDialogReset } from '@/composables/useDialogReset';

const props = defineProps<{
  modelValue: boolean;
  projectId: string;
}>();

const emit = defineEmits<{
  'update:modelValue': [value: boolean];
  confirm: [];
}>();

const { t } = useI18n();

const errorMessage = ref<string>('');
const isSubmitting = ref(false);
const resetKey = ref(0);

const dialogVisible = computed({
  get: () => props.modelValue,
  set: (value: boolean) => emit('update:modelValue', value),
});

const {
  collaborators,
  isLoadingCollaborators,
  addCollaborator,
  updateCollaborator,
  removeCollaborator,
  isAdding,
  isUpdating,
  isRemoving,
  refetch,
} = useProjectCollaborators(props.projectId);

// Refetch when dialog opens
watch(dialogVisible, (newValue: boolean) => {
  if (newValue) {
    refetch();
  }
});

const handleAddCollaborator = (payload: { collaboratorEmail: string; role: CollaboratorRole }) => {
  addCollaborator(payload);
};

const handleUpdateRole = (payload: { collaboratorId: string; role: CollaboratorRole }) => {
  updateCollaborator(payload);
};

const handleRemoveCollaborator = (collaboratorId: string) => {
  removeCollaborator(collaboratorId);
};

const resetDialogState = () => {
  errorMessage.value = '';
  isSubmitting.value = false;
  resetKey.value += 1;
};

const { createCancelHandler } = useDialogReset(() => props.modelValue, resetDialogState);
const onCancel = createCancelHandler(() => emit('update:modelValue', false));
</script>
