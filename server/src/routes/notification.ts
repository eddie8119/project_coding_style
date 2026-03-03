import express from 'express';

import {
  checkReminders,
  getPendingReminders,
  resetReminderStatus,
  sendDailyEmailDigest,
} from '@/controllers/notification';
import { authMiddleware, requireUserId } from '@/middleware/auth';

const router = express.Router();

router.use(authMiddleware);

router.post('/check-reminders', requireUserId, checkReminders);
router.get('/pending-reminders', requireUserId, getPendingReminders);
router.post('/reset-reminder/:taskId', requireUserId, resetReminderStatus);
router.post('/send-daily-digest', requireUserId, sendDailyEmailDigest);

export default router;
