<template>
  <div class="flex flex-col items-center gap-2">
    <div
      v-if="title"
      class="rounded bg-white/95 px-2 py-1 text-xs font-medium text-gray-700 shadow-md"
    >
      {{ title }}
    </div>
    <div class="text-4xl drop-shadow-lg">
      <img src="@/assets/icons/PinRed.png" alt="Pin" class="h-8 w-8" />
    </div>
    <button
      class="pointer-events-auto rounded bg-gray-800/80 px-3 py-1 text-xs font-medium text-white shadow-md hover:bg-gray-800"
      @click.stop="$emit('cancel')"
      @mousedown.stop.prevent
      @mouseup.stop
      @pointerdown.stop.prevent
      @pointerup.stop
      @touchstart.stop.prevent
      @touchend.stop
    >
      {{ t('label.pin.cancel_pinning') }}
    </button>
  </div>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n';

type Emits = {
  (e: 'cancel'): void;
};

const { title } = defineProps<{ title?: string | null }>();
defineEmits<Emits>();
const { t } = useI18n();
</script>
