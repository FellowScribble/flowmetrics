import { useCallback, useEffect, useState } from 'react';
import { getCurrentSession, startDemoSession } from '../api/demo';
import { DemoSessionContext } from './DemoSessionContext';

async function resolveDemoSession() {
  try {
    return await getCurrentSession();
  } catch {
    return await startDemoSession();
  }
}

export function DemoSessionProvider({ children }) {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;

    async function initSession() {
      try {
        const resolved = await resolveDemoSession();
        if (cancelled) return;
        setSession(resolved);
        setError(null);
      } catch (initError) {
        if (cancelled) return;
        setError(initError);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    initSession();

    return () => {
      cancelled = true;
    };
  }, []);

  const retry = useCallback(() => {
    setLoading(true);
    setError(null);
    resolveDemoSession()
      .then((resolved) => setSession(resolved))
      .catch((retryError) => setError(retryError))
      .finally(() => setLoading(false));
  }, []);

  return (
    <DemoSessionContext.Provider value={{ session, loading, error, retry }}>
      {children}
    </DemoSessionContext.Provider>
  );
}
