<!-- <template>
  <div class="panel-container relative flex flex-col p-4">
    <H2Title :title="t('title.subTitle.statistics')" />
    <ShowUpdateTime :last-update-time="lastUpdateTime" />
    <Table
      :data="transformedStatistics"
      :columns="ENTITY_STATISTICS_COLUMNS"
      :show-id-column="true"
      :show-actions="false"
      :show-search="false"
      :actions="[]"
      max-height="calc(100vh - 250px)"
    />
  </div>
</template>

<script setup lang="ts">
import { computed, onActivated, ref } from 'vue';
import { useI18n } from 'vue-i18n';

import type { StatisticsData } from '@/types/datainsight';
import type { Tag } from '@/types/tag';

import ShowUpdateTime from '@/components/core/ShowUpdateTime.vue';
import Table from '@/components/core/table/Table.vue';
import H2Title from '@/components/core/title/H2Title.vue';
import { useUpdateTime } from '@/composables/useUpdateTime';
import { ENTITY_STATISTICS_COLUMNS } from '@/constants/columns/device';
import { transformStatistics } from '@/utils/statistics';

const props = defineProps({
  statistics: { type: Array as () => StatisticsData[], required: true },
});

const { t } = useI18n();
const { lastUpdateTime, updateLastUpdateTime } = useUpdateTime();

// Mock tags data - in a real application, this would come from a store or API
const tags = ref<Record<string, Tag>>({});

onActivated(() => {
  updateLastUpdateTime();

  // In a real application, you would fetch tags here
  // For now, we'll create placeholder tags based on the statistics IDs
  if (props.statistics && props.statistics.length > 0) {
    const newTags: Record<string, Tag> = {};
    props.statistics.forEach((stat) => {
      if (stat.ID && !tags.value[stat.ID]) {
        newTags[stat.ID] = { id: stat.ID, name: `${stat.ID}` };
      }
    });
    tags.value = { ...tags.value, ...newTags };
  }
});

// Use the utility function to transform statistics data
const transformedStatistics = computed(() => {
  return transformStatistics(props.statistics, tags.value);
});
</script>

<style scoped></style> -->
