<template></template>

<script setup lang="ts"></script>

<style scoped></style>

<!-- <template>
  <el-form
    class="flex w-full flex-col items-center gap-4 md:flex-row"
    :loading="isLoading"
    @submit.prevent="handleSearch"
  >
    <Selector
      v-model="selectedCategory"
      :options="categories"
      label="Category"
      placeholder="Select a category"
      :loading="isLoading"
      class="w-full md:w-1/4"
      value-key="name"
      label-key="name"
      option-class="capitalize"
      @change="handleCategoryChange"
    />

    <Selector
      v-model="selectedEntity"
      :options="entities"
      label="Entity"
      placeholder="Select an entity"
      :disabled="!selectedCategory || isLoading"
      :loading="isLoading"
      :filterable="true"
      class="w-full md:w-1/4"
      :value-key="entityValueKey"
      :label-key="entityValueKey"
    />

    <TextButton
      variant="primary"
      :disabled="!selectedEntity || isLoading"
      :loading="isLoading"
      size="md"
      @click="handleSearch"
    >
      Search
    </TextButton>
  </el-form>
</template>

<script setup lang="ts">
import { ElMessage } from 'element-plus';
import { ref, computed } from 'vue';

import { deviceApi } from '@/api/device';
import { entitiesApi } from '@/api/entities';
import TextButton from '@/components/core/button/TextButton.vue';
import Selector from '@/components/core/input/Selector.vue';
import { sortByKey } from '@/utils/common';

interface CategoryOption {
  name: 'group' | 'tag' | 'id';
}

interface EntityOption {
  name?: string;
  ID?: string;
}

interface SearchParams {
  category: string;
  entity: string;
}

const emit = defineEmits<{
  (e: 'search', params: SearchParams): void;
}>();

const categories: CategoryOption[] = [{ name: 'group' }, { name: 'tag' }, { name: 'id' }];
const selectedCategory = ref<string | null>(null);
const selectedEntity = ref<string | null>(null);
const entities = ref<EntityOption[]>([]);
const isLoading = ref<boolean>(false);

async function fetchEntitiesByCategory(category: string) {
  selectedEntity.value = null;
  entities.value = [];
  isLoading.value = true;

  try {
    let response;

    if (category === 'group') {
      response = await entitiesApi.getGroups();
      entities.value = response.data.groups;
    } else if (category === 'tag') {
      response = await entitiesApi.getTags();
      entities.value = response.data.tags;
    } else if (category === 'id') {
      response = await deviceApi.getDevices();
      entities.value = response.data.devices;
    }

    const sortKey = category === 'id' ? 'ID' : 'name';
    entities.value.sort((a, b) => sortByKey(a, b, sortKey));
  } catch (err) {
    ElMessage.error('Failed to fetch entities. Please try again.');
    console.error('Fetch error:', err);
  } finally {
    isLoading.value = false;
  }
}

const handleCategoryChange = (newVal: string | number | null) => {
  if (newVal) {
    fetchEntitiesByCategory(newVal as string);
  }
};

const entityValueKey = computed(() => (selectedCategory.value === 'id' ? 'ID' : 'name'));

const handleSearch = () => {
  if (!selectedCategory.value || !selectedEntity.value) return;

  emit('search', {
    category: selectedCategory.value,
    entity: selectedEntity.value,
  });
};
</script> -->
