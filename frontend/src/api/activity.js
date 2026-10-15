import apiClient from './client';

export const getActivity = async () => {
  const { data } = await apiClient.get('/activity');
  return data;
};