import apiClient from './client';

export const getSummary = async () => {
  const { data } = await apiClient.get('/reports/summary');
  return data;
};

export const getSalesByMonth = async () => {
  const { data } = await apiClient.get('/reports/sales-by-month');
  return data;
};

export const getTopProducts = async () => {
  const { data } = await apiClient.get('/reports/top-products');
  return data;
};