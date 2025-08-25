<template>
  <el-form>
    <FormInput
      :model-value="props.username"
      name="username"
      type="text"
      :placeholder="t('placeholder.auth.username')"
      :error="props.errors?.username"
      @update:model-value="emit('update:username', $event)"
      @blur="emit('blur:username')"
    />
  </el-form>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n';

import FormInput from '../core/input/FormInput.vue';

const { t } = useI18n();
const props = defineProps<{
  username: string;
  errors?: Record<string, string>;
}>();

const emit = defineEmits<{
  (e: 'update:username', value: string): void;
  (e: 'blur:username'): void;
}>();
</script>
