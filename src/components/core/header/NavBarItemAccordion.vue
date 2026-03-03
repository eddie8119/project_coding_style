<template>
  <Transition>
    <div v-if="props.items.length > 0" class="dropdown-container">
      <button
        v-for="item in props.items"
        :key="item.code"
        :class="{ 'dropdown-container-button-active': props.selectedItem === item.code }"
        class="dropdown-container-button"
        @click.stop="item.action ? item.action() : emit('select', item.code)"
      >
        <span class="text-sm">{{ t(`dropdown.${item.label}`) }}</span>
      </button>
    </div>
  </Transition>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n';

interface Item {
  code: string;
  label: string;
  action?: () => void;
}

const props = defineProps<{
  items: Item[];
  selectedItem?: Record<string, unknown> | string;
}>();

const emit = defineEmits(['select']);

const { t } = useI18n();
</script>

<style lang="scss" scoped></style>
