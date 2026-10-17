import { useCallback } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { RefreshCw } from 'lucide-react';
import { getTopProducts, getSalesByMonth } from '../api/reports';
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

function Reports() {
  const { t } = useLanguage();
  const { currency } = useFormat();

  const loadReports = useCallback(async () => {
    const [topProducts, monthlySales] = await Promise.all([
      getTopProducts(),
      getSalesByMonth(),
    ]);
    return { topProducts, monthlySales };
  }, []);

  const { data, loading, error, hasData, refresh, refreshError, retry } =
    useAsyncData(loadReports);

  if (loading) {
    return (
      <div>
        <Skeleton className="mb-6 h-8 w-40" />
        <Skeleton className="mb-8 h-80" />
        <Skeleton className="h-64" />
      </div>
    );
  }

  if (error && !hasData) return <ErrorState onRetry={retry} />;

  const { topProducts, monthlySales } = data;

  return (
    <div>
      <PageHeader
        title={t('reports.title')}
        description={t('reports.description')}
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

      <Card className="mb-8 p-5">
        <h2 className="mb-4 text-lg font-semibold text-zinc-100">
          {t('reports.salesByMonth')}
        </h2>
        {monthlySales.length === 0 ? (
          <EmptyState
            title={t('reports.salesEmptyTitle')}
            description={t('reports.salesEmptyDescription')}
          />
        ) : (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={monthlySales}>
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
              <Bar dataKey="total" fill={chartColor} radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </Card>

      <Card className="p-5">
        <h2 className="mb-4 text-lg font-semibold text-zinc-100">
          {t('reports.topProducts')}
        </h2>
        {topProducts.length === 0 ? (
          <EmptyState
            title={t('reports.topEmptyTitle')}
            description={t('reports.topEmptyDescription')}
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="demo-table w-full text-left text-sm">
              <thead>
                <tr className="border-b border-zinc-800 text-xs uppercase tracking-wide text-zinc-400">
                  <th className="py-2 pr-4">{t('reports.colRank')}</th>
                  <th className="py-2 pr-4">{t('reports.colProduct')}</th>
                  <th className="py-2 pr-4">{t('reports.colUnits')}</th>
                  <th className="py-2">{t('reports.colRevenue')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800">
                {topProducts.map((product, index) => (
                  <tr key={product.productName} className="text-zinc-300">
                    <td className="py-2 pr-4 text-zinc-400">{index + 1}</td>
                    <td className="py-2 pr-4 font-medium text-zinc-100">
                      {product.productName}
                    </td>
                    <td className="py-2 pr-4">{product.totalQuantity}</td>
                    <td className="py-2">{currency(product.totalRevenue)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}

export default Reports;
