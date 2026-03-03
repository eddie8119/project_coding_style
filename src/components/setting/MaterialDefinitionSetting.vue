<template>
  <section id="material-definition-setting" class="mt-8 min-w-0">
    <H1Title :title="t('title.material_library')" />
    <HorizontalScrollLayout>
      <div
        v-for="group in materialGroups"
        :key="group.construction.id"
        class="material-construction-container"
      >
        <MaterialDefinitionContainer
          :title="group.construction.name"
          :materials="group.materials"
          :unit-options="unitOptions"
          :construction="group.construction.id"
          @create="handleCreate"
          @update="handleUpdate"
          @delete="handleDelete"
        />
      </div>
    </HorizontalScrollLayout>
  </section>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';

import MaterialDefinitionContainer from './MaterialDefinitionContainer.vue';

import type { CommonResponse, MaterialDefinitionResponse } from '@/types/response';

import HorizontalScrollLayout from '@/components/app-layout/HorizontalScrollLayout.vue';
import H1Title from '@/components/core/title/H1Title.vue';
import { useMaterialDefinitions } from '@/composables/query/useMaterialDefinitions';

const props = defineProps<{
  fetchedCommon: CommonResponse;
}>();

const { t } = useI18n();
const {
  materialDefinitions,
  createMaterialDefinition,
  updateMaterialDefinition,
  deleteMaterialDefinition,
} = useMaterialDefinitions();

const unitOptions = computed(() => props.fetchedCommon?.unit || []);

const materialGroups = computed(() => {
  const constructions = props.fetchedCommon?.construction;
  if (!constructions?.length) return [];

  const grouped = new Map<
    string,
    { construction: CommonResponse['construction'][0]; materials: MaterialDefinitionResponse[] }
  >();

  constructions.forEach((construction) => {
    grouped.set(construction.id, { construction, materials: [] });
  });

  materialDefinitions.value?.forEach((definition) => {
    const group = definition.construction ? grouped.get(definition.construction) : undefined;
    if (group) {
      group.materials.push(definition);
    }
  });

  return Array.from(grouped.values());
});

const handleCreate = (values: Omit<MaterialDefinitionResponse, 'id'>) => {
  createMaterialDefinition(values);
};

const handleUpdate = (values: MaterialDefinitionResponse) => {
  updateMaterialDefinition(values);
};

const handleDelete = (id: string) => {
  deleteMaterialDefinition(id);
};
</script>
