/**
 * 將日期格式化為本地時間字符串
 * @param time - Date 對象
 * @returns 格式化後的時間字符串 (YYYY-MM-DD HH:mm:ss)
 */

export const formatTime = (time: Date): string => {
  return time.toLocaleString('zh-TW', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  });
};

/**
 * 格式化日期時間為 YYYY-MM-DD HH:mm 格式
 * @param date - 日期字串或 Date 物件
 * @returns 格式化後的日期時間字串
 */
export const formatDateTime = (date: string | Date): string => {
  const d = new Date(date);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  const hours = String(d.getHours()).padStart(2, '0');
  const minutes = String(d.getMinutes()).padStart(2, '0');

  return `${year}-${month}-${day} ${hours}:${minutes}`;
};

/**
 * 格式化日期時間為 YYYY-MM-DD HH:mm:ss 格式
 * @param date - 日期字串或 Date 物件
 * @returns 格式化後的日期時間字串
 */
export const formatDateTimeWithSeconds = (date: Date): string => {
  const pad = (n: number) => n.toString().padStart(2, '0');
  const year = date.getFullYear();
  const month = pad(date.getMonth() + 1);
  const day = pad(date.getDate());
  const hour = pad(date.getHours());
  const minute = pad(date.getMinutes());
  const second = pad(date.getSeconds());

  return `${year}-${month}-${day} ${hour}:${minute}:${second}`;
};

// t: (key: string, values?: Record<string, unknown>) => string
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
