import { ref, type Ref } from 'vue';

import {
  buildConstructionFromParsed,
  buildPlanningTasksPayload,
  findExistingProjectForParsed,
  syncTaskCategoryIdsWithConstruction,
  toIsoStringOrNull,
} from './useProgressExcelImport.helpers';

import type { GanttProject, ProgressParsedExcelData } from '@/types/gantt';
import type { ProjectResponse } from '@/types/response';
import type { ConstructionSelection } from '@/types/selection';

import { useCommon } from '@/composables/query/useCommon';
import { usePlanningTasks } from '@/composables/query/usePlanningTasks';
import { useProject, useProjectMutations } from '@/composables/query/useProject';
import { useCommonAction } from '@/composables/useCommonAction';
import { UNIT_BASIC } from '@/constants/unit';
import { createDummyGanttData } from '@/utils/dummyGanttData';

export const useProgressExcelImport = (projectsRef: Ref<ProjectResponse[] | undefined>) => {
  const dummyGanttProject = ref<GanttProject | null>(null);
  const isProcessing = ref(false);
  const uploadError = ref<string | null>(null);

  const { constructionItemsFromCommon, fetchedCommon, createCommon } = useCommon();
  const { updateConstructionData } = useCommonAction();
  const { createProject } = useProject();
  const { updateProjectById } = useProjectMutations();
  const { createPlanningTasks, replacePlanningTasksByProjectId } = usePlanningTasks();

  // 將construction 儲存到Common，並回傳同步後的 construction 列表
  const syncCommonFromParsed = async (
    parsedData: ProgressParsedExcelData
  ): Promise<ConstructionSelection[]> => {
    const parsedCategories = parsedData.categories;
    if (!parsedCategories || parsedCategories.length === 0)
      return constructionItemsFromCommon.value ?? [];

    // 1) 若尚未有任何 Common 紀錄（首次使用）：使用 createCommon 建立一筆
    if (!fetchedCommon.value) {
      const construction = buildConstructionFromParsed(parsedCategories);

      await createCommon({
        construction,
        unit: UNIT_BASIC,
      });

      return construction;
    }

    // 2) 已存在 Common：從 constructionItemsFromCommon 取出現有資料，做去重與追加
    const existingCnstructionItems = constructionItemsFromCommon.value;

    const existingByName = new Set(existingCnstructionItems.map((item) => item.name));
    const newItems: ConstructionSelection[] = buildConstructionFromParsed(
      parsedCategories.filter((category) => !existingByName.has(category.name))
    );

    if (newItems.length === 0) return existingCnstructionItems;

    const merged: ConstructionSelection[] = [...existingCnstructionItems, ...newItems];
    await updateConstructionData(merged);

    return merged;
  };

  // 儲存到Project
  const upsertProjectFromParsed = async (
    parsedData: ProgressParsedExcelData,
    fileName: string,
    constructionContainer: ConstructionSelection[],
    type: string = 'residential'
  ): Promise<string | undefined> => {
    try {
      const existingProject = findExistingProjectForParsed(parsedData, fileName, projectsRef);

      const {
        projectName,
        dateRange,
        tasks,
        segments,
        dateColumns,
        specialHolidays,
        paymentRemittances,
        preConstructionNotes,
      } = parsedData;
      const planningStartDate = toIsoStringOrNull(dateRange?.startDate);
      const planningEndDate = toIsoStringOrNull(dateRange?.endDate);

      const baseProjectPayload = {
        title: projectName,
        type,
        constructionContainer,
        planningEndDate,
        planningStartDate,
        planningSegments: segments,
        planningDateColumns: dateColumns,
        planningSpecialHolidays: specialHolidays,
        planningPaymentRemittances: paymentRemittances,
        planningPreConstructionNotes: preConstructionNotes,
      };

      const planningTasksPayload = buildPlanningTasksPayload(tasks);

      if (existingProject) {
        // 若已有同名專案，則更新該專案
        await updateProjectById(existingProject.id, {
          ...baseProjectPayload,
          floorPlanUrls: existingProject.floorPlanUrls ?? null,
        });

        // 更新專案後，使用批次替換策略：刪除舊任務並建立新任務
        if (planningTasksPayload.length > 0) {
          await replacePlanningTasksByProjectId(planningTasksPayload, existingProject.id);
        }

        return existingProject.id;
      }

      // 否則
      // 建立新專案
      const newProject = await createProject({
        ...baseProjectPayload,
        floorPlanUrls: null,
      });

      // 建立專案後，批次建立 Planning Tasks
      if (newProject?.id && planningTasksPayload.length > 0) {
        await createPlanningTasks(planningTasksPayload, newProject.id);
      }

      return newProject?.id;
    } catch (error) {
      console.error('upsertProjectFromParsed 發生錯誤:', error);
      throw error;
    }
  };

  const processParsedExcelData = async (
    parsedData: ProgressParsedExcelData,
    fileName: string,
    type: string = 'residential'
  ): Promise<string | undefined> => {
    // 1) 先用 Excel 類別更新 / 合併 Common 的 construction，取得最終的「全域」列表
    const mergedConstructionFromCommon = await syncCommonFromParsed(parsedData);

    // 2) 根據合併後的 construction，把 parsedData.categories / tasks 的 categoryId 同步成最終 ID
    syncTaskCategoryIdsWithConstruction(parsedData, mergedConstructionFromCommon);

    // 3) 建立專案時，僅使用此次 Excel 的類別作為 Project 的 constructionContainer
    //    這樣可避免把 Common 中其它舊項目一併塞進專案，造成互相汙染
    const projectConstructionContainer = buildConstructionFromParsed(parsedData.categories);

    return upsertProjectFromParsed(parsedData, fileName, projectConstructionContainer, type);
  };

  // 載入測試資料
  const loadProcessDummy = () => {
    dummyGanttProject.value = createDummyGanttData();
  };

  return {
    dummyGanttProject,
    isProcessing,
    uploadError,
    loadProcessDummy,
    processParsedExcelData,
  };
};
