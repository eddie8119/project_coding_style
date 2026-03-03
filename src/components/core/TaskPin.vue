<template>
  <div class="group relative">
    <button
      type="button"
      class="flex cursor-pointer select-none flex-col items-center text-center outline-none"
      :draggable="false"
      @click="onClick"
      @mousedown="onMouseDown"
    >
      <div
        class="ring-black/5 mt-1 max-w-[160px] rounded bg-white/95 px-2 py-1 text-xs font-medium leading-tight text-gray-700 shadow-md ring-1 group-hover:-translate-y-0.5"
      >
        {{ title }}
      </div>
      <img
        src="@/assets/icons/PinGreen.png"
        alt="Pin"
        class="mt-1 h-6 w-6 cursor-pointer select-none group-hover:-translate-y-0.5"
        :draggable="false"
      />
    </button>
    <button
      class="absolute -right-1 -top-1 hidden h-4 w-4 items-center justify-center rounded-full bg-gray-600 text-white opacity-75 hover:opacity-100 group-hover:flex"
      @click.stop="$emit('remove')"
    >
      &times;
    </button>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  title: string;
}>();

const emit = defineEmits<{
  (e: 'click'): void;
  (e: 'pin-mousedown', evt: MouseEvent): void;
  (e: 'remove'): void;
}>();

const onClick = () => {
  emit('click');
};

const onMouseDown = (evt: MouseEvent) => {
  emit('pin-mousedown', evt);
};
</script>
