<template>
  <div
    class="panel-container md:min-h-[205px].lg:min-h-[205px] relative border border-dashed border-secondary-red"
  >
    <div class="steps-wrapper">
      <div class="flex flex-col items-center gap-4">
        <div class="flex items-center">
          <ProcessStep
            v-for="(step, index) in steps"
            :key="index"
            :step="index + 1"
            :title="step.title"
            :status="step.status"
            :is-last="index === steps.length - 1"
          />
        </div>

        <TextButton
          v-if="activeStep && props.isAdmin"
          variant="primary"
          :disabled="isButtonDisabled"
          :loading="activeStep?.status === 'running'"
          size="md"
          class="max-w-[200px]"
          @click="handleStep"
        >
          {{ activeStep.status === 'running' ? ' ' : t('device.action') }}
        </TextButton>
      </div>
    </div>

    <div v-if="isShowRemoteController" class="absolute right-2 top-2 w-16 rounded-full">
      <img src="@/assets/icons/Remote.png" alt="Remote Icon" class="" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';

import type { AlarmRecord } from '@/types/alarm';

import { alarmApi } from '@/api/alarm';
import TextButton from '@/components/core/button/TextButton.vue';
import ProcessStep from '@/components/core/steps/ProcessStep.vue';
import { ProcessStatus } from '@/types/action';
import { ObservationType } from '@/types/device';
import { AlarmStatus } from '@/types/label';

interface Step {
  title: string;
  status: ProcessStatus;
}

const { t } = useI18n();

const props = defineProps<{
  formattedDeviceAlarmRecords: AlarmRecord[] | null;
  isAdmin: boolean;
  isShowHandleProcess: boolean;
  handleStatus: string | undefined;
  handleId: string | undefined;
  id: string;
  observationType: ObservationType;
  showAlarmContent: string | null;
  showAlarmSeverity: string | null;
}>();

// 可以遠端控制 目前只有 PH儀器可以控
const isShowRemoteController = computed(() => {
  switch (props.observationType) {
    case ObservationType.PH:
      return true;
    default:
      return false;
  }
});

// 準備步驟素材
const remoteCleaningStep = { title: t('device.handle_action.remote_cleaning') };
const replacementStep = { title: t('device.handle_action.electrode_replacement') };
const reachedLifeStep = { title: t('device.handle_action.electrode_reached_life') };

const warningSteps = [remoteCleaningStep, replacementStep, reachedLifeStep];
const severityMap: Record<string, { title: string }[]> = {
  W100: warningSteps,
  W101: warningSteps,
  W102: warningSteps,
  C100: [replacementStep, reachedLifeStep],
  C101: [reachedLifeStep],
};

const allSteps = computed(() => {
  return severityMap[props.showAlarmSeverity ?? ''] ?? [replacementStep];
});

const steps = ref<Step[]>([]);

// 產生真正步驟 steps.value
// This watch will set up the initial state and update the first step's title if it changes.
watch(
  () => allSteps.value,
  (currentSteps) => {
    if (steps.value.length === 0) {
      steps.value = [{ title: currentSteps[0].title, status: ProcessStatus.PENDING }];
      return;
    }

    // If the process is still on the first step and hasn't started, update its title.
    // This handles the case where `showAlarmContent` arrives after initialization.
    if (steps.value.length === 1 && steps.value[0].status === ProcessStatus.PENDING) {
      steps.value[0].title = currentSteps[0].title;
    }
  },
  { immediate: true, deep: true }
);

// 找到 當下第一個還未完成的步驟
const activeStep = computed(() => steps.value.find((step) => step.status !== ProcessStatus.FINISH));

// 按鈕是否 不用操作
const isButtonDisabled = computed(() => {
  // 目前演示 所以第二步驟後 都不用操作
  if (steps.value.length === 2) return false;

  if (!activeStep.value || !props.isShowHandleProcess) return true;

  // 有還在RUNNING 或是 FINISH 就不用操作
  if (
    activeStep.value.status === ProcessStatus.RUNNING ||
    activeStep.value.status === ProcessStatus.FINISH
  )
    return false;

  return false;
});

// 移動狀態
const addNextStep = () => {
  const currentIndex = steps.value.length - 1;

  if (currentIndex < allSteps.value.length - 1) {
    steps.value.push({
      title: allSteps.value[currentIndex + 1].title,
      status: ProcessStatus.PENDING,
    });
  }
};

// 格式處理 製作body的參數
const prepareAlarmParams = (): string => {
  const target = props.formattedDeviceAlarmRecords?.find(
    (r) => r.alarm_status === AlarmStatus.UNRESOLVED
  );
  if (!target) return '';

  return `${target.device}___${encodeURIComponent(target.version)}`;
};

const handleStep = async () => {
  // 檢查為PENDING
  if (!activeStep.value || activeStep.value.status !== ProcessStatus.PENDING) return;

  // 改變步驟狀態
  activeStep.value.status = ProcessStatus.RUNNING;

  const params = prepareAlarmParams();

  // 真正操作api
  try {
    await alarmApi.postAlarmRecords(params, {
      action: 'calibrate',
      operation: 'start',
    });

    addNextStep();
  } catch (error) {
    console.error('Failed to handle step:', error);
    if (activeStep.value) activeStep.value.status = ProcessStatus.FAILED;
  }
};

// 為了要顯示最即時的當下狀態
watch(
  () => [props.handleStatus, props.handleId],
  ([newStatus, newId]) => {
    // console.log(555555,newVal)

    if (newId !== props.id || !activeStep.value) return;

    // 正在執行
    if (newStatus === ProcessStatus.RUNNING) {
      activeStep.value.status = newStatus;

      if (steps.value.length === 1) addNextStep();
    }
    // 完成時
    if (newStatus === ProcessStatus.FINISH) {
      activeStep.value.status = newStatus;
    }
  }
);
</script>

<style scoped>
.process-steps {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.steps-wrapper {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  position: relative;
  padding: 0 1rem;
  gap: 40px; /* Controls spacing between step indicators */
}

.step-content {
  margin-top: 1rem;
  padding: 1rem;
  border-top: 1px solid #e5e7eb;
}
</style>
