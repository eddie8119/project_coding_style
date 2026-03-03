import type { SubscriptionPlan, UserSubscription } from '@/types/billing';

import request from '@/utils/request';

export interface BillingStatus {
  enabled: boolean;
}

export const getBillingStatus = async (): Promise<BillingStatus> => {
  const response = await request.get('/billing/status');
  return response.data;
};

export const createCheckoutSession = async (planId: string) => {
  const response = await request.post('/billing/checkout-session', {
    plan_id: planId,
  });
  return response;
};

export const createCustomerPortalSession = async () => {
  const response = await request.post('/billing/portal-session');
  return response;
};

export const getSubscriptionPlans = async (): Promise<SubscriptionPlan[]> => {
  const response = await request.get('/billing/plans');
  return response.data.data;
};

export const getUserSubscription = async (): Promise<UserSubscription | null> => {
  const response = await request.get('/billing/subscription');
  return response.data;
};

export const cancelSubscription = async () => {
  const response = await request.post('/billing/cancel');
  return response.data;
};
