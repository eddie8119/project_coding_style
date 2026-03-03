<template>
  <MaterialSectionShell
    :title="title"
    :add-label="t('label.material.add_new_library')"
    :add-label-class="'block mb-2'"
    :is-empty="!materials.length"
    :empty-state-message="t('message.material.empty')"
    :columns="tableColumns"
    table-min-width="1000px"
    table-max-body-height="420px"
    :batch-button-disabled="isBatchUpdateDisabled"
    :batch-button-label="t('button.batch_update')"
    @batch-click="handleBatchUpdateMaterials"
  >
    <template #add-form>
      <MaterialDefinitionAdd :unit-options="unitOptions" @submit="handleCreate" />
    </template>

    <template #rows>
      <MaterialDefinitionRowForm
        v-for="item in materials"
        :key="item.id"
        ref="definitionRowRefs"
        :initial-data="item"
        :unit-options="unitOptions"
        @delete="handleDelete"
      />
    </template>
  </MaterialSectionShell>
</template>

<script setup lang="ts">
import { ElMessage } from 'element-plus';
import { computed, ref } from 'vue';
import { useI18n } from 'vue-i18n';

import MaterialDefinitionAdd from './MaterialDefinitionAdd.vue';
import MaterialDefinitionRowForm from './MaterialDefinitionRowForm.vue';

import type { MaterialDefinitionResponse } from '@/types/response';

import MaterialSectionShell from '@/components/material/MaterialSectionShell.vue';
import { useMaterialDefinitions } from '@/composables/query/useMaterialDefinitions';
import { getMaterialDefinitionColumns } from '@/constants/materialTableColumns';

const props = defineProps<{
  title: string;
  materials: MaterialDefinitionResponse[];
  unitOptions: string[];
  construction: string;
}>();

const emit = defineEmits(['create', 'update', 'delete']);

const { t } = useI18n();

const { batchUpdateMaterialDefinitions, isBatchUpdatingMaterialDefinitions } =
  useMaterialDefinitions();

const definitionRowRefs = ref<InstanceType<typeof MaterialDefinitionRowForm>[]>([]);

const tableColumns = computed(() => getMaterialDefinitionColumns(t));

const isBatchUpdateDisabled = computed(
  () => !props.materials.length || isBatchUpdatingMaterialDefinitions.value
);

const handleCreate = (values: Omit<MaterialDefinitionResponse, 'id'>) => {
  emit('create', { ...values, construction: props.construction });
};

const handleDelete = (id: string) => {
  emit('delete', id);
};

const collectLatestDefinitions = () =>
  props.materials.map((material, index) => {
    const formRef = definitionRowRefs.value[index];
    if (!formRef?.values) return material;
    return {
      ...material,
      ...formRef.values,
    } as MaterialDefinitionResponse;
  });

const handleBatchUpdateMaterials = async () => {
  if (!props.materials.length || isBatchUpdatingMaterialDefinitions.value) return;

  const result = await batchUpdateMaterialDefinitions(collectLatestDefinitions());
  if (!result) {
    ElMessage.error(t('message.material.batch_update.failed'));
    return;
  }
  ElMessage.success(t('message.material.batch_update.success'));
};
</script>
