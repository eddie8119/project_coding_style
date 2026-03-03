import { ref, watch } from 'vue';

import { useCommon } from './query/useCommon';

import type { ConstructionSelection } from '@/types/selection';
import type { CommonLocalStorageData } from '@/utils/storage/commonStorage';

import { loadCommonLocalStorage, persistCommonLocalStorage } from '@/utils/storage/commonStorage';

export function useCommonAction() {
  const {
    fetchedCommon,
    updateCommon,
    constructionItemsFromCommon,
    unitItemsFromCommon,
    projectTypeItemsFromCommon,
  } = useCommon();
  // construction
  const newConstructionItem = ref<string>('');
  const localConstructionItems = ref<ConstructionSelection[]>([]);
  // unit
  const newUnitItem = ref<string>('');
  const localUnitItems = ref<string[]>([]);
  // projectType (no use)
  const newProjectTypeItem = ref<string>('');
  const localProjectTypeItems = ref<string[]>([]);

  const applyStoredDataToLocalState = (data: CommonLocalStorageData) => {
    localConstructionItems.value = [...data.constructionItemsFromCommon];
    localUnitItems.value = [...data.unitItemsFromCommon];
    localProjectTypeItems.value = [...data.projectTypeItemsFromCommon];
  };

  const getLocalStorageSnapshot = (): CommonLocalStorageData => ({
    constructionItemsFromCommon: [...localConstructionItems.value],
    unitItemsFromCommon: [...localUnitItems.value],
    projectTypeItemsFromCommon: [...localProjectTypeItems.value],
  });

  const storedCommonData = loadCommonLocalStorage();
  if (storedCommonData) {
    applyStoredDataToLocalState(storedCommonData);
  }

  let skipInitialWatch = Boolean(storedCommonData);

  // Initialize local construction items
  watch(
    () =>
      [
        constructionItemsFromCommon.value,
        unitItemsFromCommon.value,
        projectTypeItemsFromCommon.value,
      ] as const,
    ([newConstructionItems, newUnitItems, newProjectTypeItems]) => {
      if (skipInitialWatch) {
        skipInitialWatch = false;
        return;
      }
      if (newConstructionItems) {
        localConstructionItems.value = [...newConstructionItems] as ConstructionSelection[];
      }
      if (newUnitItems) {
        localUnitItems.value = [...newUnitItems] as string[];
      }
      if (newProjectTypeItems) {
        localProjectTypeItems.value = [...newProjectTypeItems] as string[];
      }

      persistCommonLocalStorage(getLocalStorageSnapshot());
    },
    { immediate: true }
  );

  type DataType = 'construction' | 'unit' | 'projectType';

  // 通用的新增資料方法
  const addData = async (type: DataType) => {
    // 根據類型選擇對應的資料和引用
    const dataMap = {
      construction: {
        newItem: newConstructionItem,
        localItems: localConstructionItems,
      },
      unit: {
        newItem: newUnitItem,
        localItems: localUnitItems,
      },
      projectType: {
        newItem: newProjectTypeItem,
        localItems: localProjectTypeItems,
      },
    };

    const { newItem, localItems } = dataMap[type];
    const item = newItem.value.trim();

    // 驗證
    if (type === 'construction') {
      const constructionItems = localItems.value as ConstructionSelection[];
      if (!item || constructionItems.some((c) => c.name === item)) return false;
    } else {
      if (!item || (localItems.value as string[]).includes(item)) return false;
    }

    // 更新資料
    if (type === 'construction') {
      // 以時間戳作為字串 ID，避免型別不一致
      const newId = Date.now().toString();
      const updatedItems = [
        ...(localItems.value as ConstructionSelection[]),
        { name: item, id: newId },
      ];
      await updateData(type, updatedItems);
    } else {
      const updatedItems = [...(localItems.value as string[]), item];
      await updateData(type, updatedItems);
    }

    // 清空輸入
    newItem.value = '';
    return true;
  };

  // 通用的更新資料方法
  const updateData = async (type: DataType, updatedItems: ConstructionSelection[] | string[]) => {
    // 準備更新資料
    const updatePayload = {
      construction:
        type === 'construction'
          ? (updatedItems as ConstructionSelection[])
          : localConstructionItems.value,
      unit: type === 'unit' ? (updatedItems as string[]) : localUnitItems.value,
      projectType:
        type === 'projectType' ? (updatedItems as string[]) : localProjectTypeItems.value,
    };

    // 更新資料
    await updateCommonData(updatePayload);

    // 更新本地狀態
    if (type === 'construction')
      localConstructionItems.value = updatedItems as ConstructionSelection[];
    if (type === 'unit') localUnitItems.value = updatedItems as string[];
    if (type === 'projectType') localProjectTypeItems.value = updatedItems as string[];

    persistCommonLocalStorage(getLocalStorageSnapshot());
  };

  const addConstructionData = () => addData('construction');
  const updateConstructionData = (items: ConstructionSelection[]) =>
    updateData('construction', items);

  const addUnitData = () => addData('unit');
  const updateUnitData = (items: string[]) => updateData('unit', items);

  const addProjectTypeData = () => addData('projectType');
  const updateProjectTypeData = (items: string[]) => updateData('projectType', items);

  const updateCommonData = async (updateData: {
    construction: ConstructionSelection[];
    unit: string[];
    projectType: string[];
  }) => {
    try {
      if (fetchedCommon.value && fetchedCommon.value.id) {
        await updateCommon({
          id: fetchedCommon.value.id,
          data: {
            construction: updateData.construction,
          },
        });

        // 更新本地狀態
        localConstructionItems.value = updateData.construction;
        localUnitItems.value = updateData.unit;
        localProjectTypeItems.value = updateData.projectType;

        return true;
      }
    } catch (error) {
      console.error('Failed to update common data:', error);
      return false;
    }
  };

  return {
    updateCommonData,
    // construction
    newConstructionItem,
    localConstructionItems,
    addConstructionData,
    updateConstructionData,
    // unit
    newUnitItem,
    localUnitItems,
    addUnitData,
    updateUnitData,
    // projectType
    newProjectTypeItem,
    localProjectTypeItems,
    addProjectTypeData,
    updateProjectTypeData,
  };
}
