<template>
  <div class="panel-container">
    <div class="flex justify-between">
      <H3Title :title="t('title.subTitle.replace_history')" />
      <div class="flex items-center gap-2">
        <div class="">{{ t('label.average') }}:</div>
        <div class="">
          {{ Math.round(daysAverage) }} <span>/ {{ t('device.day') }}</span>
        </div>
      </div>
    </div>
    <Table
      :columns="PH_DEVICE_USAGE_COLUMNS"
      :data="dummyDevices"
      :show-actions="false"
      :show-pagination="false"
      :show-search="false"
      max-height="calc(100vh - 250px)"
    />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';

import type { ObservationType } from '@/types/device';

import Table from '@/components/core/table/Table.vue';
import H3Title from '@/components/core/title/H3Title.vue';
import { PH_DEVICE_USAGE_COLUMNS } from '@/constants/columns/ph';

const { t } = useI18n();

const props = defineProps<{
  observationType: ObservationType;
}>();

const dummyDevices = computed(() => {
  switch (props.observationType) {
    case 'ph':
      return phDummyDevices;
    case 'orp':
      return orpDummyDevices;
    case 'nh3n':
      return nhDummyDevices;
    case 'flouride':
      return nhDummyDevices;
    default:
      return phDummyDevices;
  }
});

const phDummyDevices = [
  {
    replace_date: '2025-06-01',
    water_area: t('option.waterQuality.pure_water'),
    useing_days: '913',
  },
  {
    replace_date: '2022-12-01',
    water_area: t('option.waterQuality.pure_water'),
    useing_days: '910',
  },
  {
    replace_date: '2020-06-04',
    water_area: t('option.waterQuality.pure_water'),
    useing_days: '905',
  },
  {
    replace_date: '2017-11-11',
    water_area: t('option.waterQuality.pure_water'),
    useing_days: '900',
  },
  {
    replace_date: '2015-06-01',
    water_area: t('option.waterQuality.pure_water'),
    useing_days: '903',
  },
  {
    replace_date: '2012-12-01',
    water_area: t('option.waterQuality.pure_water'),
    useing_days: '915',
  },
];

const orpDummyDevices = [
  {
    replace_date: '2025-06-01',
    water_area: t('option.waterQuality.pure_water'),
    useing_days: '183',
  },
  {
    replace_date: '2023-06-01',
    water_area: t('option.waterQuality.pure_water'),
    useing_days: '180',
  },
  {
    replace_date: '2021-06-01 ',
    water_area: t('option.waterQuality.pure_water'),
    useing_days: '185',
  },
  {
    replace_date: '2019-07-01',
    water_area: t('option.waterQuality.pure_water'),
    useing_days: '180',
  },
  {
    replace_date: '2017-07-01',
    water_area: t('option.waterQuality.pure_water'),
    useing_days: '175',
  },
  {
    replace_date: '2015-07-21 ',
    water_area: t('option.waterQuality.pure_water'),
    useing_days: '170',
  },
];

const nhDummyDevices = [
  {
    replace_date: '2025-06-01',
    water_area: t('option.waterQuality.pure_water'),
    useing_days: '360',
  },
  {
    replace_date: '2024-06-11',
    water_area: t('option.waterQuality.pure_water'),
    useing_days: '355',
  },
  {
    replace_date: '2023-06-01',
    water_area: t('option.waterQuality.pure_water'),
    useing_days: '352',
  },
  {
    replace_date: '2022-06-25',
    water_area: t('option.waterQuality.pure_water'),
    useing_days: '350',
  },
  {
    replace_date: '2021-07-01',
    water_area: t('option.waterQuality.pure_water'),
    useing_days: '358',
  },
  {
    replace_date: '2020-07-10',
    water_area: t('option.waterQuality.pure_water'),
    useing_days: '356',
  },
];

const daysAverage = computed(() => {
  if (dummyDevices.value.length === 0) return 0;
  const totalDays = dummyDevices.value.reduce((sum, device) => sum + Number(device.useing_days), 0);
  return totalDays / dummyDevices.value.length;
});
</script>

<style lang="scss" scoped>
.material-bulletin-board {
  @apply relative flex flex-col;
}
</style>
