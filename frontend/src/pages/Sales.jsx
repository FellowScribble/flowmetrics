import { useEffect, useState } from 'react';
import { getSales, createSale, deleteSale } from '../api/sales';
import { getCustomers } from '../api/customers';
import { getProducts } from '../api/products';

function Sales() {
  const [sales, setSales] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  const [customerId, setCustomerId] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('CARD');
  const [paymentStatus, setPaymentStatus] = useState('PAID');
  const [status, setStatus] = useState('COMPLETED');
  const [items, setItems] = useState([{ productId: '', quantity: 1 }]);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    setLoading(true);
    const [salesData, customersData, productsData] = await Promise.all([
      getSales(),
      getCustomers(),
      getProducts(),
    ]);
    setSales(salesData);
    setCustomers(customersData);
    setProducts(productsData);
    setLoading(false);
  }

  function handleItemChange(index, field, value) {
    setItems((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
  }

  function addItemRow() {
    setItems((prev) => [...prev, { productId: '', quantity: 1 }]);
  }

  function removeItemRow(index) {
    setItems((prev) => prev.filter((_, i) => i !== index));
  }

  function calculateEstimatedTotal() {
    return items.reduce((sum, item) => {
      const product = products.find((p) => p.id === Number(item.productId));
      if (!product) return sum;
      return sum + product.salePrice * Number(item.quantity || 0);
    }, 0);
  }

  async function handleSubmit(e) {
    e.preventDefault();

    const payload = {
      customerId: Number(customerId),
      paymentMethod,
      paymentStatus,
      status,
      notes: null,
      items: items
        .filter((i) => i.productId)
        .map((i) => ({
          productId: Number(i.productId),
          quantity: Number(i.quantity),
        })),
    };

    if (payload.items.length === 0) {
      alert('Añade al menos un producto a la venta.');
      return;
    }

    try {
      await createSale(payload);
      resetForm();
      loadData();
    } catch (error) {
      if (error.response?.status === 400) {
        alert(error.response.data.error ?? 'Stock insuficiente.');
      } else {
        alert('Ha ocurrido un error al registrar la venta.');
      }
    }
  }

  function resetForm() {
    setCustomerId('');
    setPaymentMethod('CARD');
    setPaymentStatus('PAID');
    setStatus('COMPLETED');
    setItems([{ productId: '', quantity: 1 }]);
  }

  async function handleDelete(id) {
    if (!confirm('¿Eliminar esta venta? El stock de los productos se restaurará.')) return;

    try {
      await deleteSale(id);
      loadData();
    } catch (error) {
      alert('Ha ocurrido un error al eliminar la venta.');
    }
  }

  if (loading) return <p>Cargando ventas...</p>;

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Ventas</h1>

      <form onSubmit={handleSubmit} className="mb-6 max-w-lg flex flex-col gap-3">
        <select value={customerId} onChange={(e) => setCustomerId(e.target.value)} required>
          <option value="">-- Cliente --</option>
          {customers.map((c) => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>

        <div className="flex gap-2">
          <select value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value)}>
            <option value="CARD">Tarjeta</option>
            <option value="CASH">Efectivo</option>
            <option value="TRANSFER">Transferencia</option>
          </select>

          <select value={paymentStatus} onChange={(e) => setPaymentStatus(e.target.value)}>
            <option value="PAID">Pagado</option>
            <option value="PENDING">Pendiente</option>
          </select>

          <select value={status} onChange={(e) => setStatus(e.target.value)}>
            <option value="COMPLETED">Completada</option>
            <option value="PENDING">Pendiente</option>
            <option value="CANCELLED">Cancelada</option>
          </select>
        </div>

        <div className="flex flex-col gap-2">
          <span className="font-medium text-sm">Productos</span>

          {items.map((item, index) => (
            <div key={index} className="flex gap-2 items-center">
              <select
                value={item.productId}
                onChange={(e) => handleItemChange(index, 'productId', e.target.value)}
                className="flex-1"
                required
              >
                <option value="">-- Producto --</option>
                {products.map((p) => (
                  <option key={p.id} value={p.id}>{p.name} ({p.salePrice} €)</option>
                ))}
              </select>

              <input
                type="number"
                min="1"
                value={item.quantity}
                onChange={(e) => handleItemChange(index, 'quantity', e.target.value)}
                className="w-20"
                required
              />

              {items.length > 1 && (
                <button type="button" onClick={() => removeItemRow(index)} className="text-red-600">
                  ✕
                </button>
              )}
            </div>
          ))}

          <button type="button" onClick={addItemRow} className="text-sm text-blue-600 self-start">
            + Añadir producto
          </button>
        </div>

        <div className="font-medium">
          Total estimado: {calculateEstimatedTotal().toFixed(2)} €
        </div>

        <button type="submit" className="bg-black text-white py-2 rounded">
          Registrar venta
        </button>
      </form>

      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="border-b">
            <th className="py-2">Fecha</th>
            <th>Cliente</th>
            <th>Total</th>
            <th>Estado</th>
            <th>Productos</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {sales.map((s) => (
            <tr key={s.id} className="border-b align-top">
              <td className="py-2">{new Date(s.saleDate).toLocaleDateString()}</td>
              <td>{customers.find((c) => c.id === s.customerId)?.name ?? '—'}</td>
              <td>{s.total} €</td>
              <td>{s.status}</td>
              <td>
                {s.items.map((i) => (
                  <div key={i.id} className="text-sm">
                    {i.quantity} × {i.productName}
                  </div>
                ))}
              </td>
              <td className="py-2">
                <button onClick={() => handleDelete(s.id)} className="text-red-600">Eliminar</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default Sales;