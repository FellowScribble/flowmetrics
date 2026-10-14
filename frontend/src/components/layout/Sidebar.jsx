import { NavLink, Link } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  ShoppingCart,
  Package,
  Tag,
  BarChart3,
  Settings,
  X,
} from 'lucide-react';
import { cn } from '../../lib/cn';
import LanguageToggle from '../../i18n/LanguageToggle';
import { useLanguage } from '../../i18n/useLanguage';

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
          <LanguageToggle />
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
      </aside>
    </>
  );
}

export default Sidebar;
