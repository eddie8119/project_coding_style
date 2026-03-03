/**
 * 提醒系統測試腳本
 *
 * 這個腳本用於測試提醒系統的功能，包括：
 * 1. 創建測試任務
 * 2. 設置提醒時間
 * 3. 手動觸發檢查提醒
 *
 * 使用方法：
 * npm run ts-node src/scripts/test-reminder.ts
 */

import dotenv from 'dotenv';
import { v4 as uuidv4 } from 'uuid';

import { supabase } from '../lib/supabase';
import { lineNotificationService } from '../services/notification/line.service';
import { reminderService } from '../services/tasks/check-reminders';

// 載入環境變數
dotenv.config();

// 測試用戶 ID
const TEST_USER_ID = process.env.TEST_USER_ID || '';
// 測試專案 ID
const TEST_PROJECT_ID = process.env.TEST_PROJECT_ID || '';

/**
 * 創建測試任務
 */
async function createTestTask() {
  if (!TEST_USER_ID || !TEST_PROJECT_ID) {
    console.error('請在 .env 文件中設置 TEST_USER_ID 和 TEST_PROJECT_ID');
    return null;
  }

  // 設置提醒時間為當前時間後 1 分鐘
  const reminderDateTime = new Date();
  reminderDateTime.setMinutes(reminderDateTime.getMinutes() + 1);

  // 創建測試任務
  const { data: task, error } = await supabase
    .from('Tasks')
    .insert({
      id: uuidv4(),
      title: `測試任務 - ${new Date().toLocaleTimeString()}`,
      description: '這是一個用於測試提醒系統的任務',
      status: 'pending',
      user_id: TEST_USER_ID,
      project_id: TEST_PROJECT_ID,
      reminder_date_time: reminderDateTime.toISOString(),
      line_reminder_sent: false,
      email_reminder_sent: false,
    })
    .select()
    .single();

  if (error) {
    console.error('創建測試任務失敗:', error);
    return null;
  }

  console.log('成功創建測試任務:', task);
  return task;
}

/**
 * 手動觸發檢查提醒
 */
async function checkReminders() {
  console.log('正在檢查提醒...');
  const result = await reminderService.checkLineReminders();
  console.log('檢查結果:', result);
  return result;
}

/**
 * 獲取用戶的 LINE Notify Token
 */
async function getUserLineToken() {
  if (!TEST_USER_ID) {
    console.error('請在 .env 文件中設置 TEST_USER_ID');
    return null;
  }

  const { data, error } = await supabase
    .from('UserSettings')
    .select('line_notify_token')
    .eq('user_id', TEST_USER_ID)
    .single();

  if (error) {
    console.error('獲取用戶 LINE Notify Token 失敗:', error);
    return null;
  }

  return data?.line_notify_token || null;
}

/**
 * 直接發送 LINE 通知（測試用）
 */
async function sendTestLineNotification() {
  if (!TEST_USER_ID) {
    console.error('請在 .env 文件中設置 TEST_USER_ID');
    return false;
  }

  const task = await createTestTask();
  if (!task) return false;

  console.log('正在發送 LINE 通知...');
  const success = await lineNotificationService.sendTaskReminder(TEST_USER_ID, task);
  console.log('發送結果:', success ? '成功' : '失敗');
  return success;
}

/**
 * 主函數
 */
async function main() {
  // 檢查用戶是否已設置 LINE Notify Token
  const lineToken = await getUserLineToken();
  if (!lineToken) {
    console.error('用戶尚未設置 LINE Notify Token，請先在設置頁面設置');
    return;
  }

  // 創建測試任務
  const task = await createTestTask();
  if (!task) return;

  // 等待 5 秒後檢查提醒
  console.log('等待 5 秒後檢查提醒...');
  setTimeout(async () => {
    await checkReminders();
    console.log('測試完成');
    process.exit(0);
  }, 5000);
}

// 執行主函數
main().catch((error) => {
  console.error('測試過程中發生錯誤:', error);
  process.exit(1);
});
