import { useEffect, useRef, useState } from 'react';
import { NavLink, Link, useNavigate } from 'react-router-dom';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import {
  LayoutDashboard,
  Users,
  ShoppingCart,
  Package,
  Tag,
  BarChart3,
  Settings,
  X,
  ChevronUp,
  CreditCard,
  LogOut,
  User,
} from 'lucide-react';
import { cn } from '../../lib/cn';
import { useMediaQuery } from '../../lib/useMediaQuery';
import LanguageToggle from '../../i18n/LanguageToggle';
import { useLanguage } from '../../i18n/useLanguage';
import { useToast } from '../ui/toast/useToast';

const navItems = [
  { to: '/demo/dashboard', labelKey: 'nav.dashboard', icon: LayoutDashboard },
  { to: '/demo/customers', labelKey: 'nav.customers', icon: Users },
  { to: '/demo/sales', labelKey: 'nav.sales', icon: ShoppingCart },
  { to: '/demo/products', labelKey: 'nav.products', icon: Package },
  { to: '/demo/categories', labelKey: 'nav.categories', icon: Tag },
  { to: '/demo/reports', labelKey: 'nav.reports', icon: BarChart3 },
  { to: '/demo/settings', labelKey: 'nav.settings', icon: Settings },
];

function Sidebar({ companyName, open = false, onClose }) {
  const { t } = useLanguage();
  const isDesktop = useMediaQuery('(min-width: 1024px)');
  // En escritorio el panel es estático; en móvil, cuando está cerrado, sigue en
  // el DOM desplazado fuera de pantalla. `inert` lo saca del orden de tabulación.
  const hiddenOnMobile = !open && !isDesktop;

  useEffect(() => {
    if (!open) return undefined;
    function handleKeyDown(event) {
      if (event.key === 'Escape') onClose();
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [open, onClose]);

  return (
    <>
      {open && (
        <div
          className="fixed inset-0 z-30 bg-black/60 lg:hidden"
          onClick={onClose}
          aria-hidden="true"
        />
      )}
      <aside
        inert={hiddenOnMobile ? true : undefined}
        aria-hidden={hiddenOnMobile ? true : undefined}
        className={cn(
          'fixed inset-y-0 left-0 z-40 flex w-64 flex-col border-r border-zinc-800 bg-zinc-950 p-4 transition-transform lg:static lg:translate-x-0',
          open ? 'translate-x-0' : '-translate-x-full',
        )}
      >
        <div className="mb-8 flex items-center gap-2 px-2">
          <Link
            to="/"
            className="group min-w-0 flex-1"
            aria-label={t('aria.backHome')}
            title={t('aria.backHome')}
          >
            <div className="text-xl font-bold text-brand-400 transition-colors group-hover:text-brand-300">
              FlowMetrics
            </div>
            {companyName && <div className="text-xs text-zinc-500">{companyName}</div>}
          </Link>
          <div className="hidden lg:flex">
            <LanguageToggle />
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label={t('aria.closeMenu')}
            className="rounded-md p-1 text-zinc-500 transition-colors hover:bg-zinc-800 hover:text-zinc-200 lg:hidden"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <nav className="flex flex-col gap-1">
          {navItems.map(({ to, labelKey, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              onClick={onClose}
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors',
                  isActive
                    ? 'bg-brand-950 font-medium text-brand-300'
                    : 'text-zinc-400 hover:bg-zinc-800 hover:text-zinc-100',
                )
              }
            >
              <Icon size={18} />
              {t(labelKey)}
            </NavLink>
          ))}
        </nav>

        <AccountMenu onNavigate={onClose} />
      </aside>
    </>
  );
}

// Bloque de cuenta simulado al pie del sidebar (avatar + menú desplegable).
function AccountMenu({ onNavigate }) {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const toast = useToast();
  const reduceMotion = useReducedMotion();
  const [open, setOpen] = useState(false);
  const containerRef = useRef(null);

  useEffect(() => {
    if (!open) return undefined;
    const onPointerDown = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setOpen(false);
      }
    };
    const onKeyDown = (event) => {
      if (event.key === 'Escape') setOpen(false);
    };
    document.addEventListener('pointerdown', onPointerDown, true);
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('pointerdown', onPointerDown, true);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [open]);

  const simulation = () => {
    setOpen(false);
    toast.info(t('account.simulated'));
  };

  const goToSettings = () => {
    setOpen(false);
    onNavigate?.();
    navigate('/demo/settings');
  };

  const logout = () => {
    setOpen(false);
    onNavigate?.();
    navigate('/');
  };

  const items = [
    { labelKey: 'account.profile', icon: User, onClick: simulation },
    { labelKey: 'account.billing', icon: CreditCard, onClick: goToSettings },
    { labelKey: 'account.settings', icon: Settings, onClick: goToSettings },
    { labelKey: 'account.logout', icon: LogOut, onClick: logout, danger: true },
  ];

  return (
    <div ref={containerRef} className="relative mt-auto pt-4">
      <AnimatePresence>
        {open && (
          <motion.div
            initial={reduceMotion ? false : { opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={reduceMotion ? undefined : { opacity: 0, y: 8 }}
            transition={{ duration: reduceMotion ? 0 : 0.15, ease: [0.22, 1, 0.36, 1] }}
            className="absolute bottom-full left-0 right-0 mb-2 overflow-hidden rounded-lg border border-zinc-800 bg-zinc-900 p-1 shadow-xl"
          >
            {items.map(({ labelKey, icon: Icon, onClick, danger }) => (
              <button
                key={labelKey}
                type="button"
                onClick={onClick}
                className={cn(
                  'flex w-full items-center gap-2.5 rounded-md px-3 py-2 text-left text-sm transition-colors',
                  danger
                    ? 'text-red-300 hover:bg-red-950/40'
                    : 'text-zinc-300 hover:bg-zinc-800 hover:text-zinc-100',
                )}
              >
                <Icon className="h-4 w-4 shrink-0" />
                {t(labelKey)}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-expanded={open}
        aria-haspopup="menu"
        aria-label={t('account.menuLabel')}
        className="flex w-full items-center gap-3 rounded-lg border border-zinc-800 bg-zinc-900/60 px-2.5 py-2 text-left transition-colors hover:bg-zinc-800"
      >
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-brand-800/60 bg-brand-950 text-xs font-semibold text-brand-300">
          AV
        </span>
        <span className="min-w-0 flex-1">
          <span className="block truncate text-sm font-medium text-zinc-100">
            {t('account.name')}
          </span>
          <span className="block truncate text-[11px] text-zinc-500">{t('account.role')}</span>
        </span>
        <ChevronUp
          aria-hidden="true"
          className={cn(
            'h-4 w-4 shrink-0 text-zinc-500 transition-transform',
            !open && 'rotate-180',
          )}
        />
      </button>
    </div>
  );
}

export default Sidebar;
