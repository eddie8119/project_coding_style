<template></template>

<script setup lang="ts"></script>

<style scoped></style>

<!-- <template>
  <div class="alarm-setting-group">
    <div class="flex items-center gap-4">
      <div class="flex flex-col items-center justify-center gap-2">
        <p class="text-xl">{{ modelValue.alarm_type === 'upper' ? '>' : '<' }}</p>
        <el-switch v-model="modelValue.active" :disabled="disabled" @change="handleSwitchChange" />
      </div>

      <div class="flex flex-col gap-3">
        <div class="grid grid-cols-2 gap-3 lg:grid-cols-3">
          <Selector
            :model-value="modelValue.severity"
            :options="severityList"
            :label="t('label.alarm.alarm_level')"
            :disabled="!modelValue.active || disabled"
            :loading="loading"
            :filterable="true"
            class="min-w-[90px] flex-1"
            value-key="label"
            label-key="label"
            @update:model-value="updateModelValue('severity', $event)"
          />
          <Selector
            :model-value="modelValue.interval"
            :options="intervalList"
            :label="t('label.alarm.time_interval')"
            :disabled="!modelValue.active || disabled"
            :loading="loading"
            :filterable="true"
            class="min-w-[90px] flex-1"
            value-key="label"
            label-key="label"
            @update:model-value="updateModelValue('interval', $event)"
          />
          <Selector
            :model-value="modelValue.repeat"
            :options="repeatList"
            :label="t('label.alarm.repeat')"
            :disabled="!modelValue.active || disabled"
            :loading="loading"
            :filterable="true"
            class="min-w-[90px] flex-1"
            value-key="label"
            label-key="label"
            @update:model-value="updateModelValue('repeat', $event)"
          />
        </div>
        <div class="flex w-full gap-3">
          <div class="flex min-w-[90px] flex-col items-start">
            <span class="">{{ t('label.alarm.value') }}</span>
            <el-input-number
              :model-value="modelValue.threshold"
              :min="lowBound"
              :max="highBound"
              :precision="1"
              :step="0.1"
              :size="isMobile ? 'default' : 'large'"
              controls-position="right"
              class="selector-style-input-number min-w-[90px] flex-1"
              :disabled="!modelValue.active || disabled"
              @update:model-value="updateModelValue('threshold', $event)"
            />
          </div>
          <div class="flex flex-1 flex-col items-start">
            <span class="">{{ t('label.alarm.email') || 'Email' }}</span>
            <el-input
              type="email"
              :model-value="modelValue.email"
              :disabled="!modelValue.active || disabled"
              :placeholder="t('placeholder.email')"
              class="flex-1"
              @update:model-value="updateModelValue('email', $event)"
            />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useWindowSize } from '@vueuse/core';
import { ref, watch, computed } from 'vue';
import { useI18n } from 'vue-i18n';

import Selector from '@/components/core/input/Selector.vue';

const { t } = useI18n();

// options
const intervalList = ref([{ label: 3 }, { label: 5 }, { label: 10 }, { label: 30 }, { label: 60 }]);
const repeatList = ref([
  { label: 0 },
  { label: 1 },
  { label: 2 },
  { label: 3 },
  { label: 4 },
  { label: 5 },
]);
const severityList = ref([
  { label: t('option.alarm.notice') },
  { label: t('option.alarm.caution') },
  { label: t('option.alarm.warning') },
]);

const { width } = useWindowSize();

const isMobile = computed(() => width.value < 640);

interface AlarmSettingModel {
  alarm_type: 'upper' | 'lower';
  interval: number;
  severity: string;
  threshold: number;
  active: boolean;
  repeat: number;
  email?: string[];
}

const props = defineProps({
  modelValue: {
    type: Object as () => AlarmSettingModel,
    required: true,
  },
  disabled: {
    type: Boolean,
    default: false,
  },
  loading: {
    type: Boolean,
    default: false,
  },
  lowBound: {
    type: Number,
    default: 0,
  },
  highBound: {
    type: Number,
    default: 100,
  },
  enabled: {
    type: Boolean,
    default: false,
  },
  unit: {
    type: String,
    default: '',
  },
});

const emit = defineEmits<{
  (e: 'update:modelValue', value: AlarmSettingModel): void;
  (e: 'enableChange', enabled: boolean): void;
}>();

const isEnabled = ref(props.enabled);

watch(props.enabled, (newVal: boolean) => {
  isEnabled.value = newVal;
});

watch(props.disabled, (newVal: boolean) => {
  if (newVal) {
    isEnabled.value = false;
  }
});

const handleSwitchChange = (value: boolean) => {
  emit('enableChange', value);
};

const updateModelValue = (key: keyof AlarmSettingModel, value: string | number | null) => {
  if (value === null) return;
  emit('update:modelValue', { ...props.modelValue, [key]: value });
};
</script>

<style lang="scss" scoped>
.column-label {
  @apply text-xs text-gray-500;
}

:deep(.el-input-number) {
  @apply w-full sm:w-auto;

  .el-input__wrapper {
    @apply w-full sm:w-auto;
  }
}
</style> -->
