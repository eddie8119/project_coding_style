/**
 * 電子郵件摘要測試腳本
 *
 * 這個腳本用於測試每日電子郵件摘要功能，包括：
 * 1. 獲取用戶當天的任務
 * 2. 發送每日電子郵件摘要
 *
 * 使用方法：
 * npm run ts-node src/scripts/test-email-digest.ts
 */

import dotenv from 'dotenv';
import { v4 as uuidv4 } from 'uuid';

import { supabase } from '../lib/supabase';
import { emailService } from '../services/notification/email.service';
import { emailDigestScheduler } from '../services/scheduler/email-digest.scheduler';

// 載入環境變數
dotenv.config();

// 測試用戶 ID
const TEST_USER_ID = process.env.TEST_USER_ID || '';

/**
 * 創建測試任務
 */
async function createTestTasks() {
  if (!TEST_USER_ID) {
    console.error('請在 .env 文件中設置 TEST_USER_ID');
    return null;
  }

  // 獲取用戶的項目
  const { data: projects, error: projectError } = await supabase
    .from('Projects')
    .select('id')
    .eq('user_id', TEST_USER_ID)
    .limit(1);

  if (projectError || !projects || projects.length === 0) {
    console.error('獲取用戶項目失敗:', projectError || '用戶沒有項目');
    return null;
  }

  const projectId = projects[0].id;

  // 設置提醒時間為今天
  const today = new Date();
  today.setHours(today.getHours() + 2); // 2小時後

  // 創建測試任務
  const tasks = [];
  for (let i = 0; i < 3; i++) {
    const { data: task, error } = await supabase
      .from('tasks')
      .insert({
        id: uuidv4(),
        title: `測試任務 ${i + 1} - ${new Date().toLocaleTimeString()}`,
        description: `這是一個用於測試每日電子郵件摘要的任務 ${i + 1}`,
        status: 'pending',
        user_id: TEST_USER_ID,
        project_id: projectId,
        reminder_date_time: today.toISOString(),
        line_reminder_sent: false,
        email_reminder_sent: false,
      })
      .select()
      .single();

    if (error) {
      console.error(`創建測試任務 ${i + 1} 失敗:`, error);
      continue;
    }

    console.log(`成功創建測試任務 ${i + 1}:`, task.title);
    tasks.push(task);
  }

  return tasks;
}

/**
 * 手動觸發發送每日電子郵件摘要
 */
async function sendDailyDigest() {
  console.log('正在手動觸發發送每日電子郵件摘要...');
  const result = await emailDigestScheduler.manualTrigger();
  console.log('發送結果:', result);
  return result;
}

/**
 * 直接發送電子郵件（測試用）
 */
async function sendTestEmail() {
  if (!TEST_USER_ID) {
    console.error('請在 .env 文件中設置 TEST_USER_ID');
    return false;
  }

  const tasks = await createTestTasks();
  if (!tasks || tasks.length === 0) return false;

  console.log('正在發送測試電子郵件...');
  const success = await emailService.sendDailyDigest(TEST_USER_ID, tasks);
  console.log('發送結果:', success ? '成功' : '失敗');
  return success;
}

/**
 * 主函數
 */
async function main() {
  console.log('開始測試電子郵件摘要功能...');

  // 創建測試任務
  const tasks = await createTestTasks();
  if (!tasks || tasks.length === 0) {
    console.error('創建測試任務失敗，無法繼續測試');
    return;
  }

  // 等待 2 秒後發送測試電子郵件
  console.log('等待 2 秒後發送測試電子郵件...');
  setTimeout(async () => {
    await sendTestEmail();
    console.log('測試完成');
    process.exit(0);
  }, 2000);
}

// 執行主函數
main().catch((error) => {
  console.error('測試過程中發生錯誤:', error);
  process.exit(1);
});
