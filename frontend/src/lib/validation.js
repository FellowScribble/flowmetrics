export const isBlank = (value) => value == null || String(value).trim() === '';

export const isEmail = (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(value).trim());

export const isNonNegativeNumber = (value) => {
  if (isBlank(value)) return false;
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed >= 0;
};

export const isNonNegativeInteger = (value) => isNonNegativeNumber(value) && Number.isInteger(Number(value));

export const isPositiveInteger = (value) => {
  if (isBlank(value)) return false;
  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed >= 1;
};
