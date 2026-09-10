import { useEffect, useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { getSummary, getSalesByMonth } from '../api/reports';
import { getActivity } from '../api/activity';

function Dashboard() {
  const [summary, setSummary] = useState(null);
  const [monthlySales, setMonthlySales] = useState([]);
  const [activity, setActivity] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      const [summaryData, salesData, activityData] = await Promise.all([
        getSummary(),
        getSalesByMonth(),
        getActivity(),
      ]);
      setSummary(summaryData);
      setMonthlySales(salesData);
      setActivity(activityData);
      setLoading(false);
    }

    loadData();
  }, []);

  if (loading) return <p>Cargando dashboard...</p>;

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Dashboard</h1>

      <div className="grid grid-cols-4 gap-4 mb-8">
        <KpiCard label="Ingresos totales" value={`${summary.totalRevenue} €`} />
        <KpiCard label="Ingresos este mes" value={`${summary.revenueThisMonth} €`} />
        <KpiCard label="Clientes activos" value={summary.activeCustomers} />
        <KpiCard label="Productos con stock bajo" value={summary.lowStockProducts} />
      </div>

      <div className="mb-8">
        <h2 className="text-lg font-semibold mb-2">Ventas por mes</h2>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={monthlySales}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis />
            <Tooltip />
            <Line type="monotone" dataKey="total" stroke="#000" strokeWidth={2} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div>
        <h2 className="text-lg font-semibold mb-2">Actividad reciente</h2>
        <ul className="flex flex-col gap-2">
          {activity.slice(0, 8).map((a) => (
            <li key={a.id} className="border-b pb-2 text-sm">
              <span className="font-medium">{a.title}</span>
              {a.description && <span className="text-gray-500"> — {a.description}</span>}
              <div className="text-xs text-gray-400">
                {new Date(a.createdAt).toLocaleString()}
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

function KpiCard({ label, value }) {
  return (
    <div className="border rounded-lg p-4">
      <div className="text-sm text-gray-500">{label}</div>
      <div className="text-2xl font-bold">{value}</div>
    </div>
  );
}

export default Dashboard;