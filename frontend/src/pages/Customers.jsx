import { useEffect, useState } from 'react';
import { getCustomers, createCustomer, updateCustomer, deleteCustomer } from '../api/customers';

function Customers() {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState(null);

  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    city: '',
    country: '',
    isActive: true,
  });

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    setLoading(true);
    const data = await getCustomers();
    setCustomers(data);
    setLoading(false);
  }

  function handleChange(e) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();

    try {
      if (editingId) {
        await updateCustomer(editingId, form);
      } else {
        await createCustomer(form);
      }
      resetForm();
      loadData();
    } catch (error) {
      alert('Ha ocurrido un error al guardar el cliente.');
    }
  }

  function resetForm() {
    setForm({ name: '', email: '', phone: '', city: '', country: '', isActive: true });
    setEditingId(null);
  }

  function handleEdit(customer) {
    setForm({
      name: customer.name,
      email: customer.email ?? '',
      phone: customer.phone ?? '',
      city: customer.city ?? '',
      country: customer.country ?? '',
      isActive: customer.isActive,
    });
    setEditingId(customer.id);
  }

  async function handleDelete(id) {
    if (!confirm('¿Eliminar este cliente?')) return;

    try {
      await deleteCustomer(id);
      loadData();
    } catch (error) {
      if (error.response?.status === 409) {
        alert('No se puede eliminar: este cliente tiene ventas asociadas.');
      } else {
        alert('Ha ocurrido un error al eliminar el cliente.');
      }
    }
  }

  if (loading) return <p>Cargando clientes...</p>;

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Clientes</h1>

      <form onSubmit={handleSubmit} className="mb-6 grid grid-cols-2 gap-2 max-w-md">
        <input name="name" placeholder="Nombre" value={form.name} onChange={handleChange} required />
        <input name="email" type="email" placeholder="Email" value={form.email} onChange={handleChange} />
        <input name="phone" placeholder="Teléfono" value={form.phone} onChange={handleChange} />
        <input name="city" placeholder="Ciudad" value={form.city} onChange={handleChange} />
        <input name="country" placeholder="País" value={form.country} onChange={handleChange} />

        <button type="submit" className="col-span-2 bg-black text-white py-2 rounded">
          {editingId ? 'Guardar cambios' : 'Crear cliente'}
        </button>

        {editingId && (
          <button type="button" onClick={resetForm} className="col-span-2 border py-2 rounded">
            Cancelar edición
          </button>
        )}
      </form>

      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="border-b">
            <th className="py-2">Nombre</th>
            <th>Email</th>
            <th>Ciudad</th>
            <th>País</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {customers.map((c) => (
            <tr key={c.id} className="border-b">
              <td className="py-2">{c.name}</td>
              <td>{c.email}</td>
              <td>{c.city}</td>
              <td>{c.country}</td>
              <td className="flex gap-2 py-2">
                <button onClick={() => handleEdit(c)} className="text-blue-600">Editar</button>
                <button onClick={() => handleDelete(c.id)} className="text-red-600">Eliminar</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default Customers;