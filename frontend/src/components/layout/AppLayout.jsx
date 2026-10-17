import { useState } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { motion, useReducedMotion } from 'framer-motion';
import { Menu } from 'lucide-react';
import Sidebar from './Sidebar';
import Spinner from '../ui/Spinner';
import ConnectingScreen from './ConnectingScreen';
import ConnectionErrorScreen from './ConnectionErrorScreen';
import SessionExpiredScreen from './SessionExpiredScreen';
import LanguageToggle from '../../i18n/LanguageToggle';
import { useLanguage } from '../../i18n/useLanguage';
import { useDemoSession } from '../../context/useDemoSession';

function AppLayout() {
  const { session, loading, error, errorKind, retry, expired, renew, elapsedMs, showWaiting, deadlineMs } =
    useDemoSession();
  const { t } = useLanguage();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const reduceMotion = useReducedMotion();

  if (loading) {
    // Si la respuesta llega rápido, solo se ve el spinner habitual; la pantalla
    // de espera aparece únicamente cuando la conexión se alarga.
    if (showWaiting) {
      return <ConnectingScreen elapsedMs={elapsedMs} deadlineMs={deadlineMs} />;
    }
    return (
      <div className="flex min-h-screen items-center justify-center gap-3 text-sm text-zinc-400">
        <Spinner />
        {t('layout.preparing')}
      </div>
    );
  }

  if (error) {
    return <ConnectionErrorScreen error={error} errorKind={errorKind} onRetry={retry} />;
  }

  if (expired) {
    return <SessionExpiredScreen onRenew={renew} />;
  }

  return (
    <div className="flex min-h-screen bg-zinc-950 text-zinc-100">
      <Sidebar
        companyName={session?.companyName}
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex items-center gap-3 border-b border-zinc-800 bg-zinc-950 px-4 py-3 lg:hidden">
          <button
            type="button"
            onClick={() => setSidebarOpen(true)}
            aria-label={t('aria.openMenu')}
            className="rounded-md p-1.5 text-zinc-400 transition-colors hover:bg-zinc-800 hover:text-zinc-100"
          >
            <Menu className="h-5 w-5" />
          </button>
          <Link
            to="/"
            className="font-semibold text-brand-400"
            aria-label={t('aria.backHome')}
          >
            FlowMetrics
          </Link>
          <LanguageToggle className="ml-auto" />
        </header>
        <main className="flex-1 p-4 sm:p-6">
          <div className="mb-4 rounded-lg border border-brand-900/60 bg-brand-950/40 px-3 py-2 text-xs text-brand-300 sm:text-right">
            {t('layout.demoBanner')}
          </div>
          {/* Transición entre pestañas de la demo: fade + desplazamiento muy
              suave y lento al cambiar de sección (apenas se aprecia) */}
          <motion.div
            key={location.pathname}
            initial={reduceMotion ? false : { opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: reduceMotion ? 0 : 0.7, ease: 'easeOut' }}
          >
            <Outlet />
          </motion.div>
        </main>
      </div>
    </div>
  );
}

export default AppLayout;
