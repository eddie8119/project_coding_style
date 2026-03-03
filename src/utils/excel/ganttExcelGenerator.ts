import type { GanttProject } from '@/types/gantt';
import type { Workbook } from 'exceljs';

import { CENTER_ALIGNMENT, LEFT_ALIGNMENT } from '@/config/excelAlignmentConfig';
import {
  applyDateRowFormatting,
  applyGridBorder,
  applyWeekendFontColor,
  createLabeledRow,
  fillRangeWithoutMerge,
  getColumnIndexForDate,
  mergeDateHeaderLabel,
  populateMonthHeader,
  setupWorksheetColumns,
} from '@/utils/excel/worksheetScaffolds';

const isLastDayOfMonth = (date: Date) => {
  const nextDay = new Date(date);
  nextDay.setDate(nextDay.getDate() + 1);
  return nextDay.getDate() === 1;
};

/**
 * Generate Excel from GanttProject data
 */
export const createGanttWorksheet = (
  workbook: Workbook,
  project: GanttProject,
  t: (key: string) => string
) => {
  const sheetName = t('excel.progress_template.sheet_name');
  const worksheet = workbook.addWorksheet(sheetName);

  // 1. Determine Date Range from project
  // If project has dateRange, use it. Otherwise default to something or empty.
  // We need to generate the array of dates to build columns.
  const startDate = new Date(project.dateRange.startDate);
  const endDate = new Date(project.dateRange.endDate);

  // Normalize dates
  startDate.setHours(12, 0, 0, 0);
  endDate.setHours(12, 0, 0, 0);

  const dates: Date[] = [];
  const curr = new Date(startDate);
  while (curr <= endDate) {
    dates.push(new Date(curr));
    curr.setDate(curr.getDate() + 1);
  }

  if (dates.length > 1) {
    const firstDate = dates[0];
    const secondDate = dates[1];
    const isDifferentMonth =
      firstDate.getMonth() !== secondDate.getMonth() ||
      firstDate.getFullYear() !== secondDate.getFullYear();
    if (isDifferentMonth && isLastDayOfMonth(firstDate) && secondDate.getDate() === 1) {
      dates.shift();
    }
  }

  const totalColumns = setupWorksheetColumns(worksheet, dates);

  // Freeze A column and top rows (approx 7 rows for headers)
  worksheet.views = [{ state: 'frozen', xSplit: 1, ySplit: 7 }];

  // --- Row 1: Project Name ---
  const projectNameRow = createLabeledRow(
    worksheet,
    totalColumns,
    t('excel.label.project_name'),
    [],
    {
      valueAlignment: { ...CENTER_ALIGNMENT, horizontal: 'left' },
    }
  );
  projectNameRow.getCell(1).value = t('excel.label.project_name');
  if (dates.length > 0) {
    // Merge rest of the row for the project name value
    worksheet.mergeCells(projectNameRow.number, 2, projectNameRow.number, totalColumns);
    const nameCell = projectNameRow.getCell(2);
    nameCell.value = project.name;
    nameCell.alignment = { horizontal: 'left', vertical: 'middle' };
    nameCell.font = { size: 14, bold: true };
  }

  // --- Row 2: Months ---
  const monthRow = createLabeledRow(worksheet, totalColumns, t('excel.progress_template.month'));
  populateMonthHeader(worksheet, monthRow, dates);

  // --- Row 3: Dates ---
  const dateRow = createLabeledRow(
    worksheet,
    totalColumns,
    t('excel.progress_template.date'),
    dates
  );
  applyDateRowFormatting(dateRow, dates);

  // --- Row 4: Weekdays ---
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

  // Merge "Date" label for Row 3 & 4
  mergeDateHeaderLabel(worksheet, dateRow, weekdayRow, t('excel.progress_template.date'));

  // --- Row 5: Special Holidays ---
  const holidayRow = createLabeledRow(
    worksheet,
    totalColumns,
    t('excel.progress_template.special_holiday')
  );
  if (project.specialHolidays) {
    project.specialHolidays.forEach((item) => {
      const startIdx = getColumnIndexForDate(new Date(item.startDate), dates);
      const endIdx = getColumnIndexForDate(new Date(item.endDate), dates);

      if (startIdx !== -1 && endIdx !== -1 && startIdx <= endIdx) {
        fillRangeWithoutMerge(holidayRow, startIdx, endIdx, item.value, {
          ...LEFT_ALIGNMENT,
          wrapText: false,
        });
      }
    });
  }

  // --- Row 6: Payment Remittances ---
  const paymentRow = createLabeledRow(
    worksheet,
    totalColumns,
    t('excel.progress_template.construction_payment_remittance')
  );
  // Set row background
  for (let col = 1; col <= totalColumns; col++) {
    const cell = paymentRow.getCell(col);
    cell.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFEDE7FF' },
    };
  }
  if (project.paymentRemittances) {
    project.paymentRemittances.forEach((item) => {
      const startIdx = getColumnIndexForDate(new Date(item.startDate), dates);
      const endIdx = getColumnIndexForDate(new Date(item.endDate), dates);
      if (startIdx !== -1 && endIdx !== -1 && startIdx <= endIdx) {
        fillRangeWithoutMerge(paymentRow, startIdx, endIdx, item.value, {
          ...LEFT_ALIGNMENT,
          wrapText: false,
        });
      }
    });
  }

  // --- Row 7: Pre-construction / Other ---
  const preConstRow = createLabeledRow(
    worksheet,
    totalColumns,
    t('excel.progress_template.pre_construction_preparation')
  );
  if (project.preConstructionNotes) {
    project.preConstructionNotes.forEach((item) => {
      const startIdx = getColumnIndexForDate(new Date(item.startDate), dates);
      const endIdx = getColumnIndexForDate(new Date(item.endDate), dates);
      if (startIdx !== -1 && endIdx !== -1 && startIdx <= endIdx) {
        fillRangeWithoutMerge(preConstRow, startIdx, endIdx, item.value, {
          ...LEFT_ALIGNMENT,
          wrapText: false,
        });
      }
    });
  }

  // Spacer
  worksheet.addRow([]);

  // --- Construction Categories ---
  project.categories.forEach((category) => {
    // 2 rows per category
    const topRow = worksheet.addRow([]);
    const bottomRow = worksheet.addRow([]);

    // Merge label
    worksheet.mergeCells(topRow.number, 1, bottomRow.number, 1);
    const labelCell = worksheet.getCell(topRow.number, 1);
    labelCell.value = category.name;
    labelCell.alignment = CENTER_ALIGNMENT;
    // labelCell.font = { bold: true };

    // Fill Tasks
    category.tasks.forEach((task) => {
      // Draw bars (top row)
      task.schedules.forEach((schedule) => {
        if (schedule.type === 'execution') {
          const startIdx = getColumnIndexForDate(new Date(schedule.startDate), dates);
          const endIdx = getColumnIndexForDate(new Date(schedule.endDate), dates);

          if (startIdx !== -1 && endIdx !== -1 && startIdx <= endIdx) {
            for (let c = startIdx; c <= endIdx; c++) {
              const cell = topRow.getCell(c);
              cell.fill = {
                type: 'pattern',
                pattern: 'solid',
                fgColor: { argb: 'FF9CD46C' }, // Green
              };
            }
          }
        }
      });

      // Draw content (bottom row)
      // If task has content, where to place it?
      // We can place it at the start date of the first schedule, or just trying to find a place.
      // Let's use the start date of the *task* (which is min of schedules usually, or explicit).
      // GanttTask doesn't have explicit start/end, only schedules.
      // We'll use the first execution schedule's start date as anchor for text.
      if (task.content) {
        const firstSchedule = task.schedules[0]; // Assuming sorted or just picking first
        if (firstSchedule) {
          const startIdx = getColumnIndexForDate(new Date(firstSchedule.startDate), dates);
          if (startIdx !== -1) {
            const cell = bottomRow.getCell(startIdx);
            // Append text if multiple tasks start same day?
            // This is simple implementation, might overwrite.
            cell.value = task.content;
            cell.alignment = { ...LEFT_ALIGNMENT, wrapText: false };
            // Allow text to overflow visible if empty next cells (Excel default behavior for text)
          }
        }
      }
    });
  });

  // Global borders (optional, but good for Gantt look)
  // Apply borders to the grid part
  applyGridBorder(worksheet, totalColumns);

  return worksheet;
};
