import { Request, Response } from 'express';
import { Buffer } from 'node:buffer';
import Stripe from 'stripe';

import { stripeClient } from '@/lib/stripe';
import { supabase } from '@/lib/supabase';
import { AuthenticatedRequest } from '@/types/requests';
import { AppError, handleControllerError } from '@/utils/controllerError';

type RequestWithRawBody = Request & { rawBody?: Buffer };

export const cancelStripeSubscription = async (req: Request, res: Response) => {
  try {
    assertBillingEnabled();

    const userId = (req as AuthenticatedRequest).userId;
    if (!userId) {
      throw new AppError('User not authenticated', { statusCode: 401, code: 'UNAUTHENTICATED' });
    }

    const subscription = await getLatestUserSubscription(userId);

    if (!subscription || !subscription.stripe_subscription_id) {
      throw new AppError('No active subscription to cancel', {
        statusCode: 404,
        code: 'SUBSCRIPTION_NOT_FOUND',
      });
    }

    const updatedStripeSubscription = await stripeClient!.subscriptions.update(
      subscription.stripe_subscription_id,
      {
        cancel_at_period_end: true,
      }
    );

    await upsertSubscriptionRecord(updatedStripeSubscription);

    return res.json({
      success: true,
      data: {
        cancel_at_period_end: updatedStripeSubscription.cancel_at_period_end,
        current_period_end: new Date(
          updatedStripeSubscription.current_period_end * 1000
        ).toISOString(),
      },
    });
  } catch (error: unknown) {
    return handleControllerError(res, error, 'Cancel subscription error');
  }
};

const billingEnabled = process.env.STRIPE_BILLING_ENABLED === 'true';
const appBaseUrl = process.env.APP_BASE_URL ?? process.env.CLIENT_URL ?? 'http://localhost:5173';
const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

const planPriceMap: Record<string, string | undefined> = {
  starter: process.env.STRIPE_PRICE_ID_STARTER,
  professional: process.env.STRIPE_PRICE_ID_PROFESSIONAL,
};

const pricePlanMap = Object.entries(planPriceMap).reduce<Record<string, string>>(
  (acc, [plan, price]) => {
    if (price) {
      acc[price] = plan;
    }
    return acc;
  },
  {}
);

const assertBillingEnabled = () => {
  if (!billingEnabled || !stripeClient) {
    throw new AppError('Stripe billing is currently disabled for this environment.', {
      statusCode: 503,
      code: 'BILLING_DISABLED',
    });
  }
};

const mapSubscriptionStatus = (
  status: Stripe.Subscription.Status
): 'active' | 'inactive' | 'cancelled' | 'past_due' => {
  switch (status) {
    case 'active':
    case 'trialing':
      return 'active';
    case 'canceled':
      return 'cancelled';
    case 'past_due':
    case 'unpaid':
    case 'incomplete_expired':
      return 'past_due';
    default:
      return 'inactive';
  }
};

const ensureStripeCustomer = async (userId: string) => {
  const { data: profile, error } = await supabase
    .from('Profiles')
    .select('id, email, stripe_customer_id')
    .eq('id', userId)
    .maybeSingle();

  if (error || !profile) {
    throw new AppError('Failed to load profile for billing', {
      statusCode: 500,
      code: 'PROFILE_NOT_FOUND',
      detail: error?.message,
      exposeError: true,
    });
  }

  if (profile.stripe_customer_id) {
    return profile.stripe_customer_id;
  }

  if (!profile.email) {
    throw new AppError('Profile email missing. Cannot create Stripe customer.', {
      statusCode: 400,
      code: 'PROFILE_EMAIL_MISSING',
    });
  }

  const customer = await stripeClient!.customers.create({
    email: profile.email,
    metadata: { userId },
  });

  const { error: updateError } = await supabase
    .from('Profiles')
    .update({ stripe_customer_id: customer.id })
    .eq('id', userId);

  if (updateError) {
    throw new AppError('Failed to persist Stripe customer id', {
      statusCode: 500,
      code: 'PROFILE_UPDATE_FAILED',
      detail: updateError.message,
      exposeError: true,
    });
  }

  return customer.id;
};

