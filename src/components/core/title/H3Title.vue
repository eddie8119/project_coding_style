<template>
  <div class="nowrap text-base font-medium text-black-400 dark:text-white" :class="props.className">
    <h3>{{ props.title }}</h3>
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
