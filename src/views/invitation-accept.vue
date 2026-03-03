<template>
  <div class="invitation-accept-page min-h-screen bg-gray-50 py-12">
    <div class="container mx-auto max-w-2xl px-4">
      <!-- Loading State -->
      <div v-if="isLoading" class="rounded-lg bg-white p-8 shadow-md">
        <div class="flex flex-col items-center justify-center py-12">
          <ElIcon class="is-loading mb-4" :size="48">
            <Loading />
          </ElIcon>
          <p class="text-gray-600">{{ t('message.loading') }}</p>
        </div>
      </div>

      <!-- Error State -->
      <div v-else-if="error" class="rounded-lg bg-white p-8 shadow-md">
        <div class="text-center">
          <ElIcon class="mb-4 text-secondary-red" :size="64">
            <WarningFilled />
          </ElIcon>
          <h2 class="mb-4 text-2xl font-bold text-gray-800">{{ t('title.invitation_error') }}</h2>
          <p class="mb-6 text-gray-600">
            {{ error }}
          </p>
          <ElButton type="primary" @click="router.push('/')">
            {{ t('button.back_to_home') }}
          </ElButton>
        </div>
      </div>

      <!-- Invitation Details -->
      <div v-else-if="invitation" class="rounded-lg bg-white p-8 shadow-md">
        <div class="mb-8 text-center">
          <ElIcon class="mb-4 text-blue-500" :size="64">
            <Avatar />
          </ElIcon>
          <h1 class="mb-2 text-3xl font-bold text-gray-800">
            {{ t('title.collaboration_invitation') }}
          </h1>
          <p class="text-gray-600">
            {{ invitation.inviterName }} {{ t('message.invitation.invited_you') }}
          </p>
        </div>

        <div class="mb-6 space-y-4 rounded-lg bg-gray-50 p-6">
          <div class="flex items-center justify-between border-b border-gray-200 pb-3">
            <span class="font-semibold text-gray-700">{{ t('label.type') }}:</span>
            <ElTag :type="invitation.invitationType === 'global' ? 'success' : 'primary'">
              {{ t(`label.invitation.${invitation.invitationType}`) }}
            </ElTag>
          </div>

          <div
            v-if="invitation.invitationType === 'project'"
            class="flex items-center justify-between border-b border-gray-200 pb-3"
          >
            <span class="font-semibold text-gray-700">{{ t('label.project.project_name') }}:</span>
            <span class="text-gray-800">{{ invitation.projects?.title }}</span>
          </div>

          <div class="flex items-center justify-between border-b border-gray-200 pb-3">
            <span class="font-semibold text-gray-700">{{ t('label.role') }}:</span>
            <ElTag type="info">{{ t(`option.role.${invitation.role}`) }}</ElTag>
          </div>

          <div class="flex items-center justify-between">
            <span class="font-semibold text-gray-700">{{ t('label.invitation.expires_at') }}:</span>
            <span class="text-gray-600">{{ formatDateTimeToMinutes(invitation.expiresAt) }}</span>
          </div>
        </div>

        <!-- Logged in user -->
        <div v-if="authStore.isAuthenticated" class="space-y-4">
          <div class="rounded-lg bg-blue-50 p-4">
            <p class="text-sm text-blue-700">
              {{ t('message.invitation.ready_to_accept') }}
            </p>
          </div>
          <ElButton
            type="primary"
            size="large"
            class="w-full"
            :loading="isAccepting"
            @click="handleAccept"
          >
            {{ t('button.accept_invitation') }}
          </ElButton>
        </div>

        <!-- Not logged in -->
        <div v-else class="space-y-4">
          <div class="rounded-lg bg-yellow-50 p-4">
            <p class="text-sm text-yellow-800">
              {{ t('message.invitation.login_required') }}
            </p>
          </div>
          <div class="flex gap-4">
            <ElButton
              type="primary"
              size="large"
              class="flex-1"
              @click="router.push(`/auth/login?redirect=/invitation/accept?token=${token}`)"
            >
              {{ t('button.login') }}
            </ElButton>
            <ElButton
              size="large"
              class="flex-1"
              @click="router.push(`/auth/register?redirect=/invitation/accept?token=${token}`)"
            >
              {{ t('button.register') }}
            </ElButton>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Avatar, Loading, WarningFilled } from '@element-plus/icons-vue';
import { ElMessage } from 'element-plus';
import { computed, onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRoute, useRouter } from 'vue-router';

import type { AxiosError } from 'axios';

import { useFormError } from '@/composables/useFormError';
import { useAcceptInvitation, useInvitationByToken } from '@/composables/useInvitations';
import { useAuthStore } from '@/stores/useAuthStore';
import { formatDateTimeToMinutes } from '@/utils/date';

const { t } = useI18n();
const route = useRoute();
const router = useRouter();
const authStore = useAuthStore();

const token = computed(() => route.query.token as string);

const { invitation, isLoading, error, refetch } = useInvitationByToken(token);
const { accept, isAccepting } = useAcceptInvitation();
const { handleError } = useFormError({
  statusCodes: [400, 401, 403, 404, 410],
  defaultErrorKey: t('message.invitation.accept_failed'),
});

onMounted(() => {
  if (!token.value) {
    error.value = t('message.invitation.invalid_token');
  } else {
    refetch();
  }
});

const handleAccept = async () => {
  if (!invitation.value) return;

  try {
    await accept(invitation.value.invitationToken);
    ElMessage.success(t('message.invitation.accepted'));

    // Redirect to appropriate page
    setTimeout(() => {
      if (invitation.value?.invitationType === 'project' && invitation.value?.projectId) {
        router.push(`/project/${invitation.value.projectId}`);
      } else {
        router.push('/overview');
      }
    }, 1500);
  } catch (err) {
    handleError(err as AxiosError);
  }
};
</script>

<style scoped>
.invitation-accept-page {
  min-height: calc(100vh - 64px);
}
</style>
