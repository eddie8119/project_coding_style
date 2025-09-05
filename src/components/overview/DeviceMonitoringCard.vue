<template>
  <div
    class="w-full min-w-[180px] rounded-xl p-4 transition-all duration-200 ease-in-out"
    :class="[
      props.observationChoose === itemData.ID
        ? 'bg-primary-purple shadow-2xl'
        : 'hover:bg-primary-purple/80 hover:shadow-primary-purple/40 bg-primary-purple shadow-lg hover:shadow-xl',
      'transform cursor-pointer',
    ]"
    @click="handleChoose"
  >
    <div class="flex items-center gap-2">
      <div
        class="flex h-5 w-5 items-center justify-center rounded-full border-2 border-brand-secondary transition-all duration-300"
        :class="[props.observationChoose === itemData.ID ? 'bg-brand-secondary' : '']"
      >
        <div
          v-if="props.observationChoose === itemData.ID"
          class="h-2 w-2 rounded-full bg-white shadow-sm"
        />
      </div>
      <div>
        <h3 class="text-lg font-semibold text-gray-700">
          {{ `${t('observation.' + itemData.ID)}` }}
        </h3>
        <span class="text-sm">{{ fullObservationTag(itemData.ID as ObservationType) }}</span>
      </div>
    </div>

    <div class="mt-3 flex items-center justify-between">
      <div class="flex flex-col">
        <p class="font-medium text-secondary-red">
          {{ t('device.warning') }} x {{ Object.keys(itemData.warning || {}).length }}
        </p>
        <p class="font-medium text-secondary-yellow">
          {{ t('device.caution') }} x {{ Object.keys(itemData.caution || {}).length }}
        </p>
      </div>
      <span> {{ t('device.times') }} </span>
    </div>

    <div class="mt-3 flex items-center justify-between">
      <div class="flex flex-col">
        <p class="font-medium text-secondary-green">
          {{ t('device.running') }} x {{ (itemData.running || []).length }}
        </p>
        <p class="font-medium text-secondary-red">
          {{ t('device.stop') }} x {{ (itemData.stopped || []).length }}
        </p>
      </div>
      <span> {{ t('device.devices') }} </span>
    </div>

    <div class="mt-3 flex items-center justify-center">
      <router-link
        :to="{ name: 'observation-devices', params: { observationType: itemData.ID } }"
        @click.stop
      >
        <TextButton variant="primary"> {{ t('device.devices_list_page') }} </TextButton>
      </router-link>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';

import type { DeviceWithStatus } from '@/types/label';

import TextButton from '@/components/core/button/TextButton.vue';
import { ObservationType } from '@/types/device';
import { fullObservationTag } from '@/utils/tag';

const { t } = useI18n();

const props = defineProps<{
  item: DeviceWithStatus;
  observationChoose: ObservationType | undefined;
}>();

// 自動解包、並保證 fallback
const itemData = computed(() => props.item || {});

const emit = defineEmits<{
  (e: 'observation-change', val: ObservationType): void;
}>();

const handleChoose = () => {
  emit('observation-change', itemData.value.ID);
};
</script>
