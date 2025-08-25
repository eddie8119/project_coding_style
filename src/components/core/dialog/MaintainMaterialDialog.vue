<template>
  <dialog-container
    :visible="props.visible"
    custom-class="buy-material-dialog"
    :title="`${t('column.maintain')} - ${props.material?.material_name}`"
    destroy-on-close
    :width="'500px'"
    @update:visible="(value) => emit('update:visible', value)"
    @close="handleClose"
  >
    <el-form :model="form">
      <el-form-item :label="t('column.material_name')">
        <span>{{ props.material?.material_name }}</span>
      </el-form-item>
      <el-form-item :label="t('column.remaining_quantity')">
        <span>{{ props.material?.remaining_quantity }}</span>
      </el-form-item>
      <el-form-item :label="t('dialog.buy_quantity')" required>
        <el-input-number v-model="form.quantity" :min="1" />
      </el-form-item>
    </el-form>

    <template #footer>
      <el-button @click="handleClose">{{ t('common.cancel') }}</el-button>
      <el-button type="primary" @click="handleConfirm">{{ t('common.confirm') }}</el-button>
    </template>
  </dialog-container>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useI18n } from 'vue-i18n';

import DialogContainer from './DialogContainer.vue';

const { t } = useI18n();

const props = defineProps<{
  visible: boolean;
  material: any;
}>();

const emit = defineEmits<{
  (e: 'update:visible', value: boolean): void;
  (e: 'confirm', value: { quantity: number }): void;
}>();

const form = ref({
  quantity: 1,
});

const handleClose = () => {
  form.value.quantity = 1;
  emit('update:visible', false);
};

const handleConfirm = () => {
  emit('confirm', { quantity: form.value.quantity });
  handleClose();
};
</script>

<style lang="scss" scoped></style>
