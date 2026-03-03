import * as cron from 'node-cron';

import { emailService } from '../notification/email.service';

import { supabase } from '@/lib/supabase';

type CronJob = ReturnType<typeof cron.schedule>;

// 每日電子郵件摘要排程器
// 每天 00:00 發送當天所有待辦任務的摘要
export class EmailDigestScheduler {
  private scheduledTask: CronJob | null = null;

  /**
   * 啟動排程器
   */
  start(): void {
    // 每天 00:00 執行
    const cronExpression = process.env.DAILY_EMAIL_DIGEST_CRON || '0 0 * * *';

    this.scheduledTask = cron.schedule(
      cronExpression,
      async () => {
        await this.sendDailyDigests();
      },
      {
        timezone: 'Asia/Taipei', // 使用台灣時區
      }
    );
  }

  /**
   * 停止排程器
   */
  stop(): void {
    if (this.scheduledTask) {
      this.scheduledTask.stop();
    }
  }

  /**
   * 手動觸發發送每日摘要
   * 可用於測試或手動補發
   */
  async manualTrigger(): Promise<{ success: boolean; count: number }> {
    return await this.sendDailyDigests();
  }

  /**
   * 發送每日摘要
   * 1. 獲取所有用戶
   * 2. 對每個用戶，獲取當天的任務
   * 3. 發送摘要郵件
   * 4. 更新任務的 email_reminder_sent 狀態
   */
  private async sendDailyDigests(): Promise<{ success: boolean; count: number }> {
    try {
      // 獲取所有啟用了郵件通知的用戶
      const { data: settings, error: settingsError } = await supabase
        .from('UserSettings')
        .select('user_id')
        .eq('email_notifications_enabled', true);

      if (settingsError) {
        console.error('[EmailDigestScheduler] 獲取用戶設置失敗:', settingsError);
        return { success: false, count: 0 };
      }

      if (!settings || settings.length === 0) {
        return { success: true, count: 0 };
      }

      const userIds = settings.map((s) => s.user_id);
      let totalSent = 0;

      // 獲取當天的日期（台灣時區）
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);

      // 對每個用戶處理
      for (const userId of userIds) {
        // 獲取用戶當天的任務
        const { data: tasks, error: tasksError } = await supabase
          .from('tasks')
          .select('*')
          .eq('user_id', userId)
          .eq('email_reminder_sent', false)
          .gte('reminder_date_time', today.toISOString())
          .lt('reminder_date_time', tomorrow.toISOString())
          .order('reminder_date_time', { ascending: true });

        if (tasksError) {
          console.error(`[EmailDigestScheduler] 獲取用戶 ${userId} 的任務失敗:`, tasksError);
          continue;
        }

        if (!tasks || tasks.length === 0) {
          continue;
        }

        // 發送摘要郵件
        const success = await emailService.sendDailyDigest(userId, tasks);

        if (success) {
          totalSent++;

          // 更新任務的 email_reminder_sent 狀態
          const taskIds = tasks.map((task) => task.id);
          const { error: updateError } = await supabase
            .from('tasks')
            .update({
              email_reminder_sent: true,
              last_reminder_sent_at: new Date().toISOString(),
            })
            .in('id', taskIds);

          if (updateError) {
            console.error(`[EmailDigestScheduler] 更新用戶 ${userId} 的任務狀態失敗:`, updateError);
          }
        }
      }

      return { success: true, count: totalSent };
    } catch (error) {
      console.error('[EmailDigestScheduler] 發送每日摘要時發生錯誤:', error);
      return { success: false, count: 0 };
    }
  }
}

export const emailDigestScheduler = new EmailDigestScheduler();
