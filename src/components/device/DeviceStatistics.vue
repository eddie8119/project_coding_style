<!-- <template>
  <div class="panel-container relative flex flex-col p-4">
    <H2Title :title="t('title.subTitle.statistics')" />
    <ShowUpdateTime :last-update-time="lastUpdateTime" />
    <Table
      :data="transformedStatistics"
      :columns="DEVICE_ENTITY_STATISTICS_COLUMNS"
      :show-id-column="true"
      :show-actions="false"
      :show-search="false"
      :actions="[]"
      max-height="calc(100vh - 250px)"
    />
  </div>
</template>

<script setup lang="ts">
import { computed, watch } from 'vue';
import { useI18n } from 'vue-i18n';

import type { StatisticsData } from '@/types/datainsight';

import ShowUpdateTime from '@/components/core/ShowUpdateTime.vue';
import Table from '@/components/core/table/Table.vue';
import H2Title from '@/components/core/title/H2Title.vue';
import { useUpdateTime } from '@/composables/useUpdateTime';
import { ENTITY_STATISTICS_COLUMNS } from '@/constants/columns/device';
import { transformStatistics } from '@/utils/statistics';

const props = defineProps({
  deviceStatisticsData: { type: Array as () => StatisticsData[], required: true },
});

const { t } = useI18n();
const { lastUpdateTime, updateLastUpdateTime } = useUpdateTime();

// 移除前兩個欄位（ID 和 tag）
const DEVICE_ENTITY_STATISTICS_COLUMNS = ENTITY_STATISTICS_COLUMNS.slice(2);

watch(
  props.deviceStatisticsData,
  (newVal: StatisticsData[]) => {
    if (newVal.length > 0) {
      updateLastUpdateTime();
    }
  },
  { immediate: true }
);

const transformedStatistics = computed(() => {
  return transformStatistics(props.deviceStatisticsData);
});
</script>

<style scoped></style> -->
