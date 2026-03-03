<template>
  <ElDialog
    v-model="dialogVisible"
    :title="title"
    :width="width"
    :destroy-on-close="destroyOnClose"
    :custom-class="customClass"
    @close="handleClose"
  >
    <slot />
    <template #footer>
      <span class="dialog-footer">
        <slot name="footer" />
      </span>
    </template>
  </ElDialog>
</template>

<script setup lang="ts">
import { computed } from 'vue';

const props = defineProps<{
  visible: boolean;
  title: string;
  width?: string;
  destroyOnClose?: boolean;
  customClass?: string;
}>();

const emit = defineEmits<{
  (e: 'update:visible', value: boolean): void;
  (e: 'close'): void;
}>();

const dialogVisible = computed({
  get: () => props.visible,
  set: (value: boolean) => emit('update:visible', value),
});

const handleClose = () => {
  emit('close');
  emit('update:visible', false);
};
</script>

<style lang="scss">
.dialog-footer {
  @apply mt-6 flex justify-end gap-2;
}
</style>
