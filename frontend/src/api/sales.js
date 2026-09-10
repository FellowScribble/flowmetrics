import apiClient from './client';

export const getSales = async () => {
  const { data } = await apiClient.get('/sales');
  return data;
};

export const getSaleById = async (id) => {
  const { data } = await apiClient.get(`/sales/${id}`);
  return data;
};

export const createSale = async (sale) => {
  const { data } = await apiClient.post('/sales', sale);
  return data;
};

export const updateSale = async (id, sale) => {
  const { data } = await apiClient.put(`/sales/${id}`, sale);
  return data;
};

export const deleteSale = async (id) => {
  await apiClient.delete(`/sales/${id}`);
};