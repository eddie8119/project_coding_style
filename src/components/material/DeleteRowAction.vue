<template>
  <div :class="wrapperClass">
    <TrashButton :class="buttonClass" :label="label" @click="showDialog = true" />
    <DeleteDialog
      v-model="showDialog"
      :subject="subject"
      :target="target"
      :additional-info="additionalInfo"
      @confirm="handleConfirm"
    />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';

import DeleteDialog from '@/components/core/dialog/DeleteDialog.vue';
import TrashButton from '@/components/ui/TrashButton.vue';

withDefaults(
  defineProps<{
    subject: string;
    target?: string;
    label?: string;
    wrapperClass?: string;
    buttonClass?: string;
    additionalInfo?: string;
  }>(),
  {
    target: '',
    label: undefined,
    wrapperClass: '',
    buttonClass: '',
    additionalInfo: undefined,
  }
);

const emit = defineEmits<{ (e: 'confirm'): void }>();

const showDialog = ref(false);

const handleConfirm = () => {
  emit('confirm');
  showDialog.value = false;
};
</script>
