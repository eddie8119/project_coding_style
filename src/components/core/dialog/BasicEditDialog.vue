<template>
  <el-dialog
    v-model="dialogVisible"
    width="500px"
    :title="title"
    :close-on-click-modal="true"
    :close-on-press-escape="true"
    @close="onCancel"
  >
    <el-form label-width="110px" class="device-form" @submit.prevent="onSubmit">
      <slot />
    </el-form>
    <span class="mt-5 flex items-center gap-3">
      <slot name="footer-left" />
      <div class="flex-grow" />
      <slot name="footer" :on-cancel="onCancel" :on-submit="onSubmit" :is-submitting="isSubmitting">
        <TextButton size="md" variant="outline" @click="onCancel">
          {{ t('common.cancel') }}
        </TextButton>

        <TextButton
          variant="primary"
          :disabled="isSubmitting"
          :loading="isSubmitting"
          size="md"
          @click="onSubmit"
        >
          {{ t('common.save') }}
        </TextButton>
      </slot>
    </span>
  </el-dialog>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';

import TextButton from '@/components/core/button/TextButton.vue';

const props = defineProps({
  modelValue: {
    type: Boolean,
    required: true,
  },
  title: {
    type: String,
    required: true,
  },
  isSubmitting: {
    type: Boolean,
    default: false,
  },
});

const emit = defineEmits(['update:modelValue', 'submit', 'cancel']);
const dialogVisible = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value),
});
const { t } = useI18n();

const onSubmit = () => {
  emit('submit');
};

const onCancel = () => {
  emit('cancel');
  emit('update:modelValue', false);
};
</script>

<style lang="scss" scoped>
.flex-grow {
  flex-grow: 1;
}
</style>
