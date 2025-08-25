<template>
  <div class="panel-container" :class="props.class">
    <div class="mb-4 flex items-center justify-between">
      <H2Title :title="t('title.alarm_list')" />
    </div>
    <!-- Tab Content -->
    <div ref="carouselContainer" class="h-full max-h-[75vh] overflow-y-auto">
      <div v-if="carouselList.length === 0" class="py-8 text-center text-gray-500">
        {{ t('message.sign.no_alarm') }}
      </div>
      <div v-else class="grid-col-2 lg:grid-col-1 grid space-y-3">
        <div
          v-for="alert in carouselList"
          :key="alert.tag"
          ref="alertCard"
          :class="[
            'flex items-start justify-between rounded-lg p-4 shadow-sm transition-shadow hover:shadow-md',
            alert.status.includes('W') ? 'bg-red-50' : 'bg-yellow-50',
          ]"
        >
          <!-- 左側：設備標籤與資訊 -->
          <div class="flex w-4/5 items-start gap-3">
            <div
              class="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-white"
            >
              {{ observationTag(alert.label) }}
            </div>
            <div class="flex min-w-0 flex-col gap-1">
              <div class="flex flex-wrap items-center gap-2">
                <span
                  :class="[
                    'font-semibold',
                    alert.status.includes('W') ? 'text-secondary-red' : 'text-secondary-yellow',
                  ]"
                >
                  {{ t('device.device') }}
                  <router-link :to="`/observation/${alert.label}/device/${alert.id}`">
                    <span class="underline">{{ alert.tag }}</span>
                  </router-link>
                  {{ alert.alarm_name }}
                </span>
              </div>
              <p class="break-words text-gray-500">
                {{ alert.details }}
              </p>
            </div>
          </div>
          <!-- 右側：狀態與時間 -->
          <div class="ml-2 flex min-w-[70px] flex-col items-end gap-1 text-sm">
            <span
              :class="
                alert.alarm_status === AlarmStatus.UNRESOLVED
                  ? 'font-semibold text-secondary-red'
                  : 'font-semibold text-secondary-green'
              "
            >
              {{
                alert.alarm_status === AlarmStatus.UNRESOLVED
                  ? t('device.status.unresolved')
                  : t('device.status.resolved')
              }}
            </span>
            <span class="text-gray-400">{{ alert.time }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, watch } from 'vue';
import { useI18n } from 'vue-i18n';

import type { DeviceWithAlarms } from '@/types/label';

import H2Title from '@/components/core/title/H2Title.vue';
import { useCarousel } from '@/composables/useCarousel';
import { useLabel } from '@/composables/useLabel';
import { ObservationType } from '@/types/device';
import { AlarmStatus } from '@/types/label';
import { observationTag } from '@/utils/tag';

const { t } = useI18n();
const { formattedAlarmRecords, refetchAlarmRecords } = useLabel();

const props = defineProps<{
  class: string;
  observationChoose: ObservationType | undefined;
  isReload: boolean;
}>();

const observationChooseList = computed(() => {
  switch (props.observationChoose) {
    case ObservationType.PH:
      return formattedAlarmRecords.value.filter(
        (alert: DeviceWithAlarms) => alert.label === ObservationType.PH
      );
    case ObservationType.ORP:
      return formattedAlarmRecords.value.filter(
        (alert: DeviceWithAlarms) => alert.label === ObservationType.ORP
      );
    case ObservationType.NH3N:
      return formattedAlarmRecords.value.filter(
        (alert: DeviceWithAlarms) => alert.label === ObservationType.NH3N
      );
    case ObservationType.FLOURIDE:
      return formattedAlarmRecords.value.filter(
        (alert: DeviceWithAlarms) => alert.label === ObservationType.FLOURIDE
      );
    default:
      return formattedAlarmRecords.value;
  }
});

// Carousel 跑馬燈邏輯
const { carouselContainer, alertCard, carouselList } = useCarousel(observationChooseList);

watch(
  () => props.isReload,
  (newVal) => {
    if (newVal === true) {
      refetchAlarmRecords();
    }
  }
);
</script>

<style scoped></style>
