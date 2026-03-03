import * as cron from 'node-cron';

import { lineNotificationService } from '../notification/line.service';

import { supabase } from '@/lib/supabase';

type CronJob = ReturnType<typeof cron.schedule>;

// 提醒排程服務
// 負責定期檢查需要發送提醒的任務
export class ReminderScheduler {
  private lineReminderJob: CronJob | null = null;

  /**
   * 啟動排程服務
   */
  start(): void {
    // 每 5 分鐘檢查一次需要發送 LINE 提醒的任務
    // cron 表達式: '*/5 * * * *' 表示每 5 分鐘執行一次
    this.lineReminderJob = cron.schedule('*/5 * * * *', async () => {
      await this.checkLineReminders();
    });
  }

  /**
   * 停止排程服務
   */
  stop(): void {
    if (this.lineReminderJob) {
      this.lineReminderJob.stop();
      this.lineReminderJob = null;
    }
  }

  /**
   * 檢查需要發送 LINE 提醒的任務
   * 查找 reminder_date_time 在未來 30 分鐘內的任務且尚未發送提醒
   */
  private async checkLineReminders(): Promise<void> {
    try {
      const now = new Date();
      // 計算 30 分鐘後的時間
      const thirtyMinutesLater = new Date(now.getTime() + 30 * 60 * 1000);

      // 查詢符合條件的任務:
      // 1. reminder_date_time 在當前時間到 30 分鐘後之間
      // 2. line_reminder_sent 為 false (尚未發送提醒)
      // 3. reminder_date_time 不為 null
      const { data: tasks, error } = await supabase
        .from('Tasks')
        .select('*')
        .gte('reminder_date_time', now.toISOString())
        .lte('reminder_date_time', thirtyMinutesLater.toISOString())
        .eq('line_reminder_sent', false)
        .not('reminder_date_time', 'is', null);

      if (error) {
        console.error('查詢需要提醒的任務失敗:', error);
        return;
      }

      // 為每個任務發送提醒
      for (const task of tasks) {
        await lineNotificationService.sendTaskReminder(task.user_id, task);
      }
    } catch (error) {
      console.error('檢查 LINE 提醒時發生錯誤:', error);
    }
  }
}

// 導出單例實例
export const reminderScheduler = new ReminderScheduler();