const upsertSubscriptionRecord = async (subscription: Stripe.Subscription) => {
  const customerId =
    typeof subscription.customer === 'string' ? subscription.customer : subscription.customer.id;

  const { data: profile, error: profileError } = await supabase
    .from('Profiles')
    .select('id')
    .eq('stripe_customer_id', customerId)
    .maybeSingle();

  if (profileError || !profile) {
    console.warn(
      '[billing] Unable to find profile for subscription',
      subscription.id,
      profileError
    );
    return;
  }

  const priceId = subscription.items.data[0]?.price?.id;
  const plan = (priceId && pricePlanMap[priceId]) || subscription.metadata?.plan_id || 'custom';

  const payload = {
    user_id: profile.id,
    stripe_subscription_id: subscription.id,
    plan,
    status: mapSubscriptionStatus(subscription.status),
    current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
    current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
    cancel_at_period_end: subscription.cancel_at_period_end ?? false,
    trial_end: subscription.trial_end
      ? new Date(subscription.trial_end * 1000).toISOString()
      : null,
    updated_at: new Date().toISOString(),
  };

  const { error } = await supabase
    .from('UserSubscriptions')
    .upsert(payload, { onConflict: 'stripe_subscription_id' });

  if (error) {
    console.error('[billing] Failed to upsert subscription', error);
  }
};

const upsertInvoiceRecord = async (invoice: Stripe.Invoice) => {
  if (!invoice.subscription || typeof invoice.subscription !== 'string') {
    return;
  }

  let { data: subscriptionRow } = await supabase
    .from('UserSubscriptions')
    .select('id, user_id')
    .eq('stripe_subscription_id', invoice.subscription)
    .maybeSingle();

  if (!subscriptionRow) {
    try {
      const subscription = await stripeClient!.subscriptions.retrieve(invoice.subscription);
      await upsertSubscriptionRecord(subscription);
      const refreshed = await supabase
        .from('UserSubscriptions')
        .select('id, user_id')
        .eq('stripe_subscription_id', invoice.subscription)
        .maybeSingle();
      subscriptionRow = refreshed.data ?? null;
    } catch (error) {
      console.error('[billing] Unable to retrieve subscription for invoice', invoice.id, error);
      return;
    }
  }

  if (!subscriptionRow) {
    return;
  }

  const paidAt =
    invoice.status === 'paid' && invoice.status_transitions?.paid_at
      ? new Date(invoice.status_transitions.paid_at * 1000).toISOString()
      : null;

  const payload = {
    stripe_invoice_id: invoice.id,
    user_subscription_id: subscriptionRow.id,
    amount: invoice.amount_paid ?? invoice.amount_due ?? 0,
    currency: invoice.currency,
    status: invoice.status,
    hosted_invoice_url: invoice.hosted_invoice_url,
    paid_at: paidAt,
    created_at: new Date(invoice.created * 1000).toISOString(),
  };

  const { error } = await supabase
    .from('SubscriptionInvoices')
    .upsert(payload, { onConflict: 'stripe_invoice_id' });

  if (error) {
    console.error('[billing] Failed to upsert invoice', error);
  }
};

const getLatestUserSubscription = async (userId: string) => {
  const { data, error } = await supabase
    .from('UserSubscriptions')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) {
    throw new AppError('Failed to load subscription information', {
      statusCode: 500,
      code: 'SUBSCRIPTION_FETCH_FAILED',
      detail: error.message,
      exposeError: true,
    });
  }

  return data;
};

export const getBillingStatus = (req: Request, res: Response) => {
  return res.json({
    success: true,
    data: {
      enabled: billingEnabled && Boolean(stripeClient),
    },
  });
};

export const getUserSubscription = async (req: Request, res: Response) => {
  try {
    const userId = (req as AuthenticatedRequest).userId;
    if (!userId) {
      throw new AppError('User not authenticated', { statusCode: 401, code: 'UNAUTHENTICATED' });
    }

    const subscription = await getLatestUserSubscription(userId);

    return res.json({
      success: true,
      data: subscription ?? null,
    });
  } catch (error: unknown) {
    return handleControllerError(res, error, 'Get user subscription error');
  }
};

