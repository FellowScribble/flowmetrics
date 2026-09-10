import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Users, ShoppingCart, Package, BarChart3, Settings } from 'lucide-react';

const navItems = [
  { to: '/demo/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/demo/customers', label: 'Clientes', icon: Users },
  { to: '/demo/sales', label: 'Ventas', icon: ShoppingCart },
  { to: '/demo/products', label: 'Productos', icon: Package },
  { to: '/demo/reports', label: 'Informes', icon: BarChart3 },
  { to: '/demo/settings', label: 'Configuración', icon: Settings },
];

function Sidebar({ companyName }) {
  return (
    <aside className="w-60 h-screen border-r flex flex-col p-4">
      <div className="mb-8 px-2">
        <div className="text-xl font-bold">FlowMetrics</div>
        {companyName && <div className="text-xs text-gray-500">{companyName}</div>}
      </div>

      <nav className="flex flex-col gap-1">
        {navItems.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2 rounded-md text-sm ${
                isActive ? 'bg-gray-200 font-medium' : 'hover:bg-gray-100'
              }`
            }
          >
            <Icon size={18} />
            {label}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}

export default Sidebar;