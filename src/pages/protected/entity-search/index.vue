<template>
  <div class="flex flex-col gap-6">
    <H1Title title="Entity Search" />
    <EntitySearchForm @search="handleSearch" />
  </div>

  <!-- Results View -->
  <router-view v-if="$route.name === 'overviewEntity'" :key="$route.path" />
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router';

import H1Title from '@/components/core/title/H1Title.vue';
import EntitySearchForm from '@/components/entity/EntitySearchForm.vue';

const router = useRouter();

interface SearchParams {
  category: string;
  entity: string;
}

const handleSearch = (params: SearchParams) => {
  router.push({
    name: 'overviewEntity',
    query: {
      category: params.category,
      entity: params.entity,
    },
  });
};
</script>

<style lang="scss" scoped></style>
