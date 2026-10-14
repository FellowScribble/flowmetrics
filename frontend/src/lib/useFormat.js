import { useMemo } from 'react';
import { useLanguage } from '../i18n/useLanguage';
import {
  formatCurrency,
  formatDate,
  formatDateTime,
  paymentStatusTone,
  saleStatusTone,
} from './format';

export function useFormat() {
  const { locale, tEnum } = useLanguage();

  return useMemo(
    () => ({
      currency: (value) => formatCurrency(value, locale),
      date: (value) => formatDate(value, locale),
      dateTime: (value) => formatDateTime(value, locale),
      saleStatus: (value) => ({
        tone: saleStatusTone(value),
        label: tEnum('enums.saleStatus', value),
      }),
      paymentStatus: (value) => ({
        tone: paymentStatusTone(value),
        label: tEnum('enums.paymentStatus', value),
      }),
      paymentMethod: (value) => tEnum('enums.paymentMethod', value),
    }),
    [locale, tEnum],
  );
}
