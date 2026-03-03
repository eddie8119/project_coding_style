import { Request, Response } from 'express';

import { emailDigestScheduler } from '@/services/scheduler/email-digest.scheduler';
import { reminderService } from '@/services/tasks/check-reminders';
import { AuthenticatedRequest } from '@/types/requests';
import { AppError, handleControllerError } from '@/utils/controllerError';

// 手動觸發檢查需要發送的提醒
export const checkReminders = async (req: Request, res: Response) => {
  try {
    const result = await reminderService.checkLineReminders();

    return res.status(200).json({
      success: true,
      message: `成功檢查提醒任務，已發送 ${result.count} 個提醒`,
      data: result,
    });
  } catch (error: unknown) {
    return handleControllerError(res, error, 'Check reminders error');
  }
};

// 獲取待發送提醒的任務列表
export const getPendingReminders = async (req: Request, res: Response) => {
  try {
    const userId = (req as AuthenticatedRequest).userId;
    const reminders = await reminderService.getPendingReminders(userId);

    return res.status(200).json({
      success: true,
      data: reminders,
    });
  } catch (error: unknown) {
    return handleControllerError(res, error, 'Get pending reminders error');
  }
};

// 手動觸發發送每日電子郵件摘要
export const sendDailyEmailDigest = async (req: Request, res: Response) => {
  try {
    const result = await emailDigestScheduler.manualTrigger();

    return res.status(200).json({
      success: true,
      message: `成功發送每日電子郵件摘要，已發送 ${result.count} 封郵件`,
      data: result,
    });
  } catch (error: unknown) {
    return handleControllerError(res, error, 'Send daily email digest error');
  }
};

// 重置任務的提醒狀態
export const resetReminderStatus = async (req: Request, res: Response) => {
  try {
    const { taskId } = req.params;
    const userId = (req as AuthenticatedRequest).userId;

    if (!taskId) {
      throw new AppError('缺少任務 ID', {
        statusCode: 400,
        code: 'TASK_ID_REQUIRED',
      });
    }

    const success = await reminderService.resetReminderStatus(taskId, userId);

    if (!success) {
      throw new AppError('重置任務提醒狀態失敗', {
        statusCode: 500,
        code: 'RESET_REMINDER_FAILED',
      });
    }

    return res.status(200).json({
      success: true,
      message: '成功重置任務提醒狀態',
    });
  } catch (error: unknown) {
    return handleControllerError(res, error, 'Reset reminder status error');
  }
};
