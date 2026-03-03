import express from 'express';

import { createCommon, deleteCommon, getCommon, updateCommon } from '@/controllers/common';
import { authMiddleware, requireUserId } from '@/middleware/auth';

const router = express.Router();

router.use(authMiddleware);

router.get('/', requireUserId, getCommon);
router.post('/', requireUserId, createCommon);
router.patch('/:id', requireUserId, updateCommon);
router.delete('/:id', requireUserId, deleteCommon);

export default router;
