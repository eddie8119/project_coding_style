import express from 'express';

import {
  cancelStripeSubscription,
  createCheckoutSession,
  createCustomerPortalSession,
  getBillingStatus,
  getUserSubscription,
  handleStripeWebhook,
} from '@/controllers/billing';
import { authMiddleware, requireUserId } from '@/middleware/auth';

const router = express.Router();

router.get('/status', getBillingStatus);
router.get('/subscription', authMiddleware, requireUserId, getUserSubscription);
router.post('/checkout-session', authMiddleware, requireUserId, createCheckoutSession);
router.post('/portal-session', authMiddleware, requireUserId, createCustomerPortalSession);
router.post('/cancel', authMiddleware, requireUserId, cancelStripeSubscription);
router.post('/webhook', handleStripeWebhook);

export default router;
