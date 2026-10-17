import { useCallback, useEffect, useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { AlertTriangle, TrendingUp, Users, Wallet, RefreshCw } from 'lucide-react';
import { getSummary, getSalesByMonth } from '../api/reports';
import { getActivity } from '../api/activity';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import Skeleton from '../components/ui/Skeleton';
import EmptyState from '../components/ui/EmptyState';
import ErrorState from '../components/ui/ErrorState';
import PageHeader from '../components/ui/PageHeader';
import { useAsyncData } from '../lib/useAsyncData';
import { useFormat } from '../lib/useFormat';
import { useLanguage } from '../i18n/useLanguage';

const chartColor = '#a855f7';
const tooltipStyle = {
  backgroundColor: '#18181b',
  border: '1px solid #27272a',
  borderRadius: 8,
};
const tooltipLabelStyle = { color: '#a1a1aa' };
const tooltipItemStyle = { color: '#f4f4f5' };
const entranceEase = [0.22, 1, 0.36, 1];

// Cuenta ascendente hasta el valor final. Respeta «reducir movimiento».
function useCountUp(target, duration = 700) {
  const reduceMotion = useReducedMotion();
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    if (reduceMotion) return undefined;
    let raf;
    const start = performance.now();
    const tick = (now) => {
      const progress = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplay(target * eased);
      if (progress < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target, duration, reduceMotion]);

  return reduceMotion ? target : display;
}

function Dashboard() {
  const { t } = useLanguage();
  const { currency, dateTime } = useFormat();

  const loadDashboard = useCallback(async () => {
    const [summary, monthlySales, activity] = await Promise.all([
      getSummary(),
      getSalesByMonth(),
      getActivity(),
    ]);
    return { summary, monthlySales, activity };
  }, []);

  const { data, loading, error, hasData, refresh, refreshError, retry } =
    useAsyncData(loadDashboard);

  if (loading) return <DashboardSkeleton />;
  if (error && !hasData) return <ErrorState onRetry={retry} />;

  const { summary, monthlySales, activity } = data;

  return (
    <div>
      <PageHeader
        title={t('nav.dashboard')}
        description={t('dashboard.description')}
        actions={
          <Button variant="secondary" onClick={refresh}>
            <RefreshCw className="h-4 w-4" />
            {t('common.refresh')}
          </Button>
        }
      />

      {refreshError && (
        <ErrorState variant="inline" className="mb-6" onRetry={refresh} />
      )}

      <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <KpiCard
          icon={Wallet}
          label={t('dashboard.kpiTotalRevenue')}
          value={summary.totalRevenue}
          format={currency}
          index={0}
        />
        <KpiCard
          icon={TrendingUp}
          label={t('dashboard.kpiRevenueThisMonth')}
          value={summary.revenueThisMonth}
          format={currency}
          index={1}
        />
        <KpiCard
          icon={Users}
          label={t('dashboard.kpiActiveCustomers')}
          value={summary.activeCustomers}
          index={2}
        />
        <KpiCard
          icon={AlertTriangle}
          label={t('dashboard.kpiLowStock')}
          value={summary.lowStockProducts}
          tone={summary.lowStockProducts > 0 ? 'warning' : 'default'}
          index={3}
        />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, delay: 0.3, ease: entranceEase }}
      >
        <Card className="mb-8 p-5">
        <h2 className="mb-4 text-lg font-semibold text-zinc-100">
          {t('dashboard.salesByMonth')}
        </h2>
        {monthlySales.length === 0 ? (
          <EmptyState
            title={t('dashboard.salesEmptyTitle')}
            description={t('dashboard.salesEmptyDescription')}
          />
        ) : (
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={monthlySales}>
              <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
              <XAxis dataKey="month" tick={{ fontSize: 12, fill: '#a1a1aa' }} />
              <YAxis
                tick={{ fontSize: 12, fill: '#a1a1aa' }}
                tickFormatter={(value) => `${value} €`}
              />
              <Tooltip
                formatter={(value) => currency(value)}
                contentStyle={tooltipStyle}
                labelStyle={tooltipLabelStyle}
                itemStyle={tooltipItemStyle}
              />
              <Line
                type="monotone"
                dataKey="total"
                stroke={chartColor}
                strokeWidth={2}
                dot={{ r: 3, fill: chartColor }}
                activeDot={{ r: 5 }}
              />
            </LineChart>
          </ResponsiveContainer>
        )}
        </Card>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, delay: 0.38, ease: entranceEase }}
      >
        <Card className="p-5">
        <h2 className="mb-4 text-lg font-semibold text-zinc-100">
          {t('dashboard.recentActivity')}
        </h2>
        {activity.length === 0 ? (
          <EmptyState
            title={t('dashboard.activityEmptyTitle')}
            description={t('dashboard.activityEmptyDescription')}
          />
        ) : (
          <ul className="divide-y divide-zinc-800">
            {activity.slice(0, 8).map((item) => (
              <li key={item.id} className="py-3">
                <p className="text-sm font-medium text-zinc-100">{item.title}</p>
                {item.description && (
                  <p className="text-sm text-zinc-400">{item.description}</p>
                )}
                <p className="mt-0.5 text-xs text-zinc-400">{dateTime(item.createdAt)}</p>
              </li>
            ))}
          </ul>
        )}
        </Card>
      </motion.div>
    </div>
  );
}

function KpiCard({ icon: Icon, label, value, format, tone = 'default', index = 0 }) {
  const reduceMotion = useReducedMotion();
  const display = useCountUp(value);
  const displayText = format
    ? format(display)
    : Math.round(display).toLocaleString('es-ES');

  return (
    <motion.div
      initial={reduceMotion ? false : { opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, delay: 0.06 * index, ease: entranceEase }}
    >
      <Card className="p-4">
        <div className="flex items-center gap-2 text-zinc-400">
          <Icon
            className={`h-4 w-4 ${tone === 'warning' ? 'text-amber-500' : 'text-brand-500'}`}
          />
          <span className="text-sm">{label}</span>
        </div>
        <div className="mt-2 text-2xl font-bold text-zinc-100">{displayText}</div>
      </Card>
    </motion.div>
  );
}

function DashboardSkeleton() {
  return (
    <div>
      <Skeleton className="mb-6 h-8 w-40" />
      <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <Skeleton key={index} className="h-24" />
        ))}
      </div>
      <Skeleton className="mb-8 h-80" />
      <Skeleton className="h-64" />
    </div>
  );
}

export default Dashboard;
