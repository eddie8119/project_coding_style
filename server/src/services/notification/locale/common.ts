import { Language } from '@frontend/types/language';

export interface NotificationSenderLocaleCopy {
  collaboratorInvitation: string;
  taskReminder: string;
  dailyDigest: string;
  activation: string;
  security: string;
}

const zhTW: NotificationSenderLocaleCopy = {
  collaboratorInvitation: '專案協作系統',
  taskReminder: '任務提醒系統',
  dailyDigest: '每日摘要系統',
  activation: 'KaiJi',
  security: '帳戶安全系統',
};

const enUS: NotificationSenderLocaleCopy = {
  collaboratorInvitation: 'Project Collaboration System',
  taskReminder: 'Task Reminder System',
  dailyDigest: 'Daily Digest System',
  activation: 'KaiJi',
  security: 'Account Security System',
};

const jaJP: NotificationSenderLocaleCopy = {
  collaboratorInvitation: 'コラボレーションシステム',
  taskReminder: 'タスクリマインダー',
  dailyDigest: 'デイリーダイジェストシステム',
  activation: 'KaiJi',
  security: 'アカウントセキュリティシステム',
};

const notificationSenderLocaleMap: Record<Language, NotificationSenderLocaleCopy> = {
  [Language.ZH_TW]: zhTW,
  [Language.EN]: enUS,
  [Language.JA]: jaJP,
};

export const getNotificationSenderLocaleCopy = (
  locale: Language = Language.ZH_TW
): NotificationSenderLocaleCopy => {
  return notificationSenderLocaleMap[locale] || notificationSenderLocaleMap[Language.ZH_TW];
};
