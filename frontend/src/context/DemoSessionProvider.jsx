import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import apiClient from '../api/client';
import { getCurrentSession, startDemoSession } from '../api/demo';
import { DemoSessionContext } from './DemoSessionContext';

// Tras este umbral se muestra la pantalla de espera (antes, solo el spinner rápido).
const SHOW_WAITING_AFTER_MS = 2500;
// Límite total de la fase automática de sondeo (el texto de UI habla de ~1 minuto).
const CONNECT_DEADLINE_MS = 90000;
// Backoff entre sondas idempotentes de lectura durante la espera.
const PROBE_DELAYS_MS = [4000, 6000, 8000, 10000, 12000, 15000, 15000, 15000];
// Estados que pueden deberse a un arranque en frío del servidor.
const TRANSIENT_STATUSES = new Set([408, 425, 429, 502, 503, 504]);

function isTransientError(error) {
  // Sin respuesta (timeout, red caída, proxy aún levantándose): posible arranque en frío.
  if (!error?.response) return true;
  return TRANSIENT_STATUSES.has(error.response.status);
}

// Secuencia segura: se consulta primero la sesión existente (idempotente) y solo se
// crea una nueva si el servidor ha respondido 401 de forma inequívoca. Un fallo
// transitorio de la consulta NO se interpreta como ausencia de sesión.
async function attemptConnection() {
  try {
    const session = await getCurrentSession();
    return { ok: true, session };
  } catch (error) {
    const status = error?.response?.status;
    // 401 = no hay sesión; 404 = la sesión caducó o fue limpiada. Ambos son
    // respuestas definitivas del servidor y equivalen a "sin sesión activa".
    // Un fallo transitorio (timeout/red/5xx) NO se interpreta como ausencia.
    if (status !== 401 && status !== 404) {
      return { ok: false, stage: 'probe', error, transient: isTransientError(error) };
    }
  }

  try {
    const session = await startDemoSession();
    return { ok: true, session };
  } catch (error) {
    return { ok: false, stage: 'start', error, transient: isTransientError(error) };
  }
}

export function DemoSessionProvider({ children }) {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [errorKind, setErrorKind] = useState(null);
  const [expired, setExpired] = useState(false);
  const [startedAt, setStartedAt] = useState(null);
  const [elapsedMs, setElapsedMs] = useState(0);

  const cancelledRef = useRef(false);
  const inFlightRef = useRef(false);
  const sleepRef = useRef(null);
  const sessionRef = useRef(null);

  useEffect(() => {
    sessionRef.current = session;
  }, [session]);

  // Un 401 de cualquier petición de datos significa que el servidor ya no
  // reconoce la sesión (caducada o purgada): se muestra la pantalla de sesión
  // caducada. Se registra desde aquí para no modificar `client.js` (D-51).
  useEffect(() => {
    const interceptorId = apiClient.interceptors.response.use(
      (response) => response,
      (requestError) => {
        if (requestError?.response?.status === 401 && sessionRef.current) {
          // La sesión ya no es válida: se limpia la referencia para que el
          // reintento (renew) no vuelva a disparar esta pantalla cuando el
          // sondeo de /demo/me responda 401.
          sessionRef.current = null;
          setExpired(true);
        }
        return Promise.reject(requestError);
      },
    );
    return () => apiClient.interceptors.response.eject(interceptorId);
  }, []);

  const cancelSleep = useCallback(() => {
    const pending = sleepRef.current;
    if (!pending) return;
    window.clearTimeout(pending.id);
    sleepRef.current = null;
    pending.resolve();
  }, []);

  const sleep = useCallback(
    (ms) =>
      new Promise((resolve) => {
        const id = window.setTimeout(() => {
          sleepRef.current = null;
          resolve();
        }, ms);
        sleepRef.current = { id, resolve };
      }),
    [],
  );

  const runAttempt = useCallback(async () => {
    // Un solo bucle de conexión a la vez: evita sondeos y "start" concurrentes.
    if (inFlightRef.current) return;
    inFlightRef.current = true;

    const attemptStartedAt = Date.now();
    setStartedAt(attemptStartedAt);
    setElapsedMs(0);
    setLoading(true);
    setError(null);
    setErrorKind(null);

    let delayIndex = 0;

    try {
      for (;;) {
        if (cancelledRef.current) return;

        const result = await attemptConnection();
        if (cancelledRef.current) return;

        if (result.ok) {
          setSession(result.session);
          setError(null);
          setErrorKind(null);
          setExpired(false);
          return;
        }

        const elapsed = Date.now() - attemptStartedAt;
        // Solo se reintenta automáticamente la lectura idempotente y solo si el
        // fallo parece transitorio. "start" nunca se repite solo: no sabemos si
        // es idempotente y el servidor podría haberlo procesado ya.
        const canRetryAutomatically =
          result.stage === 'probe' && result.transient && elapsed < CONNECT_DEADLINE_MS;

        if (!canRetryAutomatically) {
          setError(result.error);
          setErrorKind(result.transient ? 'transient' : 'fatal');
          return;
        }

        const delay =
          PROBE_DELAYS_MS[Math.min(delayIndex, PROBE_DELAYS_MS.length - 1)];
        delayIndex += 1;
        await sleep(delay);
      }
    } finally {
      inFlightRef.current = false;
      if (!cancelledRef.current) setLoading(false);
    }
  }, [sleep]);

  useEffect(() => {
    cancelledRef.current = false;
    runAttempt();
    return () => {
      cancelledRef.current = true;
      cancelSleep();
    };
  }, [runAttempt, cancelSleep]);

  // Reloj de espera: solo mientras hay una conexión en curso.
  useEffect(() => {
    if (!loading || startedAt === null) return undefined;
    const tick = () => setElapsedMs(Date.now() - startedAt);
    const id = window.setInterval(tick, 250);
    return () => window.clearInterval(id);
  }, [loading, startedAt]);

  const retry = useCallback(() => {
    setExpired(false);
    runAttempt();
  }, [runAttempt]);

  const value = useMemo(
    () => ({
      session,
      loading,
      error,
      errorKind,
      retry,
      renew: retry,
      expired,
      elapsedMs,
      showWaiting: loading && elapsedMs >= SHOW_WAITING_AFTER_MS,
      deadlineMs: CONNECT_DEADLINE_MS,
    }),
    [session, loading, error, errorKind, retry, expired, elapsedMs],
  );

  return <DemoSessionContext.Provider value={value}>{children}</DemoSessionContext.Provider>;
}
