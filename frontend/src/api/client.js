import axios from 'axios';

const baseURL = import.meta.env.VITE_API_URL ?? (import.meta.env.DEV ? 'http://localhost:8080/api' : '/api');

const apiClient = axios.create({
  baseURL,
  withCredentials: true,
});

export default apiClient;
