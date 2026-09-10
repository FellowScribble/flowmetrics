import apiClient from './client';

export const startDemoSession = async () => {
  const { data } = await apiClient.post('/demo/start');
  return data;
};

export const getCurrentSession = async () => {
  const { data } = await apiClient.get('/demo/me');
  return data;
};