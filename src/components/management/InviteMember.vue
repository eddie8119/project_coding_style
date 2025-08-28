<template>
  <div class="panel-container">
    <H2Title :title="t('management.inviteMember')" />
    <form
      class="flex flex-col gap-6 lg:flex-row lg:items-end"
      @submit.prevent="handleSubmit(onSubmit)"
    >
      <div class="flex w-full flex-col lg:w-auto">
        <label class="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
          {{ t('management.collaborator') }}
        </label>
        <div class="h-[38px]">
          <FormInput
            :model-value="email"
            name="email"
            type="email"
            placeholder="Email"
            :error="errors.email"
            icon="Message"
            class="h-full w-full lg:w-[280px]"
            @update:model-value="(val) => (email = val)"
            @blur="handleBlurEmail"
          />
        </div>
      </div>

      <div class="flex w-full flex-col lg:w-auto">
        <label class="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
          {{ t('management.role') }}
        </label>
        <div class="h-[38px]">
          <select
            v-model="role"
            class="focus:border-primary-500 focus:ring-primary-500 h-full w-full rounded-md border-gray-300 bg-white px-3 shadow-sm transition-colors dark:border-gray-500 dark:bg-gray-500 lg:w-[150px]"
            required
            @blur="handleBlurRole"
          >
            <option
              v-for="roleOption in availableRoles"
              :key="roleOption.value"
              :value="roleOption.value"
            >
              {{ t(`management.roles.${roleOption.value}`) }}
            </option>
          </select>
        </div>
      </div>

      <div class="flex w-full items-end lg:w-auto">
        <TextButton
          type="submit"
          :loading="isSubmitting"
          variant="primary"
          size="md"
          class="h-[40px] w-full px-8 lg:w-auto"
        >
          {{ t('management.invite') }}
        </TextButton>
      </div>
    </form>
  </div>
</template>

<script setup lang="ts">
import { toTypedSchema } from '@vee-validate/zod';
import { ElMessage } from 'element-plus';
import { useField, useForm } from 'vee-validate';
import { useI18n } from 'vue-i18n';

import FormInput from '../core/input/FormInput.vue';

import TextButton from '@/components/core/button/TextButton.vue';
import H2Title from '@/components/core/title/H2Title.vue';
import { availableRoles, type Member, Role } from '@/types/role';
import { emailSchema } from '@/utils/schemas/emailSchema';

const { t } = useI18n();

const props = defineProps<{
  members: Member[];
}>();

const emit = defineEmits<{
  (e: 'member-invited', member: Member): void;
}>();

const { handleSubmit, errors, isSubmitting } = useForm({
  validationSchema: toTypedSchema(emailSchema),
  initialValues: {
    email: '',
    role: Role.VIEWER,
  },
});

const { value: email, handleBlur: handleBlurEmail } = useField<string>('email');
const { value: role, handleBlur: handleBlurRole } = useField<Role>('role');

const onSubmit = async (values: { email: string; role: Role }) => {
  try {
    // 檢查 email 是否已存在
    if (props.members.some((m) => m.email.toLowerCase() === values.email.toLowerCase())) {
      errors.value.email = t('management.errors.emailExists');
      return;
    }

    // TODO: 實現邀請邏輯
    await new Promise((resolve) => setTimeout(resolve, 1000));

    const newMember: Member = {
      email: values.email,
      role: values.role,
      status: 'pending',
    };

    emit('member-invited', newMember);

    // 重置表單
    email.value = '';
    role.value = Role.VIEWER;

    ElMessage.success(t('management.messages.inviteSent'));
  } catch (error) {
    ElMessage.error(t('management.errors.inviteFailed'));
    console.error('Failed to invite member:', error);
  }
};
</script>

<style lang="scss" scoped></style>
