import { defineStore } from 'pinia';
import { ref, type Ref } from 'vue';

import type { ConstructionSelection } from '@/types/selection';
export const useCommonStore = defineStore('common', () => {
  const constructionItems: Ref<ConstructionSelection[]> = ref([]);
  const unitItems: Ref<string[]> = ref([]);
  const projectTypeItems: Ref<string[]> = ref([]);

  const setConstructionItems = (items: ConstructionSelection[]) => {
    constructionItems.value = items;
  };

  const setUnitItems = (items: string[]) => {
    unitItems.value = items;
  };

  const setProjectTypeItems = (items: string[]) => {
    projectTypeItems.value = items;
  };

  return {
    constructionItems,
    unitItems,
    projectTypeItems,
    setConstructionItems,
    setUnitItems,
    setProjectTypeItems,
  };
});
