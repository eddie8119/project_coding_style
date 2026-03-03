import { Language } from '@frontend/types/language';

export interface TaskReminderLocaleCopy {
  headerTitle: string;
  noDescription: string;
  reminderTimeLabel: string;
  statusLabel: string;
  subjectPrefix: string;
  notSetLabel: string;
}

const taskReminderLocaleMap: Record<Language, TaskReminderLocaleCopy> = {
  [Language.ZH_TW]: {
    headerTitle: '任務提醒',
    noDescription: '無描述',
    reminderTimeLabel: '提醒時間',
    statusLabel: '狀態',
    subjectPrefix: '任務提醒',
    notSetLabel: '未設置',
  },
  [Language.EN]: {
    headerTitle: 'Task Reminder',
    noDescription: 'No description',
    reminderTimeLabel: 'Reminder Time',
    statusLabel: 'Status',
    subjectPrefix: 'Task Reminder',
    notSetLabel: 'Not set',
  },
  [Language.JA]: {
    headerTitle: 'タスクリマインダー',
    noDescription: '説明なし',
    reminderTimeLabel: 'リマインダー時間',
    statusLabel: 'ステータス',
    subjectPrefix: 'タスクリマインダー',
    notSetLabel: '未設定',
  },
};

export const getTaskReminderLocaleCopy = (
  locale: Language = Language.ZH_TW
): TaskReminderLocaleCopy => {
  return taskReminderLocaleMap[locale] || taskReminderLocaleMap[Language.ZH_TW];
};
