import type { TranslateFunction } from '@/types/i18n';

export type MaterialLike = {
  quantity?: number | null;
  unitPrice?: number | null;
};

export const getQuantityError = (item: MaterialLike, t: TranslateFunction): string => {
  if (item.quantity === undefined || item.quantity === null) return '';
  if (item.quantity <= 0) return t('validation.quantity.positive');
  return '';
};

export const getPriceError = (item: MaterialLike, t: TranslateFunction): string => {
  if (item.unitPrice === undefined || item.unitPrice === null) return '';
  if (item.unitPrice < 0) return t('validation.unit_price.negative');
  return '';
};
