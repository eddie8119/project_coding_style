import './app';
import { emailDigestScheduler } from './services/scheduler/email-digest.scheduler';
import { reminderScheduler } from './services/scheduler/reminder.scheduler';

// 啟動提醒排程服務
reminderScheduler.start();

// 啟動每日電子郵件摘要排程服務
emailDigestScheduler.start();

// 處理應用關閉時停止排程服務
process.on('SIGINT', () => {
  reminderScheduler.stop();
  emailDigestScheduler.stop();
  process.exit(0);
});

process.on('SIGTERM', () => {
  reminderScheduler.stop();
  emailDigestScheduler.stop();
  process.exit(0);
});
