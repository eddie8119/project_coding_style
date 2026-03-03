import { differenceInDays } from 'date-fns';

import type { UpdateTimeType } from '@/types/common';

// --- Formatting Functions ---

/**
 * 格式化日期時間為 YYYY-MM-DD HH:mm:ss 格式
 * @param date - 日期字串或 Date 物件
 * @returns 格式化後的日期時間字串
 */
export const formatDateTime = (date: Date): string => {
  const pad = (n: number) => n.toString().padStart(2, '0');
  const year = date.getFullYear();
  const month = pad(date.getMonth() + 1);
  const day = pad(date.getDate());
  const hour = pad(date.getHours());
  const minute = pad(date.getMinutes());
  const second = pad(date.getSeconds());

  return `${year}-${month}-${day} ${hour}:${minute}:${second}`;
};

/**
 * 將日期格式化為 MM-DD，用於檔名等簡短標示
 */
export const formatMonthDay = (date: Date): string => {
  const pad = (n: number) => n.toString().padStart(2, '0');
  const month = pad(date.getMonth() + 1);
  const day = pad(date.getDate());
  return `${month}-${day}`;
};

/**
 * 格式化日期時間為 YYYY-MM-DD HH:mm 格式
 * @param date - 日期字串或 Date 物件
 * @returns 格式化後的日期時間字串
 */
export const formatDateTimeToMinutes = (date: string | Date): string => {
  const d = new Date(date);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  const hours = String(d.getHours()).padStart(2, '0');
  const minutes = String(d.getMinutes()).padStart(2, '0');

  return `${year}-${month}-${day} ${hours}:${minutes}`;
};

/**
 * 格式化日期為 YYYY-MM-DD 格式
 * @param date - 日期字串或 Date 物件
 * @returns 格式化後的日期字串
 */
export const formatDate = (date: Date): string => {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(
    date.getDate()
  ).padStart(2, '0')}`;
};

/**
 * 格式化時間為 HH:mm 格式
 * @param date - Date 物件或時間字串
 * @returns 格式化後的時間字串
 */
export const formatTimeOnly = (date: Date | string | undefined | null): string => {
  if (!date) return '--:--';
  const d = new Date(date);
  return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
};

/**
 * 格式化日期時間為 M/D HH:mm，用於任務卡片等簡短顯示
 * @param date - 日期字串、時間戳或 Date 物件
 */
export const formatShortDateTime = (date: UpdateTimeType): string => {
  if (!date) return '';
  const d = new Date(date);
  if (Number.isNaN(d.getTime())) return '';

  const month = d.getMonth() + 1;
  const day = d.getDate();
  const hours = String(d.getHours()).padStart(2, '0');
  const minutes = String(d.getMinutes()).padStart(2, '0');

  return `${month}/${day} ${hours}:${minutes}`;
};

/**
 * 計算並格式化相對時間
 * @param rawTimestamp - 時間戳字串
 * @param t - i18n 翻譯函式
 */
export const formatRelativeTime = (
  rawTimestamp: string | null,
  t: (key: string, values?: Record<string, unknown>) => string
) => {
  if (!rawTimestamp) return '';
  const now = new Date().getTime();
  const ts = parseInt(rawTimestamp, 10);
  const diffMs = now - ts;
  if (isNaN(ts) || diffMs < 0) return '';
  const diffSec = Math.floor(diffMs / 1000);
  if (diffSec < 60) return t('common.relative.second', { count: diffSec });
  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) return t('common.relative.minute', { count: diffMin });
  const diffHr = Math.floor(diffMin / 60);
  if (diffHr < 24) return t('common.relative.hour', { count: diffHr });
  const diffDay = Math.floor(diffHr / 24);
  return t('common.relative.day', { count: diffDay });
};

/**
 * 獲取月份和年份的本地化字串
 * @param date - Date 物件
 * @param t - i18n 翻譯函式
 */
export const getMonthYear = (date: Date, t: (key: string) => string): string => {
  const monthNames = [
    t('date.january'),
    t('date.february'),
    t('date.march'),
    t('date.april'),
    t('date.may'),
    t('date.june'),
    t('date.july'),
    t('date.august'),
    t('date.september'),
    t('date.october'),
    t('date.november'),
    t('date.december'),
  ];
  return `${monthNames[date.getMonth()]} ${date.getFullYear()}`;
};

/**
 * 獲取星期幾的縮寫
 * @param date - Date 物件
 * @param t - i18n 翻譯函式
 */
export const getWeekDay = (date: Date, t: (key: string) => string): string => {
  const weekDays = [
    t('date.sunday_short'),
    t('date.monday_short'),
    t('date.tuesday_short'),
    t('date.wednesday_short'),
    t('date.thursday_short'),
    t('date.friday_short'),
    t('date.saturday_short'),
  ];
  return weekDays[date.getDay()];
};

// --- Calculation and Comparison Functions ---

/**
 * 計算距離目標日期的天數
 * @param targetDate - 目標日期
 * @returns 距離天數 (負數表示過去)
 */
export const getDaysUntil = (targetDate: UpdateTimeType): number | null => {
  if (!targetDate) return null;

  const now = new Date();
  const target = new Date(targetDate);

  now.setHours(0, 0, 0, 0);
  target.setHours(0, 0, 0, 0);

  const diffTime = target.getTime() - now.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};

/**
 * 檢查日期是否在指定天數範圍內 (使用 date-fns)
 * @param date - 要檢查的日期
 * @param minDays - 最小天數 (包含)
 * @param maxDays - 最大天數 (包含)
 * @returns 如果在範圍內則為 true
 */
export function isWithinDays(
  date: Date | null | undefined,
  minDays: number,
  maxDays: number
): boolean {
  if (!date) return false;

  try {
    const today = new Date();
    const diff = differenceInDays(date, today);

    if (maxDays >= 10) {
      return diff >= minDays;
    }

    return diff >= minDays && diff <= maxDays;
  } catch (error) {
    console.error('Error calculating date difference:', date, error);
    return false;
  }
}

/**
 * 檢查兩個日期是否為連續日期
 * @param date1 - 日期一
 * @param date2 - 日期二
 * @returns 如果是連續日期則為 true
 */
export const isConsecutiveDate = (date1: Date, date2: Date): boolean => {
  const d1 = new Date(date1);
  const d2 = new Date(date2);
  d1.setHours(0, 0, 0, 0);
  d2.setHours(0, 0, 0, 0);
  const timeDiff = d2.getTime() - d1.getTime();
  const dayDiff = timeDiff / (1000 * 60 * 60 * 24);
  return dayDiff === 1;
};

// --- Timezone Functions ---

/**
 * 調整時區，將數據庫時間轉換為正確的本地時間
 * @param dateString - 日期字串
 * @returns Date 物件
 */
export const adjustTimeZone = (dateString?: string): Date => {
  if (!dateString) return new Date();

  const hasTimezone = dateString.includes('Z') || dateString.includes('+');

  if (hasTimezone) {
    return new Date(dateString);
  } else {
    const utcDate = new Date(dateString);
    const timezoneOffset = new Date().getTimezoneOffset();
    return new Date(utcDate.getTime() - timezoneOffset * 60 * 1000);
  }
};
