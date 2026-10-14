import { useEffect, useState } from 'react';
import { getCurrentSession, startDemoSession } from '../api/demo';
import { DemoSessionContext } from './DemoSessionContext';

export function DemoSessionProvider({ children }) {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function initSession() {
      try {
        const current = await getCurrentSession();
        setSession(current);
      } catch {
        const started = await startDemoSession();
        setSession(started);
      } finally {
        setLoading(false);
      }
    }

    initSession();
  }, []);

  return (
    <DemoSessionContext.Provider value={{ session, loading }}>
      {children}
    </DemoSessionContext.Provider>
  );
}
