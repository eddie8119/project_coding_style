<template>
  <div class="flex h-[calc(100vh-108px)] flex-col">
    <!-- 頂部區域 -->
    <div class="mb-2 flex items-center">
      <H1Title :title="t('title.overview')" />
      <p class="ml-2 flex-nowrap text-gray-500">SITE_12</p>
    </div>

    <div class="flex flex-1 flex-col gap-3 overflow-hidden overflow-y-auto lg:flex-row">
      <div class="flex flex-1 flex-col gap-3 lg:w-8/12 xl:w-9/12">
        <div class="flex flex-1 flex-col gap-3 overflow-hidden xl:flex-row">
          <!-- 監測數據表格 -->
          <div
            class="panel-container order-2 h-[50vh] overflow-y-auto xl:order-1 xl:h-full xl:w-5/12"
          >
            <div v-show="observationChoose" class="mb-2 flex justify-end">
              <TextButton @click="initObservationChoose">
                {{ t('device.show_all_filter') }}
              </TextButton>
            </div>

            <div class="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-2">
              <DeviceMonitoringCard
                v-for="item in fetchedLabels"
                :key="item.ID"
                :item="item"
                :observation-choose="observationChoose"
                @observation-change="observationChoose = $event"
              />
            </div>
          </div>
          <!-- 3D 工廠視圖 -->
          <div class="order-1 h-[50vh] overflow-hidden xl:order-2 xl:h-auto xl:w-7/12">
            <FactoryScene
              :monitoring-items="threedShowItems"
              :observation-choose="observationChoose"
            />
          </div>
        </div>
      </div>

      <!-- 右側：狀態卡片和警報 -->
      <div class="lg:w-4/12 xl:w-3/12">
        <Alert class="h-full" :observation-choose="observationChoose" :is-reload="isReload" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ElMessage } from 'element-plus';
import { ref, computed, watch } from 'vue';
import { useI18n } from 'vue-i18n';

import TextButton from '@/components/core/button/TextButton.vue';
import H1Title from '@/components/core/title/H1Title.vue';
import Alert from '@/components/overview/Alert.vue';
import DeviceMonitoringCard from '@/components/overview/DeviceMonitoringCard.vue';
import FactoryScene from '@/components/overview/FactoryScene.vue';
import { useLabel } from '@/composables/useLabel';
import { useWebSocket } from '@/composables/useWebSocket';
import { ProcessStatus } from '@/types/action';
import { ObservationType } from '@/types/device';

const { t } = useI18n();
const { fetchedLabels, refetchLabels } = useLabel();
const { wsParsedData } = useWebSocket();

const observationChoose = ref<ObservationType | undefined>(undefined);

const threedShowItems = computed(() => {
  const allTags: {
    type: 'warning' | 'caution';
    label: string;
    observation: ObservationType;
  }[] = [];

  const arr = Array.isArray(fetchedLabels.value) ? fetchedLabels.value : [];

  arr.forEach((item) => {
    // 處理 warning
    const warning = item.warning || {};
    Object.values(warning).forEach((warningItem) => {
      if (warningItem.tag) {
        allTags.push({ type: 'warning', label: warningItem.tag, observation: item.ID });
      }
    });

    // 處理 caution
    const caution = item.caution || {};
    Object.values(caution).forEach((cautionItem) => {
      if (cautionItem.tag) {
        allTags.push({ type: 'caution', label: cautionItem.tag, observation: item.ID });
      }
    });
  });

  return allTags;
});

const initObservationChoose = () => {
  observationChoose.value = undefined;
};

const isReload = ref<boolean>(false);

watch(wsParsedData, (newVal) => {
  if (newVal?.app === 'action') {
    // 執行「類型限縮」。TypeScript 非常聰明，它知道在 WsData聯合類型中，只有 ActionWsData 這一個類型的
    if (newVal.status === ProcessStatus.FINISH) {
      isReload.value = true;
      refetchLabels();
      ElMessage.success(t('message.success.update_success'));
    } else if (newVal.status === ProcessStatus.RUNNING) {
      //復原模擬
      isReload.value = true;
      refetchLabels();
    }
  }
});
</script>

<style scoped></style>
