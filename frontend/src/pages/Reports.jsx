import { useEffect, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { getTopProducts, getSalesByMonth } from '../api/reports';

function Reports() {
  const [topProducts, setTopProducts] = useState([]);
  const [monthlySales, setMonthlySales] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      const [topProductsData, salesData] = await Promise.all([
        getTopProducts(),
        getSalesByMonth(),
      ]);
      setTopProducts(topProductsData);
      setMonthlySales(salesData);
      setLoading(false);
    }

    loadData();
  }, []);

  if (loading) return <p>Cargando informes...</p>;

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Informes</h1>

      <div className="mb-8">
        <h2 className="text-lg font-semibold mb-2">Ventas por mes</h2>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={monthlySales}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="total" fill="#000" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div>
        <h2 className="text-lg font-semibold mb-2">Productos más vendidos</h2>

        {topProducts.length === 0 ? (
          <p className="text-gray-500 text-sm">Todavía no hay ventas suficientes para mostrar este informe.</p>
        ) : (
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b">
                <th className="py-2">#</th>
                <th>Producto</th>
                <th>Unidades vendidas</th>
                <th>Ingresos generados</th>
              </tr>
            </thead>
            <tbody>
              {topProducts.map((p, index) => (
                <tr key={p.productName} className="border-b">
                  <td className="py-2">{index + 1}</td>
                  <td>{p.productName}</td>
                  <td>{p.totalQuantity}</td>
                  <td>{p.totalRevenue} €</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

export default Reports;