import * as XLSX from 'xlsx';

import { getCellText } from './excelUtils';

import type {
  ExcelCell,
  ExcelDateColumn,
  GanttDateRange,
  ProgressParsedExcelData,
  ProgressParsedExcelDataCategory,
  ProgressParsedExcelDataTask,
} from '@/types/gantt';

const ROW_INDEX = {
  PROJECT_NAME: 0,
  MONTH_ROW: 1,
  DATE_ROW: 2,
  WEEKDAY_ROW: 3,
  SPECIAL_HOLIDAYS: 4,
  PAYMENT_REMITTANCES: 5,
  PRE_CONSTRUCTION: 6,
  CATEGORY_START: 8,
} as const;

const parseExcelDateCell = (cell: XLSX.CellObject | undefined): Date | null => {
  if (!cell || cell.v == null) return null;

  if (cell.v instanceof Date) {
    return cell.v;
  }

  if (typeof cell.v === 'number') {
    const parsed = XLSX.SSF.parse_date_code(cell.v);
    if (parsed) {
      return new Date(parsed.y, (parsed.m || 1) - 1, parsed.d || 1);
    }
  }

  return null;
};

/**
 * 解析 Excel 檔案為結構化資料
 */
export const parseExcelFile = async (file: File): Promise<ProgressParsedExcelData> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array', cellStyles: true });
        const worksheet = workbook.Sheets[workbook.SheetNames[0]];

        const parsedData = parseWorksheet(worksheet);
        resolve(parsedData);
      } catch (error) {
        reject(error);
      }
    };

    reader.onerror = () => reject(new Error('檔案讀取失敗'));
    reader.readAsArrayBuffer(file);
  });
};

/**
 * 從第一列解析專案名稱
 *
 * 說明：
 * - A1 儲存的是「專案名稱」標籤文字
 * - 實際的專案名稱（例如「王宅」）會被填在同一列的其他儲存格（通常是合併儲存格）
 * - 因此這裡會掃描第 1 列從 B 欄開始的所有儲存格，找出第一個非空文字作為 projectName
 */
const parseProjectName = (worksheet: XLSX.WorkSheet): string => {
  const range = XLSX.utils.decode_range(worksheet['!ref'] || 'A1');
  const rowIndex = ROW_INDEX.PROJECT_NAME; // 第 1 列（0-based）

  for (let col = 1; col <= range.e.c; col += 1) {
    const address = XLSX.utils.encode_cell({ r: rowIndex, c: col });
    const cell = worksheet[address] as XLSX.CellObject | undefined;

    const text = getCellText(cell);
    if (text.length > 0) {
      return text;
    }
  }

  // 若第一列除了 A1 之外沒有任何內容，則回退為預設專案名稱
  return '未命名專案';
};

/**
 * 解析工作表
 */
const parseWorksheet = (worksheet: XLSX.WorkSheet): ProgressParsedExcelData => {
  // 解析專案名稱：
  // - A1 是「專案名稱」標籤
  const projectName = parseProjectName(worksheet);

  // 解析日期欄位，僅保存起訖日期
  const dateColumns = parseDateColumns(worksheet);
  const firstDate = dateColumns[0]?.date ?? new Date();
  const lastDate = dateColumns[dateColumns.length - 1]?.date ?? new Date();
  const dateRange: GanttDateRange = {
    startDate: firstDate,
    endDate: lastDate,
  };

  // 目前僅有一段完整時間軸，未來若需要可拆成多段
  const segments: GanttDateRange[] = [dateRange];

  // 解析特殊節慶列、工程款匯款列與前置準備/其它列
  // 這三列在模板中的位置是固定的（使用 createProgressTemplateWorksheet 產生）：
  const specialHolidaysRowIndex = ROW_INDEX.SPECIAL_HOLIDAYS; // 第 5 行（0-based）
  const paymentRemittancesRowIndex = ROW_INDEX.PAYMENT_REMITTANCES; // 第 6 行（0-based）
  const preConstructionRowIndex = ROW_INDEX.PRE_CONSTRUCTION; // 第 7 行（0-based）

  const specialHolidays = parseRowCells(worksheet, specialHolidaysRowIndex, dateColumns);
  const paymentRemittances = parseRowCells(worksheet, paymentRemittancesRowIndex, dateColumns);
  const preConstructionNotes = parseRowCells(worksheet, preConstructionRowIndex, dateColumns);
  // 解析工程類別與任務
  const { categories, tasks } = parseCategories(worksheet, dateColumns);
  const filteredTasksWithContent = tasks.filter((task) => task.content?.trim().length);

  return {
    projectName,
    dateRange,
    segments,
    dateColumns,
    specialHolidays,
    paymentRemittances,
    preConstructionNotes,
    categories,
    tasks: filteredTasksWithContent,
  };
};

