import { useState } from 'react';
import { Outlet, Link } from 'react-router-dom';
import { Menu } from 'lucide-react';
import Sidebar from './Sidebar';
import Spinner from '../ui/Spinner';
import Button from '../ui/Button';
import LanguageToggle from '../../i18n/LanguageToggle';
import { useLanguage } from '../../i18n/useLanguage';
import { useDemoSession } from '../../context/useDemoSession';

function AppLayout() {
  const { session, loading, error, retry } = useDemoSession();
  const { t } = useLanguage();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center gap-3 text-sm text-zinc-400">
        <Spinner />
        {t('layout.preparing')}
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-3 px-6 text-center">
        <p className="text-sm font-medium text-zinc-200">{t('layout.sessionError')}</p>
        <p className="max-w-sm text-xs text-zinc-500">{t('layout.sessionErrorHint')}</p>
        <Button onClick={retry}>{t('common.retry')}</Button>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-black text-zinc-100">
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
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default AppLayout;
