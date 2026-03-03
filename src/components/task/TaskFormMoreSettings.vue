<template>
  <div class="input-border space-y-4 p-3">
    <!-- 材料 -->
    <MaterialInput
      v-model="materials"
      :item-errors="itemErrors"
      @add="() => emit('add-material')"
      @remove="(index: number) => emit('remove-material', index)"
    />

    <!-- 提醒時間 -->
    <div class="flex flex-col">
      <Label :label="t('label.reminder_date_time')" />
      <ElDatePicker
        v-model="reminderDateTime"
        v-inputmode-none="isCoarsePointer"
        type="datetime"
        format="YYYY-MM-DD HH:mm"
        value-format="YYYY-MM-DD HH:mm"
        :placeholder="t('placeholder.select_date_and_time')"
        :editable="!isCoarsePointer"
        class="w-full"
        :default-time="defaultTime"
      />
    </div>

    <!-- 截止時間 -->
    <div class="flex flex-col">
      <Label :label="t('label.end_date_time')" />
      <ElDatePicker
        v-model="endDateTime"
        v-inputmode-none="isCoarsePointer"
        type="datetime"
        format="YYYY-MM-DD HH:mm"
        value-format="YYYY-MM-DD HH:mm"
        :placeholder="t('placeholder.select_date_and_time')"
        :editable="!isCoarsePointer"
        class="w-full"
        :default-time="defaultTime"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ElDatePicker } from 'element-plus';
import { useField } from 'vee-validate';
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';

import MaterialInput, {
  type Item as MaterialItem,
} from '@/components/core/input/MaterialInput.vue';
import Label from '@/components/core/title/Label.vue';
import vInputmodeNone from '@/directives/vInputmodeNone';
import { hasCoarsePointer } from '@/utils/device';

defineProps<{
  itemErrors: Record<number, string>;
}>();

const emit = defineEmits<{
  'add-material': [];
  'remove-material': [index: number];
}>();
const { t } = useI18n();

const { value: materials } = useField<MaterialItem[]>('materials');
if (!materials.value) {
  materials.value = [];
}
const { value: reminderDateTime } = useField<string | undefined>('reminderDateTime');
const { value: endDateTime } = useField<string | undefined>('endDateTime');

const defaultTime = computed(() => {
  const date = new Date();
  date.setHours(10, 0, 0, 0);
  return date;
});

const isCoarsePointer = hasCoarsePointer();
</script>

<style scoped></style>
