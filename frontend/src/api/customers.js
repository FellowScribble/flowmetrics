import apiClient from './client';

export const getCustomers = async () => {
  const { data } = await apiClient.get('/customers');
  return data;
};

export const getCustomerById = async (id) => {
  const { data } = await apiClient.get(`/customers/${id}`);
  return data;
};

export const createCustomer = async (customer) => {
  const { data } = await apiClient.post('/customers', customer);
  return data;
};

export const updateCustomer = async (id, customer) => {
  const { data } = await apiClient.put(`/customers/${id}`, customer);
  return data;
};

export const deleteCustomer = async (id) => {
  await apiClient.delete(`/customers/${id}`);
};