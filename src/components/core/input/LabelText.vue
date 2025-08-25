<template>
  <div class="mb-1 block text-sm font-medium dark:text-white" :class="props.className">
    <p>{{ props.title }}</p>
  </div>
</template>

<script setup lang="ts">
interface Props {
  title: string;
  className?: string;
}

const props = defineProps<Props>();
</script>

<style lang="scss" scoped></style>
