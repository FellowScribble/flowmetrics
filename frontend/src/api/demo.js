import apiClient from './client';

// Timeouts por petición (no se toca client.js).
// Un backend en frío (Render free) puede tardar; sin timeout la sonda de sesión
// podría quedar colgada y no podríamos acotar los reintentos automáticos.
// "start" usa un timeout generoso: es una operación no idempotente y no debe
// abortarse por un arranque lento que aún puede terminar bien.
const PROBE_TIMEOUT_MS = 15000;
const START_TIMEOUT_MS = 60000;

export const startDemoSession = async () => {
  const { data } = await apiClient.post('/demo/start', undefined, {
    timeout: START_TIMEOUT_MS,
  });
  return data;
};

export const getCurrentSession = async () => {
  const { data } = await apiClient.get('/demo/me', { timeout: PROBE_TIMEOUT_MS });
  return data;
};
