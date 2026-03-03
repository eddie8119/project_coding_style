<template>
  <main
    class="panel-color-difference relative min-h-screen w-full overflow-hidden md:bg-transparent"
  >
    <!-- Background (desktop only) -->
    <div class="absolute inset-0 hidden bg-cover bg-center md:block" :style="backgroundStyle" />
    <div
      class="from-black/65 via-black/45 to-black/30 absolute inset-0 hidden bg-gradient-to-br backdrop-blur-[1.5px] md:block"
      aria-hidden="true"
    />

    <!-- Content -->
    <section
      class="relative flex min-h-screen items-center justify-center px-4 py-6 md:px-0 md:py-0"
    >
      <slot />
    </section>
  </main>
</template>

<script setup lang="ts">
import { computed } from 'vue';

interface Props {
  imageSrc?: string;
}

const props = withDefaults(defineProps<Props>(), {
  imageSrc: '/images/Background.png',
});

const backgroundStyle = computed(() => ({
  backgroundImage: `url('${props.imageSrc}')`,
  filter: 'saturate(50%)',
}));
</script>
