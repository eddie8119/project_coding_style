<!-- <template>
  <div class="panel-container h-fit min-h-min w-full p-4">
    <H3Title :title="'Tag: ' + props.gaugeProps.tag" class="mb-2" />
    <div v-for="data in showData" :key="data.key">
      <p class="font-regular text-xs text-gray-500">{{ data.key }}: {{ data.value }}</p>
    </div>
    <GaugeChart :gauge-props="props.gaugeProps" />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';

import GaugeChart from './GaugeChart.vue';

import H3Title from '@/components/core/title/H3Title.vue';

const props = defineProps({
  gaugeProps: {
    type: Object,
    required: true,
  },
});

const showData = ref<{ key: string; value: number }[]>([
  { key: 'Temperature', value: props.gaugeProps.temperature },
  { key: 'mv', value: props.gaugeProps.mv },
]);
</script> -->
