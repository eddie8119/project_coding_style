<template>
  <div class="flex flex-col gap-2 lg:flex-row lg:items-center">
    <TextButton
      type="button"
      variant="primary"
      size="sm"
      class="w-full p-2 sm:w-auto"
      @click="handleDownloadTemplate"
    >
      <img src="@/assets/icons/Excel.svg" alt="Download" class="mr-1 h-4 w-4" />
      {{ t('button.progress_template_download') }}
    </TextButton>

    <p class="text-color-difference">{{ t('upload.progress_template_hint') }}</p>
  </div>
</template>

<script setup lang="ts">
import { Workbook } from 'exceljs';
import { useI18n } from 'vue-i18n';

import TextButton from '@/components/core/button/TextButton.vue';
import { downloadWorkbook } from '@/config/projectExcelConfig';
import { createProgressTemplateWorksheet } from '@/utils/excel/progressTemplateGenerator';

const { t } = useI18n();

const handleDownloadTemplate = async () => {
  try {
    const workbook = new Workbook();

    createProgressTemplateWorksheet(workbook, t);

    await downloadWorkbook(workbook, `${t('excel.download.progress_template')}.xlsx`);
  } catch (error) {
    console.error('下載工進模板失敗:', error);
  }
};
</script>

<style scoped></style>