/**
 * 解析日期欄位
 *
 * 說明：
 * - 匯入的工進表是由前端 `createProgressTemplateWorksheet` 產生
 * - 優先從「日期列」（模板的第 3 列）實際讀出每一欄的日期
 * - 若讀不到任何有效日期，才退回舊的「當月 + 下一個月」重建邏輯
 */
const parseDateColumns = (worksheet: XLSX.WorkSheet): ExcelDateColumn[] => {
  const dateColumns: ExcelDateColumn[] = [];
  const range = XLSX.utils.decode_range(worksheet['!ref'] || 'A1');

  // -------- 1) 優先嘗試：從日期列（第 3 列，0-based index = 2）讀取實際日期 --------
  const dateRowIndex = ROW_INDEX.DATE_ROW; // createProgressTemplateWorksheet 中 dateRow 所在的列
  const parsedDatesFromSheet: { date: Date; col: number }[] = [];

  for (let col = 1; col <= range.e.c; col += 1) {
    const address = XLSX.utils.encode_cell({ r: dateRowIndex, c: col });
    const cell = worksheet[address] as XLSX.CellObject | undefined;

    const date = parseExcelDateCell(cell);
    if (date && !Number.isNaN(date.getTime())) {
      parsedDatesFromSheet.push({ date, col });
    }
  }

  if (parsedDatesFromSheet.length > 0) {
    parsedDatesFromSheet.forEach(({ date, col }) => {
      // 直接使用實際欄位索引，確保與 parseRowCells / createScheduleFromCells 對應正確
      dateColumns.push({
        date,
        colIndex: col,
      });
    });

    return dateColumns;
  }

  // -------- 2) 後備方案：維持舊邏輯（當月 + 下一個月），避免解析失敗 --------
  // 總欄數（含 A 欄），實際日期欄位 = 總欄數 - 1
  const totalCols = range.e.c + 1;
  const dateColCount = Math.max(totalCols - 1, 0);

  if (dateColCount === 0) {
    return dateColumns;
  }

  const today = new Date();
  const currentYear = today.getFullYear();
  const currentMonth = today.getMonth();

  const allDates: Date[] = [];
  for (let offset = 0; offset < 2; offset += 1) {
    const month = currentMonth + offset;
    const daysInMonth = new Date(currentYear, month + 1, 0).getDate();
    for (let day = 1; day <= daysInMonth; day += 1) {
      allDates.push(new Date(currentYear, month, day));
    }
  }

  const effectiveDates = allDates.slice(0, dateColCount);

  effectiveDates.forEach((date, index) => {
    dateColumns.push({
      date,
      colIndex: index + 1,
    });
  });

  return dateColumns;
};

interface ParsedCategoriesAndTasks {
  categories: ProgressParsedExcelDataCategory[];
  tasks: ProgressParsedExcelDataTask[];
}

/**
 * 解析工程類別和任務
 */
const parseCategories = (
  worksheet: XLSX.WorkSheet,
  dateColumns: ExcelDateColumn[]
): ParsedCategoriesAndTasks => {
  const categories: ProgressParsedExcelDataCategory[] = [];
  const tasks: ProgressParsedExcelDataTask[] = [];
  const range = XLSX.utils.decode_range(worksheet['!ref'] || 'A1');

  // 根據模板設計：A9 之後的列才是工程項目，因此從第 9 列開始掃描
  let row = ROW_INDEX.CATEGORY_START; // 第 9 列 (0-based)
  let emptyCount = 0;

  while (row <= range.e.r) {
    const aCellAddress = XLSX.utils.encode_cell({ r: row, c: 0 }); // A 欄 = c:0
    const aCell = worksheet[aCellAddress];
    const rawName = aCell?.v;

    if (rawName && typeof rawName === 'string') {
      const name = rawName.trim();
      if (name.length > 0) {
        const id = crypto.randomUUID();
        const noteRow = row + 1;

        const noteCells = parseRowCells(worksheet, noteRow, dateColumns);

        categories.push({ id, name });

        // Create a separate task for each note cell
        if (noteCells.length > 0) {
          noteCells.forEach((cell) => {
            tasks.push({
              categoryId: id,
              content: cell.value,
              startDate: cell.startDate,
              endDate: cell.endDate,
            });
          });
        } else {
          // Create empty task with default dates if no noteCells
          const defaultDate = dateColumns.length > 0 ? dateColumns[0].date : new Date();
          tasks.push({
            categoryId: id,
            content: '',
            startDate: defaultDate,
            endDate: defaultDate,
          });
        }

        row += 2;
        emptyCount = 0;
        continue;
      }
    }

    // A 欄沒有有效文字，視為空行
    emptyCount += 1;
    if (emptyCount >= 5) {
      break; // 連續太多空行，視為表格結束
    }

    row += 1;
  }

  return { categories, tasks };
};
/**
 * 解析指定列的有色儲存格
 */
