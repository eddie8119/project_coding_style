export interface PricingMenuPlan {
  id: string;
  title: string;
  subtitle: string;
  currencySymbol: string;
  price: string;
  currency: string;
  borderClass: string;
  titleClass: string;
  buttonClass: string;
  checkClass: string;
  buttonText: string;
  features: string[];
  contactSales?: boolean;
  note?: string;
}

export interface SubscriptionPlan {
  id: string;
  name: string;
  description: string;
  price: number;
  currency: string;
  interval: 'month' | 'year';
  features: string[];
}

export interface UserSubscription {
  id: string;
  user_id: string;
  plan: string;
  status: 'active' | 'inactive' | 'cancelled' | 'past_due';
  current_period_start: string;
  current_period_end: string;
  cancel_at_period_end: boolean;
  created_at: string;
  updated_at: string;
}
