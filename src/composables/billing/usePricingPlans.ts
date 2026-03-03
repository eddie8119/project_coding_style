import { computed } from 'vue';
import { useI18n } from 'vue-i18n';

import type { PricingMenuPlan } from '@/types/billing';

export const usePricingPlans = () => {
  const { t } = useI18n();

  const plans = computed<PricingMenuPlan[]>(() => [
    {
      id: 'starter',
      title: t('billing.starter.title'),
      subtitle: t('billing.starter.subtitle'),
      currencySymbol: '$',
      price: '9',
      currency: t('billing.currency.usd'),
      borderClass: 'border-2 border-green-500 dark:border-green-400',
      titleClass: 'text-green-600 dark:text-green-400',
      buttonClass: 'bg-green-600 hover:bg-green-700 focus-visible:ring-green-400',
      checkClass: 'text-green-500',
      buttonText: t('billing.selectPlan'),
      features: [
        t('billing.starter.feature1'),
        t('billing.starter.feature2'),
        t('billing.starter.feature3'),
      ],
    },
    {
      id: 'professional',
      title: t('billing.professional.title'),
      subtitle: t('billing.professional.subtitle'),
      currencySymbol: '$',
      price: '19',
      currency: t('billing.currency.usd'),
      borderClass: 'border-2 border-blue-500 dark:border-blue-400',
      titleClass: 'text-blue-600 dark:text-blue-400',
      buttonClass: 'bg-blue-600 hover:bg-blue-700 focus-visible:ring-blue-400',
      checkClass: 'text-blue-500',
      buttonText: t('billing.selectPlan'),
      features: [
        t('billing.professional.feature1'),
        t('billing.professional.feature2'),
        t('billing.professional.feature3'),
        t('billing.professional.feature4'),
        t('billing.professional.feature5'),
      ],
    },
    {
      id: 'enterprise',
      title: t('billing.enterprise.title'),
      subtitle: t('billing.enterprise.subtitle'),
      currencySymbol: '$',
      price: '39',
      currency: t('billing.currency.usd'),
      borderClass: 'border-2 border-slate-400 dark:border-slate-500',
      titleClass: 'text-slate-700 dark:text-slate-300',
      buttonClass:
        'bg-slate-700 hover:bg-slate-800 focus-visible:ring-slate-400 dark:bg-slate-600 dark:hover:bg-slate-500',
      checkClass: 'text-slate-500',
      buttonText: t('billing.contactSales'),
      features: [
        t('billing.enterprise.feature1'),
        t('billing.enterprise.feature2'),
        t('billing.enterprise.feature3'),
      ],
      contactSales: true,
      note: t('billing.enterprise.note'),
    },
  ]);

  return { plans };
};
