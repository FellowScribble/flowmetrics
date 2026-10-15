const DEFAULT_LOCALE = 'es-ES';

const currencyFormatters = new Map();
const dateFormatters = new Map();
const dateTimeFormatters = new Map();

function currencyFormatter(locale) {
  if (!currencyFormatters.has(locale)) {
    currencyFormatters.set(
      locale,
      new Intl.NumberFormat(locale, { style: 'currency', currency: 'EUR' }),
    );
  }
  return currencyFormatters.get(locale);
}

function dateFormatter(locale) {
  if (!dateFormatters.has(locale)) {
    dateFormatters.set(
      locale,
      new Intl.DateTimeFormat(locale, { day: '2-digit', month: '2-digit', year: 'numeric' }),
    );
  }
  return dateFormatters.get(locale);
}

function dateTimeFormatter(locale) {
  if (!dateTimeFormatters.has(locale)) {
    dateTimeFormatters.set(
      locale,
      new Intl.DateTimeFormat(locale, {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      }),
    );
  }
  return dateTimeFormatters.get(locale);
}

export function formatCurrency(value, locale = DEFAULT_LOCALE) {
  const number = Number(value);
  if (Number.isNaN(number)) return '—';
  return currencyFormatter(locale).format(number);
}

export function formatDate(value, locale = DEFAULT_LOCALE) {
  if (!value) return '—';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '—';
  return dateFormatter(locale).format(date);
}

export function formatDateTime(value, locale = DEFAULT_LOCALE) {
  if (!value) return '—';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '—';
  return dateTimeFormatter(locale).format(date);
}

const saleStatusTones = {
  COMPLETED: 'success',
  PENDING: 'warning',
  CANCELLED: 'danger',
};

const paymentStatusTones = {
  PAID: 'success',
  PENDING: 'warning',
};

export function saleStatusTone(value) {
  return saleStatusTones[value] ?? 'neutral';
}

export function paymentStatusTone(value) {
  return paymentStatusTones[value] ?? 'neutral';
}
