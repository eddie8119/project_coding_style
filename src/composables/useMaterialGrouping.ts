import { computed, type Ref } from 'vue';
import { useI18n } from 'vue-i18n';

import type { MaterialGroup as MaterialGroupData } from '@/types/response';
import type { MaterialResponse } from '@/types/response';
import type { ConstructionSelection } from '@/types/selection';

export function useMaterialGrouping(
  materials: Ref<MaterialResponse[] | undefined>,
  constructionContainer: Ref<ConstructionSelection[] | null>
) {
  const { t } = useI18n();

  const groupedMaterials = computed<MaterialGroupData[]>(() => {
    if (!materials.value || !constructionContainer.value) return [];

    const groups: Record<string, MaterialGroupData> = {};

    // Initialize groups based on the construction container to ensure all types are represented
    for (const construction of constructionContainer.value) {
      groups[construction.id] = {
        id: construction.id,
        name: construction.name,
        materials: [],
      };
    }

    const unassignedGroupId = 'unassigned';
    groups[unassignedGroupId] = {
      id: unassignedGroupId,
      name: t('message.material.group.unassigned'),
      materials: [],
    };

    // 目前 MaterialResponse 不再包含 construction 欄位，因此無法從材料本身判斷工程類型
    // 暫時將所有材料歸類到未指定群組（unassigned），僅保留容器本身的群組結構
    for (const material of materials.value) {
      groups[unassignedGroupId].materials.push(material);
    }

    // Order groups by constructionContainer sequence, and add unassigned group at the end
    const ordered: MaterialGroupData[] = [];
    for (const c of constructionContainer.value) {
      const g = groups[c.id];
      if (g) {
        ordered.push(g);
      }
    }

    // Add the unassigned group only if it has materials
    if (groups[unassignedGroupId].materials.length > 0) {
      ordered.push(groups[unassignedGroupId]);
    }

    return ordered;
  });

  return {
    groupedMaterials,
  };
}
