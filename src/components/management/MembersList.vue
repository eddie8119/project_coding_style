<template>
  <div class="panel-container">
    <H2Title :title="t('management.membersList')" />

    <!-- 桌面版表格 -->
    <div class="hidden md:block">
      <table class="table-divide min-w-full">
        <thead>
          <tr>
            <th>Email</th>
            <th>{{ t('column.role') }}</th>
            <th>{{ t('column.status') }}</th>
            <th>{{ t('column.action') }}</th>
          </tr>
        </thead>
        <tbody class="table-divide">
          <tr v-for="member in props.members" :key="member.email">
            <td>{{ member.email }}</td>
            <td>
              <select
                v-if="canManageRoles && member.role !== 'owner'"
                v-model="member.role"
                class="focus:border-primary-500 focus:ring-primary-500 rounded-md border-gray-300 px-1 shadow-sm dark:bg-gray-500"
                @change="handleRoleChange(member)"
              >
                <option
                  v-for="roleOption in availableRoles"
                  :key="roleOption.value"
                  :value="roleOption.value"
                >
                  {{ t(`management.roles.${roleOption.value}`) }}
                </option>
              </select>
              <span v-else>{{ t(`management.roles.${member.role}`) }}</span>
            </td>
            <td>
              <span
                class="inline-flex rounded-full px-2 text-xs font-semibold leading-5"
                :class="getStatusClass(member.status)"
              >
                {{ t(`management.status.${member.status}`) }}
              </span>
            </td>
            <td>
              <button
                v-if="canManageRoles && member.role !== 'owner'"
                class="text-secondary-red hover:text-red-900"
                @click="handleRemoveMember(member)"
              >
                {{ t('management.remove') }}
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- 移動版卡片列表 -->
    <div class="flex flex-col gap-4 md:hidden">
      <div
        v-for="member in props.members"
        :key="member.email"
        class="rounded-lg border border-gray-200 p-4 shadow-sm"
      >
        <div class="mb-3 flex items-center justify-between">
          <div class="font-medium">{{ member.email }}</div>
          <span
            class="inline-flex rounded-full px-2 text-xs font-semibold leading-5"
            :class="getStatusClass(member.status)"
          >
            {{ t(`management.status.${member.status}`) }}
          </span>
        </div>

        <div class="mb-3 flex items-center justify-between">
          <span class="text-sm text-gray-500">{{ t('column.role') }}</span>
          <div>
            <select
              v-if="canManageRoles && member.role !== 'owner'"
              v-model="member.role"
              class="focus:border-primary-500 focus:ring-primary-500 w-full rounded-md border-gray-300 px-2 py-1 text-sm shadow-sm dark:bg-gray-500"
              @change="handleRoleChange(member)"
            >
              <option
                v-for="roleOption in availableRoles"
                :key="roleOption.value"
                :value="roleOption.value"
              >
                {{ t(`management.roles.${roleOption.value}`) }}
              </option>
            </select>
            <span v-else class="text-sm">{{ t(`management.roles.${member.role}`) }}</span>
          </div>
        </div>

        <div v-if="canManageRoles && member.role !== 'owner'" class="mt-4 flex justify-end">
          <TextButton
            variant="danger"
            size="sm"
            class="w-full sm:w-auto"
            @click="handleRemoveMember(member)"
          >
            {{ t('common.remove') }}
          </TextButton>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';

import H2Title from '@/components/core/title/H2Title.vue';
import { availableRoles, type Member, Role } from '@/types/role';

const { t } = useI18n();

const props = defineProps<{
  members: Member[];
}>();

const emit = defineEmits<{
  (e: 'member-removed', email: string): void;
  (e: 'role-changed', member: Member): void;
}>();

const currentUserRole = computed(() => Role.OWNER); // TODO: Get from auth store

const canManageRoles = computed(() => [Role.OWNER, Role.ADMIN].includes(currentUserRole.value));

const handleRoleChange = async (member: Member) => {
  try {
    // TODO: API call to update member role
    emit('role-changed', member);
  } catch (error) {
    console.error('Failed to update role:', error);
  }
};

const handleRemoveMember = async (member: Member) => {
  if (!canRemoveMember(member)) return;

  try {
    // TODO: API call to remove member
    emit('member-removed', member.email);
  } catch (error) {
    console.error('Failed to remove member:', error);
  }
};

const canRemoveMember = (member: Member): boolean => {
  if (member.role === Role.OWNER) return false;
  if (currentUserRole.value === Role.OWNER) return true;
  return currentUserRole.value === Role.ADMIN;
};

const getStatusClass = (status: string): string => {
  return status === 'pending'
    ? ' bg-secondary-yellow text-yellow-800'
    : ' bg-green-100 text-green-800';
};
</script>

<style lang="scss" scoped></style>
