<template>
  <div class="text-center">
    <div
      class="mx-auto mb-1 flex h-32 w-32 items-center justify-center rounded-lg border-2 border-dashed border-gray-300 bg-white hover:border-blue-400 hover:bg-blue-50"
      @click="triggerFileInput"
      @dragover.prevent
      @drop.prevent="handleFileDrop"
    >
      <div class="text-center">
        <svg
          class="mx-auto h-8 w-8 text-gray-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
          />
        </svg>
        <p class="mt-2 text-sm text-gray-600">{{ t('label.upload_area.hint') }}</p>
      </div>
    </div>
    <p class="text200-color-difference text-sm">{{ t('label.upload_area.supported_formats') }}</p>
    <input
      ref="fileInputRef"
      type="file"
      accept="image/*,application/pdf"
      multiple
      class="hidden"
      @change="handleFileSelect"
    />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useI18n } from 'vue-i18n';

const emit = defineEmits<{
  'file-select': [event: Event];
  'file-drop': [event: DragEvent];
}>();

const { t } = useI18n();

const fileInputRef = ref<HTMLInputElement>();

const triggerFileInput = () => {
  fileInputRef.value?.click();
};

const handleFileSelect = (event: Event) => {
  emit('file-select', event);
};

const handleFileDrop = (event: DragEvent) => {
  emit('file-drop', event);
};

defineExpose({
  fileInputRef,
});
</script>
