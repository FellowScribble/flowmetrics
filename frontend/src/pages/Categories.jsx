import { useCallback, useMemo, useRef, useState } from 'react';
import { Plus, Pencil, Trash2, Tag, Search } from 'lucide-react';
import { getCategories, createCategory, updateCategory, deleteCategory } from '../api/categories';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Card from '../components/ui/Card';
import Skeleton from '../components/ui/Skeleton';
import EmptyState from '../components/ui/EmptyState';
import ErrorState from '../components/ui/ErrorState';
import PageHeader from '../components/ui/PageHeader';
import TableToolbar from '../components/ui/TableToolbar';
import Pagination from '../components/ui/Pagination';
import { useToast } from '../components/ui/toast/useToast';
import { useConfirm } from '../components/ui/confirm/useConfirm';
import { useAsyncData } from '../lib/useAsyncData';
import { isBlank } from '../lib/validation';
import { cn } from '../lib/cn';
import { useLanguage } from '../i18n/useLanguage';

const PAGE_SIZE = 10;

const emptyForm = { name: '', description: '' };

function Categories() {
  const [saving, setSaving] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [fieldErrors, setFieldErrors] = useState({});
  const [query, setQuery] = useState('');
  const [page, setPage] = useState(1);
  const formRef = useRef(null);

  const toast = useToast();
  const confirm = useConfirm();
  const { t } = useLanguage();

  const loadCategories = useCallback(async () => getCategories(), []);
  const { data, loading, error, hasData, refresh, refreshError, retry } =
    useAsyncData(loadCategories);
  const categories = useMemo(() => data ?? [], [data]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return categories;
    return categories.filter((category) =>
      [category.name, category.description]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(q)),
    );
  }, [categories, query]);

  const pages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage = Math.min(page, pages);
  const pageItems = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  function scrollToForm() {
    formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  function handleChange(event) {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setFieldErrors((prev) => (prev[name] ? { ...prev, [name]: undefined } : prev));
  }

  function validate() {
    const errors = {};
    if (isBlank(form.name)) errors.name = t('validation.required');
    return errors;
  }

  async function handleSubmit(event) {
    event.preventDefault();

    const errors = validate();
    setFieldErrors(errors);
    if (Object.keys(errors).length > 0) {
      toast.error(t('validation.fixErrors'));
      return;
    }

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
    setFieldErrors({});
  }

  function handleNew() {
    resetForm();
    scrollToForm();
  }

  function handleEdit(category) {
    setForm({ name: category.name, description: category.description ?? '' });
    setEditingId(category.id);
    setFieldErrors({});
    scrollToForm();
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

  if (error && !hasData) return <ErrorState onRetry={retry} />;

  return (
    <div>
      <PageHeader
        title={t('categories.title')}
        description={t('categories.description')}
        actions={
          <Button onClick={handleNew}>
            <Plus className="h-4 w-4" />
            {t('categories.formNew')}
          </Button>
        }
      />

      {refreshError && (
        <ErrorState variant="inline" className="mb-6" onRetry={refresh} />
      )}

      <Card className="mb-6 max-w-xl p-5">
        <h2 className="mb-4 text-sm font-semibold text-zinc-100">
          {editingId ? t('categories.formEdit') : t('categories.formNew')}
        </h2>
        <form ref={formRef} onSubmit={handleSubmit} className="flex flex-col gap-3">
          <Input
            name="name"
            label={t('categories.placeholderName')}
            placeholder={t('categories.placeholderName')}
            value={form.name}
            onChange={handleChange}
            error={fieldErrors.name}
          />
          <Input
            name="description"
            label={t('categories.placeholderDescription')}
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
          action={
            <Button onClick={handleNew}>
              <Plus className="h-4 w-4" />
              {t('categories.formNew')}
            </Button>
          }
        />
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={Search}
          title={t('common.noResultsTitle')}
          description={t('common.noResultsDescription', { query: query.trim() })}
          action={
            <Button variant="secondary" onClick={() => setQuery('')}>
              {t('common.clearSearch')}
            </Button>
          }
        />
      ) : (
        <Card className="overflow-hidden">
          <div className="border-b border-zinc-800 p-4">
            <TableToolbar
              query={query}
              onQueryChange={setQuery}
              shown={pageItems.length}
              total={filtered.length}
            />
          </div>
          <div className="overflow-x-auto">
            <table className="demo-table w-full text-left text-sm">
              <thead>
                <tr className="border-b border-zinc-800 bg-zinc-950/60 text-xs uppercase tracking-wide text-zinc-400">
                  <th className="px-4 py-3">{t('categories.colName')}</th>
                  <th className="px-4 py-3">{t('categories.colDescription')}</th>
                  <th className="px-4 py-3 text-right">{t('categories.colActions')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800">
                {pageItems.map((category) => (
                  <tr
                    key={category.id}
                    className={cn(
                      'text-zinc-300 hover:bg-zinc-800/50',
                      editingId === category.id && 'bg-brand-950/50',
                    )}
                  >
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
                          className="rounded-md p-2 text-zinc-400 transition-colors hover:bg-zinc-100 hover:text-brand-400"
                        >
                          <Pencil className="h-4 w-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(category)}
                          aria-label={t('aria.deleteCategory')}
                          className="rounded-md p-2 text-zinc-400 transition-colors hover:bg-red-950/50 hover:text-red-400"
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
          <Pagination page={currentPage} pages={pages} onChange={setPage} />
        </Card>
      )}
    </div>
  );
}

export default Categories;
