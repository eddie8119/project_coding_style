<template>
  <section :id="props.sectionId" class="panel-container w-full p-4">
    <H1Title :title="props.title" class-name="block w-full text-center" />
    <div
      v-if="props.tabs && props.tabs.length > 0 && props.modelValue != null"
      class="mb-4 overflow-x-auto sm:overflow-visible"
    >
      <PillTab
        :model-value="props.modelValue"
        :tabs="props.tabs"
        @update:model-value="onUpdateModelValue"
      />
    </div>
    <slot />
  </section>
</template>

<script setup lang="ts" generic="T extends string | number">
import PillTab from '@/components/core/tab/PillTab.vue';
import H1Title from '@/components/core/title/H1Title.vue';

const props = defineProps<{
  title: string;
  modelValue: T | null;
  tabs: { value: T; label?: string }[];
  sectionId?: string;
}>();

const emit = defineEmits<{
  (e: 'update:modelValue', value: T | null): void;
}>();

const onUpdateModelValue = (value: T) => {
  emit('update:modelValue', value);
};
</script>
