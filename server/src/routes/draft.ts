import express from 'express';

import { createDraft, deleteDraft, getDraft, updateDraft } from '@/controllers/draft';
import { authMiddleware, requireUserId } from '@/middleware/auth';

const router = express.Router();

router.use(authMiddleware);

router.get('/', requireUserId, getDraft);
router.post('/', requireUserId, createDraft);
router.patch('/:id', requireUserId, updateDraft);
router.delete('/:id', requireUserId, deleteDraft);

export default router;
