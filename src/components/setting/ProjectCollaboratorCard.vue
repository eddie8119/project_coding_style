<template>
  <div
    :class="[
      'flex min-h-[120px] w-[220px] cursor-pointer flex-col rounded-lg bg-primary-card p-4 transition-all hover:shadow-md focus:outline-none focus:ring-2 focus:ring-primary',
      isExpanded ? 'w-full basis-full' : '',
    ]"
    role="button"
    tabindex="0"
    @click="handleToggle"
    @keydown.enter.prevent="handleToggle"
    @keydown.space.prevent="handleToggle"
  >
    <header class="flex items-center justify-between">
      <router-link class="toggle-button" :to="{ path: `/todo/project/${project.id}` }">
        <h3 class="line-clamp-1 text-base font-semibold">{{ project.title }}</h3>
      </router-link>

      <button
        type="button"
        class="h-6 w-6 rounded bg-black-100 hover:bg-gray-100"
        :aria-label="isExpanded ? t('button.close') : t('button.fold.expand')"
        @click.stop="handleToggle"
      >
        <ElIcon class="text-gray-600">
          <component :is="isExpanded ? ArrowLeft : ArrowRight" />
        </ElIcon>
      </button>
    </header>

    <div class="mt-2 text-sm text-gray-600">
      <span v-if="collaboratorCount !== undefined">
        {{ t('label.collaborator_count', { count: collaboratorCount }) }}
      </span>
    </div>

    <!-- 協作者管理區域：當前卡片被選中時顯示 -->
    <div
      v-if="isExpanded"
      class="mt-3 rounded-xl border border-gray-200 bg-gray-50 p-4"
      @click.stop
    >
      <div class="mb-3 flex items-center justify-between">
        <div>
          <h3 class="text-base font-semibold">
            {{ t('title.manage_collaborators') }}: {{ project.title }}
          </h3>
          <p class="mt-1 text-sm text-gray-600">
            {{
              isOwner
                ? t('description.manage_project_collaborators_owner')
                : t('description.manage_project_collaborators_member')
            }}
          </p>
        </div>
      </div>

      <!-- 只有擁有者才能管理協作者 -->
      <div v-if="isOwner">
        <CollaboratorManagement
          :collaborators="collaborators || []"
          :is-loading="isLoadingCollaborators"
          :is-adding="isAdding"
          :is-updating="isUpdating"
          :is-removing="isRemoving"
          :empty-message="t('message.no_collaborators')"
          @add="onAddCollaborator"
          @update-role="onUpdateRole"
          @remove="onRemoveCollaborator"
        />
      </div>

      <!-- 協作者只能查看 -->
      <div v-else>
        <div v-if="isLoadingCollaborators" class="flex justify-center py-6">
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
              </div>
            </template>
          </ElTableColumn>
          <ElTableColumn :label="t('column.role')" width="150">
            <template #default="scope">
              {{ t(`option.role.${scope.row.role}`) }}
            </template>
          </ElTableColumn>
        </ElTable>
        <p v-else class="py-6 text-center text-gray-500">
          {{ t('message.no_collaborators') }}
        </p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ArrowLeft, ArrowRight, Loading } from '@element-plus/icons-vue';
import { ElIcon, ElTable, ElTableColumn } from 'element-plus';
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';

import type { CollaboratorRole } from '@/types/collaborator';
import type { ProjectCollaboratorResponse, ProjectResponse } from '@/types/response';

import CollaboratorManagement from '@/components/collaborator/CollaboratorManagement.vue';

type Collaborator = Pick<ProjectCollaboratorResponse, 'id' | 'collaboratorEmail' | 'role'>;

const props = withDefaults(
  defineProps<{
    project: ProjectResponse;
    isOwner: boolean;
    collaboratorCount?: number;
    selectedProjectId: string | null;
    collaborators?: Collaborator[];
    isLoadingCollaborators?: boolean;
    isAdding?: boolean;
    isUpdating?: boolean;
    isRemoving?: boolean;
  }>(),
  {
    collaboratorCount: undefined,
    selectedProjectId: null,
    collaborators: () => [],
    isLoadingCollaborators: false,
    isAdding: false,
    isUpdating: false,
    isRemoving: false,
  }
);

const emit = defineEmits<{
  expand: [projectId: string];
  collapse: [];
  add: [payload: { collaboratorEmail: string; role: CollaboratorRole }];
  'update-role': [payload: { collaboratorId: string; role: CollaboratorRole }];
  remove: [collaboratorId: string];
}>();

const { t } = useI18n();

const isExpanded = computed(() => props.selectedProjectId === props.project.id);

const handleToggle = () => {
  if (isExpanded.value) {
    emit('collapse');
  } else {
    emit('expand', props.project.id);
  }
};

const onAddCollaborator = (payload: { collaboratorEmail: string; role: CollaboratorRole }) => {
  emit('add', payload);
};

const onUpdateRole = (payload: { collaboratorId: string; role: CollaboratorRole }) => {
  emit('update-role', payload);
};

const onRemoveCollaborator = (collaboratorId: string) => {
  emit('remove', collaboratorId);
};
</script>
