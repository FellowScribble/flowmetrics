import { useCallback, useState } from 'react';
import { Plus, Pencil, Trash2, Tag } from 'lucide-react';
import { getCategories, createCategory, updateCategory, deleteCategory } from '../api/categories';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Card from '../components/ui/Card';
import Skeleton from '../components/ui/Skeleton';
import EmptyState from '../components/ui/EmptyState';
import ErrorState from '../components/ui/ErrorState';
import PageHeader from '../components/ui/PageHeader';
import { useToast } from '../components/ui/toast/useToast';
import { useConfirm } from '../components/ui/confirm/useConfirm';
import { useAsyncData } from '../lib/useAsyncData';
import { useLanguage } from '../i18n/useLanguage';

const emptyForm = { name: '', description: '' };

function Categories() {
  const [saving, setSaving] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyForm);

  const toast = useToast();
  const confirm = useConfirm();
  const { t } = useLanguage();

  const loadCategories = useCallback(async () => getCategories(), []);
  const { data: categories = [], loading, error, refresh, retry } =
    useAsyncData(loadCategories);

  function handleChange(event) {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setSaving(true);
    try {
      if (editingId) {
        await updateCategory(editingId, form);
        toast.success(t('categories.toastUpdated'));
      } else {
        await createCategory(form);
        toast.success(t('categories.toastCreated'));
      }
      resetForm();
      refresh();
    } catch {
      toast.error(t('categories.toastSaveError'));
    } finally {
      setSaving(false);
    }
  }

  function resetForm() {
    setForm(emptyForm);
    setEditingId(null);
  }

  function handleEdit(category) {
    setForm({ name: category.name, description: category.description ?? '' });
    setEditingId(category.id);
  }

  async function handleDelete(category) {
    const confirmed = await confirm({
      title: t('categories.confirmTitle'),
      message: t('categories.confirmMessage', { name: category.name }),
      confirmLabel: t('categories.confirmLabel'),
      tone: 'danger',
    });
    if (!confirmed) return;

    try {
      await deleteCategory(category.id);
      toast.success(t('categories.toastDeleted'));
      refresh();
    } catch (deleteError) {
      if (deleteError.response?.status === 409) {
        toast.error(t('categories.toastDeleteConflict'));
      } else {
        toast.error(t('categories.toastDeleteError'));
      }
    }
  }

  if (loading) {
    return (
      <div>
        <Skeleton className="mb-6 h-8 w-40" />
        <Skeleton className="mb-6 h-32" />
        <Skeleton className="h-56" />
      </div>
    );
  }

  if (error) return <ErrorState onRetry={retry} />;

  return (
    <div>
      <PageHeader title={t('categories.title')} description={t('categories.description')} />

      <Card className="mb-6 max-w-xl p-5">
        <h2 className="mb-4 text-sm font-semibold text-zinc-100">
          {editingId ? t('categories.formEdit') : t('categories.formNew')}
        </h2>
        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <Input
            name="name"
            placeholder={t('categories.placeholderName')}
            value={form.name}
            onChange={handleChange}
            required
          />
          <Input
            name="description"
            placeholder={t('categories.placeholderDescription')}
            value={form.description}
            onChange={handleChange}
          />
          <div className="flex gap-2">
            <Button type="submit" loading={saving}>
              <Plus className="h-4 w-4" />
              {editingId ? t('common.saveChanges') : t('categories.create')}
            </Button>
            {editingId && (
              <Button type="button" variant="secondary" onClick={resetForm}>
                {t('common.cancel')}
              </Button>
            )}
          </div>
        </form>
      </Card>

      {categories.length === 0 ? (
        <EmptyState
          icon={Tag}
          title={t('categories.emptyTitle')}
          description={t('categories.emptyDescription')}
        />
      ) : (
        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-zinc-800 bg-zinc-950/60 text-xs uppercase tracking-wide text-zinc-400">
                  <th className="px-4 py-3">{t('categories.colName')}</th>
                  <th className="px-4 py-3">{t('categories.colDescription')}</th>
                  <th className="px-4 py-3 text-right">{t('categories.colActions')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800">
                {categories.map((category) => (
                  <tr key={category.id} className="text-zinc-300 hover:bg-zinc-800/50">
                    <td className="px-4 py-3 font-medium text-zinc-100">
                      {category.name}
                    </td>
                    <td className="px-4 py-3">{category.description || '—'}</td>
                    <td className="px-4 py-3">
                      <div className="flex justify-end gap-1">
                        <button
                          type="button"
                          onClick={() => handleEdit(category)}
                          aria-label={t('aria.editCategory')}
                          className="rounded-md p-1.5 text-zinc-400 transition-colors hover:bg-zinc-100 hover:text-brand-400"
                        >
                          <Pencil className="h-4 w-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(category)}
                          aria-label={t('aria.deleteCategory')}
                          className="rounded-md p-1.5 text-zinc-400 transition-colors hover:bg-red-950/50 hover:text-red-400"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  );
}

export default Categories;
