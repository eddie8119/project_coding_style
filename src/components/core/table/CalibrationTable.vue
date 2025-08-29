<template></template>

<script setup lang="ts"></script>

<style scoped></style>

<!-- <template>
  <div class="panel-container relative flex flex-col">
    <H2Title :title="t('title.subTitle.latest_calibration')" />
    <ShowUpdateTime :last-update-time="lastUpdateTime" />
    <Table
      :data="props.latestCali"
      :columns="ENTITY_CALIBRATION_COLUMNS"
      :show-id-column="true"
      :show-actions="true"
      :show-search="false"
      :actions="[]"
      max-height="calc(100vh - 250px)"
    />
  </div>
</template>

<script setup lang="ts">
import { onActivated, watch } from 'vue';
import { useI18n } from 'vue-i18n';

import ShowUpdateTime from '@/components/core/ShowUpdateTime.vue';
import Table from '@/components/core/table/Table.vue';
import H2Title from '@/components/core/title/H2Title.vue';
import { useUpdateTime } from '@/composables/useUpdateTime';
import { ENTITY_CALIBRATION_COLUMNS } from '@/constants/columns/device';
// import { cleanID, datetimeToString } from '@/utils/common';

const props = defineProps({
  latestCali: {
    type: Array,
    required: true,
  },
});

const { t } = useI18n();
const { lastUpdateTime, updateLastUpdateTime } = useUpdateTime();

watch(props.latestCali, () => {
  updateLastUpdateTime();
});

onActivated(() => {
  updateLastUpdateTime();
});
</script>

<style lang="scss" scoped></style> -->
