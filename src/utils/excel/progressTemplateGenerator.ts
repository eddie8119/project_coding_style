import type { Workbook } from 'exceljs';

import { CENTER_ALIGNMENT, LEFT_ALIGNMENT } from '@/config/excelAlignmentConfig';
import {
  PROGRESS_TEMPLATE_MONTH_SPAN,
  PROGRESS_TEMPLATE_PAYMENT_FILL_COLOR,
  PROGRESS_TEMPLATE_SAMPLE_BAR_COLOR,
  PROGRESS_TEMPLATE_SAMPLE_SEGMENTS,
  PROGRESS_TEMPLATE_SAMPLE_TEXT_COLUMNS,
} from '@/config/progressTemplateExcelConfig';
import { CONSTRUCTION_CONTAINER } from '@/constants/selection';
import {
  applyDateRowFormatting,
  applyWeekendFontColor,
  createLabeledRow,
  mergeDateHeaderLabel,
  populateMonthHeader,
  setupWorksheetColumns,
} from '@/utils/excel/worksheetScaffolds';

export const createProgressTemplateWorksheet = (workbook: Workbook, t: (key: string) => string) => {
  const sheetName = t('excel.progress_template.sheet_name');
  const worksheet = workbook.addWorksheet(sheetName);

  const today = new Date();
  const currentYear = today.getFullYear();
  const currentMonth = today.getMonth();

  const dates: Date[] = [];
  for (let offset = 0; offset < PROGRESS_TEMPLATE_MONTH_SPAN; offset++) {
    const month = currentMonth + offset;
    const daysInMonth = new Date(currentYear, month + 1, 0).getDate();
    for (let day = 1; day <= daysInMonth; day++) {
      dates.push(new Date(currentYear, month, day, 12, 0, 0));
    }
  }

  const totalColumns = setupWorksheetColumns(worksheet, dates);

  worksheet.views = [{ state: 'frozen', xSplit: 1, ySplit: 0 }];

  const projectNameRow = createLabeledRow(
    worksheet,
    totalColumns,
    t('excel.label.project_name'),
    [],
    {
      valueAlignment: { ...CENTER_ALIGNMENT, horizontal: 'left' },
    }
  );
  worksheet.mergeCells(projectNameRow.number, 2, projectNameRow.number, totalColumns);

  const monthRow = createLabeledRow(worksheet, totalColumns, t('excel.progress_template.month'));
  populateMonthHeader(worksheet, monthRow, dates);

  const dateRow = createLabeledRow(
    worksheet,
    totalColumns,
    t('excel.progress_template.date'),
    dates
  );
  applyDateRowFormatting(dateRow, dates);

  const weekdayShortLabels = [
    t('date.sunday_short'),
    t('date.monday_short'),
    t('date.tuesday_short'),
    t('date.wednesday_short'),
    t('date.thursday_short'),
    t('date.friday_short'),
    t('date.saturday_short'),
  ];
  const weekdays = dates.map((date) => weekdayShortLabels[date.getDay()]);
  const weekdayRow = createLabeledRow(worksheet, totalColumns, '', weekdays);
  applyWeekendFontColor(weekdayRow, dates);

  mergeDateHeaderLabel(worksheet, dateRow, weekdayRow, t('excel.progress_template.date'));

  createLabeledRow(worksheet, totalColumns, t('excel.progress_template.special_holiday'));

  const engineeringRow = createLabeledRow(
    worksheet,
    totalColumns,
    t('excel.progress_template.construction_payment_remittance')
  );
  createLabeledRow(
    worksheet,
    totalColumns,
    t('excel.progress_template.pre_construction_preparation')
  );

  for (let col = 1; col <= totalColumns; col++) {
    const cell = engineeringRow.getCell(col);
    cell.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: PROGRESS_TEMPLATE_PAYMENT_FILL_COLOR },
    };
  }

  worksheet.addRow([]);

  CONSTRUCTION_CONTAINER.forEach((item, index) => {
    const topRow = worksheet.addRow([]);
    const bottomRow = worksheet.addRow([]);

    worksheet.mergeCells(topRow.number, 1, bottomRow.number, 1);
    const mergedCell = worksheet.getCell(topRow.number, 1);
    mergedCell.value = t(`label.construction_type.${item.name}`);
    mergedCell.alignment = CENTER_ALIGNMENT;

    if (index === 0) {
      PROGRESS_TEMPLATE_SAMPLE_SEGMENTS.forEach(({ start, end }) => {
        for (let col = start; col <= end && col <= totalColumns; col++) {
          const progressSampleCell = worksheet.getCell(topRow.number, col);
          progressSampleCell.fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: PROGRESS_TEMPLATE_SAMPLE_BAR_COLOR },
          };
        }
      });

      PROGRESS_TEMPLATE_SAMPLE_TEXT_COLUMNS.forEach((col) => {
        if (col <= totalColumns) {
          const sampleTextCell = worksheet.getCell(bottomRow.number, col);
          sampleTextCell.value = t('excel.progress_template.sample_placeholder');
          sampleTextCell.alignment = {
            ...LEFT_ALIGNMENT,
            wrapText: false,
          };
        }
      });
    }
  });

  return worksheet;
};
