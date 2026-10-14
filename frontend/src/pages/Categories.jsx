import { useEffect, useState } from 'react';
import { getCategories, createCategory, updateCategory, deleteCategory } from '../api/categories';

function Categories() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState(null);

  const [form, setForm] = useState({ name: '', description: '' });

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    setLoading(true);
    const data = await getCategories();
    setCategories(data);
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
        await updateCategory(editingId, form);
      } else {
        await createCategory(form);
      }
      resetForm();
      loadData();
    } catch {
      alert('Ha ocurrido un error al guardar la categoría.');
    }
  }

  function resetForm() {
    setForm({ name: '', description: '' });
    setEditingId(null);
  }

  function handleEdit(category) {
    setForm({ name: category.name, description: category.description ?? '' });
    setEditingId(category.id);
  }

  async function handleDelete(id) {
    if (!confirm('¿Eliminar esta categoría?')) return;

    try {
      await deleteCategory(id);
      loadData();
    } catch (error) {
      if (error.response?.status === 409) {
        alert('No se puede eliminar: hay productos usando esta categoría.');
      } else {
        alert('Ha ocurrido un error al eliminar la categoría.');
      }
    }
  }

  if (loading) return <p>Cargando categorías...</p>;

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Categorías</h1>

      <form onSubmit={handleSubmit} className="mb-6 flex flex-col gap-2 max-w-md">
        <input name="name" placeholder="Nombre" value={form.name} onChange={handleChange} required />
        <input name="description" placeholder="Descripción" value={form.description} onChange={handleChange} />

        <button type="submit" className="bg-black text-white py-2 rounded">
          {editingId ? 'Guardar cambios' : 'Crear categoría'}
        </button>

        {editingId && (
          <button type="button" onClick={resetForm} className="border py-2 rounded">
            Cancelar edición
          </button>
        )}
      </form>

      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="border-b">
            <th className="py-2">Nombre</th>
            <th>Descripción</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {categories.map((c) => (
            <tr key={c.id} className="border-b">
              <td className="py-2">{c.name}</td>
              <td>{c.description}</td>
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

export default Categories;