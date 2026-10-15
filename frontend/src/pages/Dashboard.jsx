import { useCallback } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { AlertTriangle, TrendingUp, Users, Wallet } from 'lucide-react';
import { getSummary, getSalesByMonth } from '../api/reports';
import { getActivity } from '../api/activity';
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

  const { data, loading, error, retry } = useAsyncData(loadDashboard);

  if (loading) return <DashboardSkeleton />;
  if (error) return <ErrorState onRetry={retry} />;

  const { summary, monthlySales, activity } = data;

  return (
    <div>
      <PageHeader title={t('nav.dashboard')} description={t('dashboard.description')} />

      <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <KpiCard
          icon={Wallet}
          label={t('dashboard.kpiTotalRevenue')}
          value={currency(summary.totalRevenue)}
        />
        <KpiCard
          icon={TrendingUp}
          label={t('dashboard.kpiRevenueThisMonth')}
          value={currency(summary.revenueThisMonth)}
        />
        <KpiCard
          icon={Users}
          label={t('dashboard.kpiActiveCustomers')}
          value={summary.activeCustomers}
        />
        <KpiCard
          icon={AlertTriangle}
          label={t('dashboard.kpiLowStock')}
          value={summary.lowStockProducts}
          tone={summary.lowStockProducts > 0 ? 'warning' : 'default'}
        />
      </div>

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
    </div>
  );
}

function KpiCard({ icon: Icon, label, value, tone = 'default' }) {
  return (
    <Card className="p-4">
      <div className="flex items-center gap-2 text-zinc-400">
        <Icon
          className={`h-4 w-4 ${tone === 'warning' ? 'text-amber-500' : 'text-brand-500'}`}
        />
        <span className="text-sm">{label}</span>
      </div>
      <div className="mt-2 text-2xl font-bold text-zinc-100">{value}</div>
    </Card>
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
