import express from 'express';

import {
  acceptInvitation,
  cancelInvitation,
  createGlobalInvitation,
  createProjectInvitation,
  getInvitationByToken,
  getMyInvitations,
  getSentInvitations,
  rejectInvitation,
} from '@/controllers/invitation';
import { authMiddleware, requireUserId } from '@/middleware/auth';

const router = express.Router();

// Public routes (no auth required)
router.get('/token/:token', getInvitationByToken);

router.use(authMiddleware);

// Get invitations
router.get('/received', requireUserId, getMyInvitations);
router.get('/sent', requireUserId, getSentInvitations);
// Create invitations
router.post('/project/:projectId', requireUserId, createProjectInvitation);
router.post('/global', requireUserId, createGlobalInvitation);
// Accept/reject invitations
router.post('/accept/:invitationToken', requireUserId, acceptInvitation);
router.post('/reject/:invitationId', requireUserId, rejectInvitation);
// Cancel invitation (by inviter)
router.delete('/:invitationId', requireUserId, cancelInvitation);

export default router;
