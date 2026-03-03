<template>
  <div class="flex items-center gap-2">
    <TextButton
      v-for="action in downloadActions"
      :key="action.key"
      type="button"
      variant="secondary"
      size="sm"
      class="px-3"
      :disabled="isProcessing"
      @click="action.handler"
    >
      <img src="@/assets/icons/Download.svg" alt="Download" class="mr-1 h-4 w-4" />
      {{ t(action.labelKey) }}
    </TextButton>
  </div>
</template>

<script setup lang="ts">
import ExcelJS from 'exceljs';
import html2canvas from 'html2canvas';
import { ref } from 'vue';
import { useI18n } from 'vue-i18n';

import type { GanttProject } from '@/types/gantt';

import TextButton from '@/components/core/button/TextButton.vue';
import { createGanttWorksheet } from '@/utils/excel/ganttExcelGenerator';

const props = defineProps<{
  ganttProject: GanttProject | null;
  ganttElementId: string; // The ID of the HTML element containing the chart to screenshot
}>();

const { t } = useI18n();
const isProcessing = ref(false);

const handleDownloadImage = async () => {
  if (!props.ganttElementId || isProcessing.value) return;
  const element = document.getElementById(props.ganttElementId);
  if (!element) {
    console.error(`Element with id ${props.ganttElementId} not found`);
    return;
  }

  try {
    isProcessing.value = true;
    const canvas = await html2canvas(element, {
      scale: 2, // Higher resolution
      useCORS: true,
      backgroundColor: '#ffffff',
      // Ignore elements that shouldn't be in the screenshot if needed
      ignoreElements: (element) => element.classList.contains('no-screenshot'),
    });

    const link = document.createElement('a');

    link.download = `${props.ganttProject?.name || 'project'}_${t('excel.download.gantt_image_suffix')}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
  } catch (error) {
    console.error('Failed to download image:', error);
  } finally {
    isProcessing.value = false;
  }
};

const handleDownloadExcel = async () => {
  if (!props.ganttProject || isProcessing.value) return;

  try {
    isProcessing.value = true;
    const workbook = new ExcelJS.Workbook();
    createGanttWorksheet(workbook, props.ganttProject, t);

    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    });

    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);

    link.download = `${props.ganttProject.name}_${t('excel.download.gantt_excel_suffix')}.xlsx`;
    link.click();

    URL.revokeObjectURL(link.href);
  } catch (error) {
    console.error('Failed to download excel:', error);
  } finally {
    isProcessing.value = false;
  }
};

interface DownloadAction {
  key: string;
  labelKey: string;
  handler: () => Promise<void> | void;
}

const downloadActions: DownloadAction[] = [
  {
    key: 'image',
    labelKey: 'button.download_image',
    handler: handleDownloadImage,
  },
  {
    key: 'excel',
    labelKey: 'button.download_excel',
    handler: handleDownloadExcel,
  },
];
</script>

<style scoped></style>
