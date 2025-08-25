<template>
  <div class="mb-2 w-full text-lg font-medium capitalize dark:text-white" :class="props.className">
    <h2>{{ props.title }}</h2>
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
