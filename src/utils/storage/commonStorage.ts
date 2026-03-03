import type { ConstructionSelection } from '@/types/selection';

export const COMMON_STORAGE_KEY = 'common_localstorage';

export type CommonLocalStorageData = {
  constructionItemsFromCommon: ConstructionSelection[];
  unitItemsFromCommon: string[];
  projectTypeItemsFromCommon: string[];
};

export const loadCommonLocalStorage = (): CommonLocalStorageData | null => {
  try {
    const raw = localStorage.getItem(COMMON_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as CommonLocalStorageData;
    return {
      constructionItemsFromCommon: Array.isArray(parsed.constructionItemsFromCommon)
        ? parsed.constructionItemsFromCommon
        : [],
      unitItemsFromCommon: Array.isArray(parsed.unitItemsFromCommon)
        ? parsed.unitItemsFromCommon
        : [],
      projectTypeItemsFromCommon: Array.isArray(parsed.projectTypeItemsFromCommon)
        ? parsed.projectTypeItemsFromCommon
        : [],
    };
  } catch (error) {
    console.error('Failed to parse common localStorage data:', error);
    return null;
  }
};

export const persistCommonLocalStorage = (data: CommonLocalStorageData) => {
  try {
    localStorage.setItem(COMMON_STORAGE_KEY, JSON.stringify(data));
  } catch (error) {
    console.error('Failed to save common localStorage data:', error);
  }
};

export const clearCommonLocalStorage = () => {
  try {
    localStorage.removeItem(COMMON_STORAGE_KEY);
  } catch (error) {
    console.error('Failed to clear common localStorage data:', error);
  }
};
