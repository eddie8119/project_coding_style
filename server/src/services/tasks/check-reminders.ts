import { lineNotificationService } from '../notification/line.service';

import { supabase } from '@/lib/supabase';

// 檢查並處理需要提醒的任務
export class ReminderService {
  /**
   * 手動檢查需要發送 LINE 提醒的任務
   * 可以通過 API 端點觸發
   */
  async checkLineReminders(): Promise<{ success: boolean; count: number }> {
    try {
      const now = new Date();
      const thirtyMinutesLater = new Date(now.getTime() + 30 * 60 * 1000);

      // 查詢符合條件的任務
      const { data: tasks, error } = await supabase
        .from('Tasks')
        .select('*')
        .gte('reminder_date_time', now.toISOString())
        .lte('reminder_date_time', thirtyMinutesLater.toISOString())
        .eq('line_reminder_sent', false)
        .not('reminder_date_time', 'is', null);

      if (error) {
        console.error('查詢需要提醒的任務失敗:', error);
        return { success: false, count: 0 };
      }

      // 為每個任務發送提醒
      let successCount = 0;
      for (const task of tasks) {
        const success = await lineNotificationService.sendTaskReminder(task.user_id, task);
        if (success) successCount++;
      }

      return { success: true, count: successCount };
    } catch (error) {
      console.error('檢查 LINE 提醒時發生錯誤:', error);
      return { success: false, count: 0 };
    }
  }

  /**
   * 獲取待發送提醒的任務列表
   * 用於管理界面顯示
   */
  async getPendingReminders(userId: string): Promise<unknown[]> {
    try {
      const now = new Date();
      const twentyFourHoursLater = new Date(now.getTime() + 24 * 60 * 60 * 1000);

      // 查詢未來 24 小時內需要提醒的任務
      const { data: tasks, error } = await supabase
        .from('Tasks')
        .select(
          `
          *,
          Projects(title)
        `
        )
        .gte('reminder_date_time', now.toISOString())
        .lte('reminder_date_time', twentyFourHoursLater.toISOString())
        .not('reminder_date_time', 'is', null)
        .eq('user_id', userId)
        .order('reminder_date_time', { ascending: true });

      if (error) {
        console.error('獲取待發送提醒的任務失敗:', error);
        return [];
      }

      return tasks || [];
    } catch (error) {
      console.error('獲取待發送提醒的任務時發生錯誤:', error);
      return [];
    }
  }

  /**
   * 重置任務的提醒狀態
   * 用於測試或手動重新發送提醒
   */
  async resetReminderStatus(taskId: string, userId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('Tasks')
        .update({
          line_reminder_sent: false,
          email_reminder_sent: false,
          last_reminder_sent_at: null,
        })
        .eq('id', taskId)
        .eq('user_id', userId);

      if (error) {
        console.error('重置任務提醒狀態失敗:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('重置任務提醒狀態時發生錯誤:', error);
      return false;
    }
  }
}

// 導出單例實例
export const reminderService = new ReminderService();
