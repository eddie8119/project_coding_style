import type {
  CellValue,
  ColumnSetupOptions,
  CreateRowOptions,
  DateRowFormatOptions,
  GridBorderOptions,
  MonthHeaderOptions,
  WeekendFormatOptions,
} from '@/types/worksheet';
import type { Alignment, Row, Worksheet } from 'exceljs';

import { CENTER_ALIGNMENT } from '@/config/excelAlignmentConfig';

const DEFAULT_WEEKEND_COLOR = 'FFFF0000';

const normalizeDateToNoon = (input: Date) => {
  const d = new Date(input);
  d.setHours(12, 0, 0, 0);
  return d;
};

const isSameDay = (a: Date, b: Date) =>
  a.getFullYear() === b.getFullYear() &&
  a.getMonth() === b.getMonth() &&
  a.getDate() === b.getDate();

export const setupWorksheetColumns = (
  worksheet: Worksheet,
  dates: Date[],
  options: ColumnSetupOptions = {}
) => {
  const { labelColumnWidth = 20, dateColumnWidth = 12 } = options;
  worksheet.columns = [
    { header: '', key: 'label', width: labelColumnWidth },
    ...dates.map((_, index) => ({
      header: '',
      key: `d${index + 1}`,
      width: dateColumnWidth,
    })),
  ];
  // Remove the auto-generated header row
  worksheet.spliceRows(1, 1);
  return 1 + dates.length;
};

export const createLabeledRow = (
  worksheet: Worksheet,
  totalColumns: number,
  firstCellValue: string,
  values: CellValue[] = [],
  options: CreateRowOptions = {}
) => {
  const {
    labelAlignment = { ...CENTER_ALIGNMENT, wrapText: true },
    valueAlignment = CENTER_ALIGNMENT,
  } = options;
  const rowValues: CellValue[] = new Array(totalColumns).fill('');
  rowValues[0] = firstCellValue;
  values.forEach((value, idx) => {
    rowValues[idx + 1] = value;
  });
  const row = worksheet.addRow(rowValues);
  row.eachCell((cell, colNumber) => {
    cell.alignment = colNumber === 1 ? labelAlignment : valueAlignment;
  });
  return row;
};

export const populateMonthHeader = (
  worksheet: Worksheet,
  row: Row,
  dates: Date[],
  options: MonthHeaderOptions = {}
) => {
  if (dates.length === 0) return;
  const { monthLabelFormatter = (date: Date) => `${date.getMonth() + 1}月`, startColumn = 2 } =
    options;

  let rangeStartIndex = 0;
  let currentMonthIndex = dates[0].getMonth();

  for (let i = 1; i <= dates.length; i++) {
    const nextDate = dates[i];
    const nextMonthIndex = nextDate ? nextDate.getMonth() : undefined;

    if (i === dates.length || nextMonthIndex !== currentMonthIndex) {
      const startCol = startColumn + rangeStartIndex;
      const endCol = startColumn + (i - 1);

      worksheet.mergeCells(row.number, startCol, row.number, endCol);
      const cell = row.getCell(startCol);
      cell.value = monthLabelFormatter(dates[i - 1]);
      cell.alignment = CENTER_ALIGNMENT;
      cell.font = { ...(cell.font ?? {}), bold: true };

      if (i < dates.length && nextMonthIndex !== undefined) {
        rangeStartIndex = i;
        currentMonthIndex = nextMonthIndex;
      }
    }
  }
};

export const applyDateRowFormatting = (
  row: Row,
  dates: Date[],
  options: DateRowFormatOptions = {}
) => {
  const { firstDateColumn = 2, weekendColor = DEFAULT_WEEKEND_COLOR, dateFormat = 'd' } = options;
  for (let col = firstDateColumn; col < firstDateColumn + dates.length; col++) {
    const cell = row.getCell(col);
    cell.numFmt = dateFormat;
    const date = dates[col - firstDateColumn];
    if (date) {
      const day = date.getDay();
      if (day === 0 || day === 6) {
        cell.font = {
          ...(cell.font ?? {}),
          color: { argb: weekendColor },
        };
      }
    }
  }
};

export const applyWeekendFontColor = (
  row: Row,
  dates: Date[],
  options: WeekendFormatOptions = {}
) => {
  const { firstDateColumn = 2, weekendColor = DEFAULT_WEEKEND_COLOR } = options;
  dates.forEach((date, index) => {
    const day = date.getDay();
    if (day === 0 || day === 6) {
      const cell = row.getCell(firstDateColumn + index);
      cell.font = {
        ...(cell.font ?? {}),
        color: { argb: weekendColor },
      };
    }
  });
};

export const mergeDateHeaderLabel = (
  worksheet: Worksheet,
  dateRow: Row,
  weekdayRow: Row,
  label: string,
  alignment: Partial<Alignment> = CENTER_ALIGNMENT
) => {
  worksheet.mergeCells(dateRow.number, 1, weekdayRow.number, 1);
  const dateHeaderCell = dateRow.getCell(1);
  dateHeaderCell.value = label;
  dateHeaderCell.alignment = alignment;
};

export const getColumnIndexForDate = (
  date: Date,
  dates: Date[],
  options: { offset?: number } = {}
) => {
  const { offset = 2 } = options;
  const normalizedTarget = normalizeDateToNoon(date);
  const index = dates.findIndex((item) => isSameDay(item, normalizedTarget));
  return index === -1 ? -1 : index + offset;
};

export const fillRangeWithoutMerge = (
  row: Row,
  startIdx: number,
  endIdx: number,
  value: string,
  alignment: Partial<Alignment> = CENTER_ALIGNMENT
) => {
  for (let colIdx = startIdx; colIdx <= endIdx; colIdx++) {
    const cell = row.getCell(colIdx);
    cell.value = colIdx === startIdx ? value : '';
    cell.alignment = alignment;
  }
};

export const applyGridBorder = (
  worksheet: Worksheet,
  totalColumns: number,
  options: GridBorderOptions = {}
) => {
  const {
    startRow = 1,
    endRow = worksheet.lastRow?.number ?? 1,
    borderColor = 'FFD3D3D3',
  } = options;
  for (let r = startRow; r <= endRow; r++) {
    const row = worksheet.getRow(r);
    for (let c = 1; c <= totalColumns; c++) {
      const cell = row.getCell(c);
      cell.border = {
        top: { style: 'thin', color: { argb: borderColor } },
        left: { style: 'thin', color: { argb: borderColor } },
        bottom: { style: 'thin', color: { argb: borderColor } },
        right: { style: 'thin', color: { argb: borderColor } },
      };
    }
  }
};
