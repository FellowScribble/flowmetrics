import { useEffect, useState } from 'react';
import { getProducts, createProduct, updateProduct, deleteProduct } from '../api/products';
import { getCategories } from '../api/categories';

function Products() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState(null);

  const [form, setForm] = useState({
    categoryId: '',
    name: '',
    salePrice: '',
    costPrice: '',
    stock: '',
    minimumStock: '',
    isActive: true,
  });

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    setLoading(true);
    const [productsData, categoriesData] = await Promise.all([
      getProducts(),
      getCategories(),
    ]);
    setProducts(productsData);
    setCategories(categoriesData);
    setLoading(false);
  }

  function handleChange(e) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();

    const payload = {
      categoryId: Number(form.categoryId),
      name: form.name,
      salePrice: Number(form.salePrice),
      costPrice: Number(form.costPrice),
      stock: Number(form.stock),
      minimumStock: Number(form.minimumStock),
      isActive: form.isActive,
    };

    if (editingId) {
      await updateProduct(editingId, payload);
    } else {
      await createProduct(payload);
    }

    resetForm();
    loadData();
  }

  function resetForm() {
    setForm({
      categoryId: '',
      name: '',
      salePrice: '',
      costPrice: '',
      stock: '',
      minimumStock: '',
      isActive: true,
    });
    setEditingId(null);
  }

  function handleEdit(product) {
    setForm({
      categoryId: product.categoryId,
      name: product.name,
      salePrice: product.salePrice,
      costPrice: product.costPrice,
      stock: product.stock,
      minimumStock: product.minimumStock,
      isActive: product.isActive,
    });
    setEditingId(product.id);
  }

  async function handleDelete(id) {
    if (!confirm('¿Eliminar este producto?')) return;

    try {
      await deleteProduct(id);
      loadData();
    } catch (error) {
      if (error.response?.status === 409) {
        alert('No se puede eliminar: este producto está siendo usado en una o más ventas.');
      } else {
        alert('Ha ocurrido un error al eliminar el producto.');
      }
    }
  }

  if (loading) return <p>Cargando productos...</p>;

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Productos</h1>

      <form onSubmit={handleSubmit} className="mb-6 grid grid-cols-2 gap-2 max-w-md">
        <select name="categoryId" value={form.categoryId} onChange={handleChange} required>
          <option value="">-- Categoría --</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>

        <input name="name" placeholder="Nombre" value={form.name} onChange={handleChange} required />
        <input name="salePrice" type="number" step="0.01" placeholder="Precio venta" value={form.salePrice} onChange={handleChange} required />
        <input name="costPrice" type="number" step="0.01" placeholder="Precio coste" value={form.costPrice} onChange={handleChange} required />
        <input name="stock" type="number" placeholder="Stock" value={form.stock} onChange={handleChange} required />
        <input name="minimumStock" type="number" placeholder="Stock mínimo" value={form.minimumStock} onChange={handleChange} required />

        <button type="submit" className="col-span-2 bg-black text-white py-2 rounded">
          {editingId ? 'Guardar cambios' : 'Crear producto'}
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
            <th>Categoría</th>
            <th>Precio</th>
            <th>Stock</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {products.map((p) => (
            <tr key={p.id} className="border-b">
              <td className="py-2">{p.name}</td>
              <td>{categories.find((c) => c.id === p.categoryId)?.name ?? '—'}</td>
              <td>{p.salePrice} €</td>
              <td>{p.stock}</td>
              <td className="flex gap-2 py-2">
                <button onClick={() => handleEdit(p)} className="text-blue-600">Editar</button>
                <button onClick={() => handleDelete(p.id)} className="text-red-600">Eliminar</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default Products;