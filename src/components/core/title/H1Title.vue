<template>
  <div class="mb-3 text-2xl font-semibold" :class="props.className">
    <h1>{{ props.title }}</h1>
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{
  title: string;
  className?: string;
}>();
</script>

<style lang="scss" scoped></style>
