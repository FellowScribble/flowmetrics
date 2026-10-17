import { useCallback, useEffect, useRef, useState } from 'react';

export function useAsyncData(loader) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [refreshError, setRefreshError] = useState(null);
  const [token, setToken] = useState(0);
  const hasDataRef = useRef(false);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const result = await loader();
        if (cancelled) return;
        hasDataRef.current = true;
        setData(result);
        setError(null);
        setRefreshError(null);
      } catch (err) {
        if (cancelled) return;
        // Si ya había datos, un refresco fallido no debe borrar la pantalla:
        // se conserva lo último válido y se avisa con un banner.
        if (hasDataRef.current) {
          setRefreshError(err);
        } else {
          setError(err);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
          setRefreshing(false);
        }
      }
    }

    load();

    return () => {
      cancelled = true;
    };
  }, [loader, token]);

  const refresh = useCallback(() => {
    setRefreshing(true);
    setToken((n) => n + 1);
  }, []);

  const retry = useCallback(() => {
    setLoading(true);
    setError(null);
    setToken((n) => n + 1);
  }, []);

  return {
    data,
    loading,
    error,
    hasData: data !== null,
    refreshing,
    refreshError,
    refresh,
    retry,
  };
}
