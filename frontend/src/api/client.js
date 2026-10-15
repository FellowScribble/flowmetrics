import axios from 'axios';

const baseURL = import.meta.env.VITE_API_URL ?? 'http://localhost:8080/api';

const apiClient = axios.create({
  baseURL,
  withCredentials: true,
});

export default apiClient;