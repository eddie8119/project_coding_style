<template>
  <div class="invitation-notifications">
    <div v-if="isLoading" class="py-8 text-center">
      <ElIcon class="is-loading" :size="32">
        <Loading />
      </ElIcon>
    </div>

    <div v-else-if="invitations && invitations.length > 0" class="space-y-4">
      <div
        v-for="invitation in invitations"
        :key="invitation.id"
        class="rounded-lg border border-gray-200 bg-white p-4 shadow-sm transition hover:shadow-md"
      >
        <div class="flex items-start justify-between">
          <div class="flex-1">
            <div class="mb-2 flex items-center gap-2">
              <ElTag
                :type="invitation.invitationType === 'global' ? 'success' : 'primary'"
                size="small"
              >
                {{ t(`label.invitation.${invitation.invitationType}`) }}
              </ElTag>
              <ElTag type="info" size="small">
                {{ t(`option.role.${invitation.role}`) }}
              </ElTag>
            </div>

            <h4 class="mb-2 font-semibold text-gray-800">
              <template v-if="invitation.invitationType === 'project'">
                {{ invitation.projects?.title || t('label.project.project') }}
              </template>
              <template v-else>
                {{ t('label.invitation.global_invitation') }}
              </template>
            </h4>
            <p class="mb-2 text-sm text-gray-600">
              {{
                t('message.invitation.invited_by', {
                  name: invitation.inviterName || invitation.inviteeEmail,
                })
              }}
            </p>
            <p class="text-xs text-gray-500">
              {{ t('label.invitation.expires_at') }}: {{ formatDate(invitation.expiresAt) }}
            </p>
          </div>

          <div class="ml-4 flex flex-col gap-2">
            <ElButton
              type="primary"
              size="small"
              :loading="isAccepting"
              @click="handleAccept(invitation.invitationToken)"
            >
              {{ t('button.accept') }}
            </ElButton>
            <ElButton size="small" :loading="isRejecting" @click="handleReject(invitation.id)">
              {{ t('button.reject') }}
            </ElButton>
          </div>
        </div>
      </div>
    </div>

    <div v-else class="py-8 text-center text-gray-500">
      {{ t('message.sign.no_invitations') }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { Loading } from '@element-plus/icons-vue';
import { ElMessage } from 'element-plus';
import { useI18n } from 'vue-i18n';

import {
  useAcceptInvitation,
  useMyInvitations,
  useRejectInvitation,
} from '@/composables/useInvitations';

const { t } = useI18n();

const { invitations, isLoading, refetch } = useMyInvitations();
const { accept, isAccepting } = useAcceptInvitation();
const { reject, isRejecting } = useRejectInvitation();

const formatDate = (date: Date) => {
  return new Date(date).toLocaleDateString('zh-TW', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};

const handleAccept = async (token: string) => {
  try {
    await accept(token);
    ElMessage.success(t('message.invitation.accepted'));
    refetch();
  } catch (err: unknown) {
    ElMessage.error((err as Error).message || t('message.invitation.accept_failed'));
  }
};

const handleReject = async (id: string) => {
  try {
    await reject(id);
    ElMessage.success(t('message.invitation.rejected'));
    refetch();
  } catch (err: unknown) {
    ElMessage.error((err as Error).message || t('message.invitation.reject_failed'));
  }
};
</script>

<style scoped>
.invitation-notifications {
  max-width: 100%;
}
</style>
