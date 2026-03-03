import LineNotify from 'line-notify-nodejs';

import { supabase } from '@/lib/supabase';

interface Task {
  id: string;
  title: string;
  description: string | null;
  user_id: string;
  project_id: string;
  status: string;
  construction_type: number | null;
  reminder_date_time: Date | null;
}

export class LineNotificationService {
  /**
   * 發送任務提醒到 LINE
   * @param userId 用戶ID
   * @param task 任務資訊
   * @returns 是否成功發送
   */
  async sendTaskReminder(userId: string, task: Task): Promise<boolean> {
    try {
      // 1. 獲取用戶的 LINE Notify Token
      const token = await this.getUserLineToken(userId);
      if (!token) {
        console.warn(`用戶 ${userId} 未設置 LINE Notify Token`);
        return false;
      }

      // 2. 創建 LINE Notify 客戶端
      const notify = new LineNotify(token);

      // 3. 構建提醒消息
      const message = this.buildReminderMessage(task);

      // 4. 發送通知
      await notify.send({
        message,
      });

      // 5. 更新任務的提醒狀態
      await this.updateTaskReminderStatus(task.id);

      return true;
    } catch (error) {
      console.error('發送 LINE 提醒失敗:', error);
      return false;
    }
  }

  /**
   * 獲取用戶的 LINE Notify Token
   * @param userId 用戶ID
   * @returns LINE Notify Token 或 null
   */
  private async getUserLineToken(userId: string): Promise<string | null> {
    try {
      // 從用戶設置表中獲取 LINE Notify Token
      // 注意: 這裡假設有一個 UserSettings 表存儲用戶的通知設置
      const { data, error } = await supabase
        .from('UserSettings')
        .select('line_notify_token')
        .eq('user_id', userId)
        .single();

      if (error || !data) {
        console.error('獲取用戶 LINE Notify Token 失敗:', error);
        return null;
      }

      return data.line_notify_token;
    } catch (error) {
      console.error('獲取用戶 LINE Notify Token 時發生錯誤:', error);
      return null;
    }
  }

  /**
   * 構建提醒消息
   * @param task 任務資訊
   * @returns 格式化的提醒消息
   */
  private buildReminderMessage(task: Task): string {
    // task.reminder_date_time 可能為 null，需先做防護再轉換
    const reminderTime = task.reminder_date_time ? new Date(task.reminder_date_time) : null;
    const formattedTime = reminderTime
      ? reminderTime.toLocaleString('zh-TW', {
          year: 'numeric',
          month: '2-digit',
          day: '2-digit',
          hour: '2-digit',
          minute: '2-digit',
        })
      : '未設定';

    let message = `\n🔔 任務提醒: ${task.title}\n`;
    message += `⏰ 時間: ${formattedTime}\n`;

    if (task.description) {
      message += `📝 描述: ${task.description}\n`;
    }

    if (task.construction_type) {
      message += `🏗️ 施工類型: ${task.construction_type}\n`;
    }

    message += `📊 狀態: ${task.status}\n`;
    message += `\n請及時處理此任務！`;

    return message;
  }

  /**
   * 更新任務的提醒狀態
   * @param taskId 任務ID
   */
  private async updateTaskReminderStatus(taskId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('Tasks')
        .update({
          line_reminder_sent: true,
          last_reminder_sent_at: new Date().toISOString(),
        })
        .eq('id', taskId);

      if (error) {
        console.error('更新任務提醒狀態失敗:', error);
      }
    } catch (error) {
      console.error('更新任務提醒狀態時發生錯誤:', error);
    }
  }
}

// 導出單例實例
export const lineNotificationService = new LineNotificationService();
