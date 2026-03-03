<template>
  <div v-if="isLoadingCommon" class="flex h-full w-full items-center justify-center">
    <Loading />
  </div>

  <div v-else class="grid-col-1 grid gap-4">
    <div v-if="!fetchedCommon" class="hint-container">
      <H2Title :title="t('setting.info.empty_common_data')" />
      <p class="text-color-difference max-w-md text-sm">
        {{ t('setting.info.empty_common_description') }}
      </p>

      <TextButton
        variant="primary"
        size="md"
        class="h-[30px] w-full px-6 md:w-auto"
        @click="goToPlanningProjects"
      >
        {{ t('setting.info.go_to_planning_projects') }}
      </TextButton>
    </div>

    <CommonSettingForm :fetched-common="fetchedCommon" :update-common="updateCommon" />
    <MaterialDefinitionSetting v-if="fetchedCommon" :fetched-common="fetchedCommon" />
  </div>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n';
import { useRouter } from 'vue-router';

import TextButton from '@/components/core/button/TextButton.vue';
import Loading from '@/components/core/loading/Loading.vue';
import H2Title from '@/components/core/title/H2Title.vue';
import CommonSettingForm from '@/components/setting/CommonSettingForm.vue';
import MaterialDefinitionSetting from '@/components/setting/MaterialDefinitionSetting.vue';
import { useCommon } from '@/composables/query/useCommon';

const { t } = useI18n();
const router = useRouter();
const { fetchedCommon, updateCommon, isLoadingCommon } = useCommon();

const goToPlanningProjects = () => {
  router.push('/planning/upload');
};
</script>

<style scoped></style>
