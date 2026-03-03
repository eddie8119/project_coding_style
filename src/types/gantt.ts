// 甘特圖相關的型別定義

export interface GanttDateRange {
  startDate: Date;
  endDate: Date;
}

export interface GanttTask {
  id: string;
  name: string;
  category: string;
  categoryId: string;
  schedules: GanttSchedule[];
  content?: string;
}

export interface GanttSchedule {
  id: string;
  startDate: Date;
  endDate: Date;
  type: 'execution' | 'note'; // execution: 執行期間, note: 註記期間
}

export interface GanttCategory {
  id: string;
  name: string;
  tasks: GanttTask[];
}

export interface GanttProject {
  id: string;
  name: string;
  dateRange: GanttDateRange;
  segments?: GanttDateRange[]; // 可選：實際要在時間軸上顯示的多個日期區段
  categories: GanttCategory[];
  /**
   * 解析後的日期欄位定義（若來源為 Excel 匯入時會帶入），
   * 供前端在時間軸上與 Excel 欄位精準對應。
   */
  dateColumns?: ExcelDateColumn[];
  specialHolidays?: ExcelCell[];
  paymentRemittances?: ExcelCell[];
  preConstructionNotes?: ExcelCell[];
}

export type GanttNoteType = 'special' | 'payment' | 'preparation';

// Excel 解析相關型別
export interface ExcelCell {
  value: string;
  startDate: Date;
  endDate: Date;
}

export interface ExcelDateColumn {
  date: Date;
  colIndex: number;
}

// 甘特圖時間軸相關型別
export interface GanttTimelineDateProps {
  dateColumns?: ExcelDateColumn[];
  dateRange: GanttDateRange;
}

export interface MonthSegment {
  key: string;
  date: Date;
  span: number;
}

export interface ProgressParsedExcelDataCategory {
  id: string;
  name: string;
}

export interface ProgressParsedExcelDataTask {
  categoryId: string;
  content: string;
  startDate: Date;
  endDate: Date;
}

export interface ProgressParsedExcelData {
  projectName: string;
  dateRange: GanttDateRange; // 日期範圍：從第一個日期欄位到最後一個日期欄位
  /**
   * 未來可選的多段日期區段，用於時間軸截斷顯示
   * 目前預設只會包含一段（即 dateRange），保留擴充彈性
   */
  segments?: GanttDateRange[];
  /**
   * 解析後的日期欄位定義，包含實際 Excel 欄位索引
   * - 供後續甘特圖轉換邏輯直接使用，避免重新建構時欄位對不上
   */
  dateColumns: ExcelDateColumn[];
  /** 第 5 行：特殊節慶列，每格對應一個日期欄位 */
  specialHolidays: ExcelCell[];
  /** 第 6 行：工程款匯款列，每格對應一個日期欄位 */
  paymentRemittances: ExcelCell[];
  /** 第 7 行：前置準備/其它 列，每格對應一個日期欄位 */
  preConstructionNotes: ExcelCell[];
  categories: ProgressParsedExcelDataCategory[];
  /**
   * 所有任務的平面列表
   * - 透過 categoryName 與 categories.name 關聯
   */
  tasks: ProgressParsedExcelDataTask[];
}