export const createCheckoutSession = async (req: Request, res: Response) => {
  try {
    assertBillingEnabled();

    const userId = (req as AuthenticatedRequest).userId;
    if (!userId) {
      throw new AppError('User not authenticated', { statusCode: 401, code: 'UNAUTHENTICATED' });
    }

    const planId = req.body?.plan_id;
    if (!planId || !planPriceMap[planId]) {
      throw new AppError('Invalid plan id provided', {
        statusCode: 400,
        code: 'INVALID_PLAN',
      });
    }

    const stripeCustomerId = await ensureStripeCustomer(userId);

    const session = await stripeClient!.checkout.sessions.create({
      mode: 'subscription',
      customer: stripeCustomerId,
      success_url: `${appBaseUrl}/setting/subscription?from=checkout_success`,
      cancel_url: `${appBaseUrl}/setting/pricing-menu?from=checkout_cancel`,
      line_items: [
        {
          price: planPriceMap[planId],
          quantity: 1,
        },
      ],
      metadata: {
        plan_id: planId,
        user_id: userId,
      },
    });

    return res.json({
      success: true,
      data: {
        url: session.url,
      },
    });
  } catch (error: unknown) {
    return handleControllerError(res, error, 'Create checkout session error');
  }
};

export const createCustomerPortalSession = async (req: Request, res: Response) => {
  try {
    assertBillingEnabled();

    const userId = (req as AuthenticatedRequest).userId;
    if (!userId) {
      throw new AppError('User not authenticated', { statusCode: 401, code: 'UNAUTHENTICATED' });
    }

    const stripeCustomerId = await ensureStripeCustomer(userId);

    const portalSession = await stripeClient!.billingPortal.sessions.create({
      customer: stripeCustomerId,
      return_url: `${appBaseUrl}/setting/subscription`,
    });

    return res.json({
      success: true,
      data: {
        url: portalSession.url,
      },
    });
  } catch (error: unknown) {
    return handleControllerError(res, error, 'Create customer portal session error');
  }
};

export const handleStripeWebhook = async (req: RequestWithRawBody, res: Response) => {
  try {
    assertBillingEnabled();

    if (!stripeClient || !webhookSecret) {
      throw new AppError('Stripe webhook secret is not configured', {
        statusCode: 500,
        code: 'WEBHOOK_SECRET_MISSING',
      });
    }

    const signature = req.headers['stripe-signature'];
    if (!signature) {
      throw new AppError('Missing Stripe signature header', {
        statusCode: 400,
        code: 'STRIPE_SIGNATURE_MISSING',
      });
    }

    if (!req.rawBody) {
      throw new AppError('Raw body unavailable for Stripe webhook verification', {
        statusCode: 400,
        code: 'RAW_BODY_MISSING',
      });
    }

    let event: Stripe.Event;
    try {
      event = stripeClient.webhooks.constructEvent(req.rawBody, signature, webhookSecret);
    } catch (err: unknown) {
      console.error('[billing] Stripe webhook signature verification failed', err);
      const errorMessage = err instanceof Error ? err.message : String(err);
      return res.status(400).json({ success: false, message: `Webhook Error: ${errorMessage}` });
    }

    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        if (session.subscription && typeof session.subscription === 'string') {
          const subscription = await stripeClient.subscriptions.retrieve(session.subscription);
          await upsertSubscriptionRecord(subscription);
        }
        break;
      }
      case 'customer.subscription.created':
      case 'customer.subscription.updated':
      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription;
        await upsertSubscriptionRecord(subscription);
        break;
      }
      case 'invoice.paid':
      case 'invoice.payment_failed':
      case 'invoice.finalized': {
        const invoice = event.data.object as Stripe.Invoice;
        await upsertInvoiceRecord(invoice);
        break;
      }
      default:
        break;
    }

    return res.json({ received: true });
  } catch (error: unknown) {
    return handleControllerError(res, error, 'Stripe webhook handler error');
  }
};