const parseRowCells = (
  worksheet: XLSX.WorkSheet,
  row: number,
  dateColumns: ExcelDateColumn[]
): ExcelCell[] => {
  const cells: ExcelCell[] = [];

  const getCell = (r: number, c: number): XLSX.CellObject | undefined => {
    const addr = XLSX.utils.encode_cell({ r, c });
    return worksheet[addr] as XLSX.CellObject | undefined;
  };

  type CellWithStyle = XLSX.CellObject & { s?: { patternType?: string } };

  const hasFill = (cell: XLSX.CellObject | undefined): boolean => {
    const styledCell = cell as CellWithStyle | undefined;
    return styledCell?.s?.patternType === 'solid';
  };

  const findColoredRange = (
    baseRow: number,
    colIndex: number,
    fallbackColIndex: number
  ): { startColIndex: number; endColIndex: number } | null => {
    const baseCell = getCell(baseRow, colIndex);
    if (!hasFill(baseCell)) {
      return null;
    }

    let startColIndex = colIndex;
    let endColIndex = colIndex;

    // 往左擴展
    while (startColIndex - 1 >= 0) {
      const leftCell = getCell(baseRow, startColIndex - 1);
      if (!hasFill(leftCell)) break;
      startColIndex -= 1;
    }

    // 往右擴展，最多掃到已知日期欄位的最大 colIndex
    const maxDateColIndex = dateColumns.reduce(
      (max, c) => (c.colIndex > max ? c.colIndex : max),
      fallbackColIndex
    );

    while (endColIndex + 1 <= maxDateColIndex) {
      const rightCell = getCell(baseRow, endColIndex + 1);
      if (!hasFill(rightCell)) break;
      endColIndex += 1;
    }

    return { startColIndex, endColIndex };
  };

  dateColumns.forEach((dateCol) => {
    const colIndex = dateCol.colIndex;
    const cell = getCell(row, colIndex);

    if (cell && cell.v != null) {
      // 僅保留有實際文字內容的儲存格
      const raw = cell.v;
      let text = '';

      if (typeof raw === 'string') {
        text = raw.trim();
      } else {
        text = String(raw).trim();
      }

      if (!text) {
        return;
      }

      let startDate: Date;
      let endDate: Date;

      // 進度條可能畫在「上一列」或「同一列」，優先使用上一列
      const progressRowAbove = row - 1;
      const progressRowSame = row;

      const rangeAbove = findColoredRange(progressRowAbove, colIndex, colIndex);
      const rangeSame = findColoredRange(progressRowSame, colIndex, colIndex);

      const range = rangeAbove || rangeSame;

      if (range) {
        const startCol = dateColumns.find((c) => c.colIndex === range.startColIndex);
        const endCol = dateColumns.find((c) => c.colIndex === range.endColIndex);

        if (!startCol || !endCol) {
          // 找不到對應欄位時退回單一欄位邏輯
          startDate = new Date(dateCol.date);
          endDate = new Date(dateCol.date);
          endDate.setDate(endDate.getDate() + 1);
        } else {
          startDate = new Date(startCol.date);
          endDate = new Date(endCol.date);
          endDate.setDate(endDate.getDate() + 1);
        }
      } else {
        // 上方沒有進度條底色：維持原本「單一天」區間邏輯
        startDate = new Date(dateCol.date);
        endDate = new Date(dateCol.date);
        endDate.setDate(endDate.getDate() + 1);
      }

      cells.push({
        value: text,
        startDate,
        endDate,
      });
    }
  });

  return cells;
};
