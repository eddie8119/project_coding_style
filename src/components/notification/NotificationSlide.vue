<template>
  <SlidePanel
    v-model="isNotificationSlideVisible"
    side="right"
    :top-offset-rem="4"
    :width-percent="45"
    :max-width-px="350"
    @close="hideNotificationSlide"
  >
    <!-- Notification slot content goes here -->
    <div class="min-h-full">
      <!-- Notification -->
    </div>
  </SlidePanel>
</template>

<script setup lang="ts">
import { storeToRefs } from 'pinia';

import SlidePanel from '@/components/ui/SlidePanel.vue';
import { useSlideStore } from '@/stores/useSlideStore';

const slideStore = useSlideStore();
const { isNotificationSlideVisible } = storeToRefs(slideStore);
const { hideNotificationSlide } = slideStore;
</script>
