<template>
  <div class="flex flex-col gap-4">
    <!-- Add Collaborator Section -->
    <div class="flex items-center gap-2">
      <ElInput
        v-model="newCollaboratorEmail"
        :placeholder="t('placeholder.email')"
        :disabled="isAdding"
        @keyup.enter="handleAddCollaborator"
      />
      <OptionSelector
        v-model="newCollaboratorRole"
        :options="COLLABORATOR_ROLE_OPTIONS"
        class-name="w-[150px]"
        namespace="role"
      />
      <TextButton
        :loading="isAdding"
        :disabled="isAdding"
        variant="primary"
        size="sm"
        class="h-[30px] w-[70px]"
        @click="handleAddCollaborator"
      >
        {{ t('button.add') }}
      </TextButton>
    </div>

    <!-- Collaborators List -->
    <div v-if="isLoading" class="flex justify-center py-8">
      <ElIcon class="is-loading" :size="24">
        <Loading />
      </ElIcon>
    </div>
    <ElTable
      v-else-if="collaborators && collaborators.length > 0"
      :data="collaborators"
      style="width: 100%"
    >
      <ElTableColumn :label="t('column.email')">
        <template #default="scope">
          <div class="flex items-center gap-2">
            <span>{{ scope.row.collaboratorEmail }}</span>
            <ElTag v-if="scope.row.isGlobal" size="small" type="success">
              {{ t('label.global') }}
            </ElTag>
          </div>
        </template>
      </ElTableColumn>
      <ElTableColumn :label="t('column.role')" width="180">
        <template #default="scope">
          <div class="flex flex-col gap-1">
            <OptionSelector
              :model-value="scope.row.role"
              :options="COLLABORATOR_ROLE_OPTIONS"
              namespace="role"
              :disabled="isUpdating || scope.row.isGlobal"
              @update:model-value="(value) => onRoleChange(scope.row.id, value)"
            />
            <span v-if="scope.row.isGlobal && scope.row.globalRole" class="text-xs text-gray-500">
              {{ t('label.collaborator.global_default') }}:
              {{ t(`option.role.${scope.row.globalRole}`) }}
            </span>
          </div>
        </template>
      </ElTableColumn>
      <ElTableColumn :label="t('column.action')" width="100">
        <template #default="scope">
          <TextButton
            v-if="!scope.row.isGlobal"
            :loading="isRemoving"
            :disabled="isRemoving"
            size="sm"
            variant="outline"
            @click="handleRemoveCollaborator(scope.row.id)"
          >
            {{ t('button.remove') }}
          </TextButton>
          <span v-else class="text-xs text-gray-500">
            {{ t('label.collaborator.global_managed') }}
          </span>
        </template>
      </ElTableColumn>
    </ElTable>
    <p v-else class="py-8 text-center text-gray-500">{{ emptyMessage }}</p>
  </div>
</template>

<script setup lang="ts">
import { Loading } from '@element-plus/icons-vue';
import { ElMessage } from 'element-plus';
import { ref } from 'vue';
import { useI18n } from 'vue-i18n';

import type { CollaboratorRole, ProjectCollaboratorResponse } from '@/types/response';

import TextButton from '@/components/core/button/TextButton.vue';
import OptionSelector from '@/components/ui/OptionSelector.vue';
import { COLLABORATOR_ROLE_OPTIONS } from '@/constants/selection';

type Collaborator = Pick<ProjectCollaboratorResponse, 'id' | 'collaboratorEmail' | 'role'>;

defineProps<{
  collaborators: Collaborator[];
  isLoading: boolean;
  isAdding: boolean;
  isUpdating: boolean;
  isRemoving: boolean;
  emptyMessage: string;
}>();

const emit = defineEmits<{
  add: [payload: { collaboratorEmail: string; role: CollaboratorRole }];
  updateRole: [payload: { collaboratorId: string; role: CollaboratorRole }];
  remove: [collaboratorId: string];
}>();

const { t } = useI18n();

const newCollaboratorEmail = ref('');
const newCollaboratorRole = ref<CollaboratorRole>('viewer');

const handleAddCollaborator = () => {
  if (!newCollaboratorEmail.value || !newCollaboratorEmail.value.includes('@')) {
    ElMessage.warning(t('message.invalid_email'));
    return;
  }

  emit('add', {
    collaboratorEmail: newCollaboratorEmail.value,
    role: newCollaboratorRole.value,
  });

  newCollaboratorEmail.value = '';
  newCollaboratorRole.value = 'viewer';
};

const onRoleChange = (collaboratorId: string, value: unknown) => {
  const role = value as CollaboratorRole;
  emit('updateRole', { collaboratorId, role });
};

const handleRemoveCollaborator = (collaboratorId: string) => {
  emit('remove', collaboratorId);
};
</script>
