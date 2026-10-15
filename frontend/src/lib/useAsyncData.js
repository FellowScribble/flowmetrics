import { useCallback, useEffect, useState } from 'react';

export function useAsyncData(loader) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [token, setToken] = useState(0);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const result = await loader();
        if (cancelled) return;
        setData(result);
        setError(null);
      } catch (err) {
        if (!cancelled) setError(err);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();

    return () => {
      cancelled = true;
    };
  }, [loader, token]);

  const refresh = useCallback(() => setToken((n) => n + 1), []);
  const retry = useCallback(() => {
    setLoading(true);
    setToken((n) => n + 1);
  }, []);

  return { data, loading, error, refresh, retry };
}
