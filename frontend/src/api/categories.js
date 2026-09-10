import apiClient from './client';

export const getCategories = async () => {
  const { data } = await apiClient.get('/categories');
  return data;
};

export const getCategoryById = async (id) => {
  const { data } = await apiClient.get(`/categories/${id}`);
  return data;
};

export const createCategory = async (category) => {
  const { data } = await apiClient.post('/categories', category);
  return data;
};

export const updateCategory = async (id, category) => {
  const { data } = await apiClient.put(`/categories/${id}`, category);
  return data;
};

export const deleteCategory = async (id) => {
  await apiClient.delete(`/categories/${id}`);
};