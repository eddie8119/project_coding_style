import { Language } from '@frontend/types/language';

export interface DailyDigestLocaleCopy {
  headerTitlePrefix: string; // e.g., "每日任務摘要"
  subjectPrefix: string;
  introText: (count: number) => string;
  noDescription: string;
  reminderTimeLabel: string;
  statusLabel: string;
  footerNote?: string;
}

const dailyDigestLocaleMap: Record<Language, DailyDigestLocaleCopy> = {
  [Language.ZH_TW]: {
    headerTitlePrefix: '每日任務摘要',
    subjectPrefix: '每日任務摘要',
    introText: (count: number) => `您今天有 ${count} 個任務需要處理：`,
    noDescription: '無描述',
    reminderTimeLabel: '提醒時間',
    statusLabel: '狀態',
    footerNote: '如需管理通知設置，請登錄應用後訪問通知設置頁面。',
  },
  [Language.EN]: {
    headerTitlePrefix: 'Daily Task Digest',
    subjectPrefix: 'Daily Task Digest',
    introText: (count: number) => `You have ${count} task(s) to review today:`,
    noDescription: 'No description',
    reminderTimeLabel: 'Reminder Time',
    statusLabel: 'Status',
    footerNote: 'Visit your notification settings in the app to manage preferences.',
  },
  [Language.JA]: {
    headerTitlePrefix: 'デイリータスクサマリー',
    subjectPrefix: 'デイリータスクサマリー',
    introText: (count: number) => `本日処理が必要なタスクは ${count} 件です。`,
    noDescription: '説明なし',
    reminderTimeLabel: 'リマインダー時間',
    statusLabel: 'ステータス',
    footerNote: '通知設定を変更する場合はアプリで設定ページを開いてください。',
  },
};

export const getDailyDigestLocaleCopy = (
  locale: Language = Language.ZH_TW
): DailyDigestLocaleCopy => {
  return dailyDigestLocaleMap[locale] || dailyDigestLocaleMap[Language.ZH_TW];
};
