import apiClient from './client';

export const getProducts = async () => {
  const { data } = await apiClient.get('/products');
  return data;
};

export const getProductById = async (id) => {
  const { data } = await apiClient.get(`/products/${id}`);
  return data;
};

export const createProduct = async (product) => {
  const { data } = await apiClient.post('/products', product);
  return data;
};

export const updateProduct = async (id, product) => {
  const { data } = await apiClient.put(`/products/${id}`, product);
  return data;
};

export const deleteProduct = async (id) => {
  await apiClient.delete(`/products/${id}`);
};