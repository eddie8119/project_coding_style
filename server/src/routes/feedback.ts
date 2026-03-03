import express from 'express';

import { sendFeedback } from '@/controllers/feedback';
import { authMiddleware } from '@/middleware/auth';

const router = express.Router();

router.use(authMiddleware);
router.post('/', sendFeedback);

export default router;
