import { useCallback, useMemo, useRef, useState } from 'react';
import { Plus, Pencil, Trash2, Package, Search } from 'lucide-react';
import { getProducts, createProduct, updateProduct, deleteProduct } from '../api/products';
import { getCategories } from '../api/categories';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Select from '../components/ui/Select';
import Card from '../components/ui/Card';
import Badge from '../components/ui/Badge';
import Skeleton from '../components/ui/Skeleton';
import EmptyState from '../components/ui/EmptyState';
import ErrorState from '../components/ui/ErrorState';
import PageHeader from '../components/ui/PageHeader';
import TableToolbar from '../components/ui/TableToolbar';
import Pagination from '../components/ui/Pagination';
import { useToast } from '../components/ui/toast/useToast';
import { useConfirm } from '../components/ui/confirm/useConfirm';
import { useAsyncData } from '../lib/useAsyncData';
import { useFormat } from '../lib/useFormat';
import {
  isBlank,
  isNonNegativeNumber,
  isNonNegativeInteger,
} from '../lib/validation';
import { cn } from '../lib/cn';
import { useLanguage } from '../i18n/useLanguage';

const PAGE_SIZE = 10;

const emptyForm = {
  categoryId: '',
  name: '',
  salePrice: '',
  costPrice: '',
  stock: '',
  minimumStock: '',
  isActive: true,
};

function Products() {
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
  const { currency } = useFormat();

  const loadProducts = useCallback(async () => {
    const [products, categories] = await Promise.all([getProducts(), getCategories()]);
    return { products, categories };
  }, []);
  const { data, loading, error, hasData, refresh, refreshError, retry } =
    useAsyncData(loadProducts);

  const products = useMemo(() => data?.products ?? [], [data]);
  const categories = useMemo(() => data?.categories ?? [], [data]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return products;
    return products.filter((product) => {
      const categoryName =
        categories.find((category) => category.id === product.categoryId)?.name ?? '';
      return [product.name, categoryName]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(q));
    });
  }, [products, categories, query]);

  const pages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage = Math.min(page, pages);
  const pageItems = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  function scrollToForm() {
    formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  function handleChange(event) {
    const { name, value, type, checked } = event.target;
    setForm((prev) => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
    setFieldErrors((prev) => (prev[name] ? { ...prev, [name]: undefined } : prev));
  }

  function validate() {
    const errors = {};
    if (isBlank(form.categoryId)) errors.categoryId = t('validation.select');
    if (isBlank(form.name)) errors.name = t('validation.required');
    if (!isNonNegativeNumber(form.salePrice)) errors.salePrice = t('validation.nonNegative');
    if (!isNonNegativeNumber(form.costPrice)) errors.costPrice = t('validation.nonNegative');
    if (!isNonNegativeInteger(form.stock)) errors.stock = t('validation.nonNegativeInteger');
    if (!isNonNegativeInteger(form.minimumStock))
      errors.minimumStock = t('validation.nonNegativeInteger');
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

    const payload = {
      categoryId: Number(form.categoryId),
      name: form.name,
      salePrice: Number(form.salePrice),
      costPrice: Number(form.costPrice),
      stock: Number(form.stock),
      minimumStock: Number(form.minimumStock),
      isActive: form.isActive,
    };

    try {
      if (editingId) {
        await updateProduct(editingId, payload);
        toast.success(t('products.toastUpdated'));
      } else {
        await createProduct(payload);
        toast.success(t('products.toastCreated'));
      }
      resetForm();
      refresh();
    } catch {
      toast.error(t('products.toastSaveError'));
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
    setFieldErrors({});
    scrollToForm();
  }

  async function handleDelete(product) {
    const confirmed = await confirm({
      title: t('products.confirmTitle'),
      message: t('products.confirmMessage', { name: product.name }),
      confirmLabel: t('products.confirmLabel'),
      tone: 'danger',
    });
    if (!confirmed) return;

    try {
      await deleteProduct(product.id);
      toast.success(t('products.toastDeleted'));
      refresh();
    } catch (deleteError) {
      if (deleteError.response?.status === 409) {
        toast.error(t('products.toastDeleteConflict'));
      } else {
        toast.error(t('products.toastDeleteError'));
      }
    }
  }

  if (loading) {
    return (
      <div>
        <Skeleton className="mb-6 h-8 w-40" />
        <Skeleton className="mb-6 h-56" />
        <Skeleton className="h-64" />
      </div>
    );
  }

  if (error && !hasData) return <ErrorState onRetry={retry} />;

  return (
    <div>
      <PageHeader
        title={t('products.title')}
        description={t('products.description')}
        actions={
          <Button onClick={handleNew}>
            <Plus className="h-4 w-4" />
            {t('products.formNew')}
          </Button>
        }
      />

      {refreshError && (
        <ErrorState variant="inline" className="mb-6" onRetry={refresh} />
      )}

      <Card className="mb-6 p-5">
        <h2 className="mb-4 text-sm font-semibold text-zinc-100">
          {editingId ? t('products.formEdit') : t('products.formNew')}
        </h2>
        <form
          ref={formRef}
          onSubmit={handleSubmit}
          className="grid grid-cols-1 gap-3 sm:grid-cols-2"
        >
          <Select
            name="categoryId"
            label={t('products.colCategory')}
            value={form.categoryId}
            onChange={handleChange}
            error={fieldErrors.categoryId}
          >
            <option value="">{t('products.selectCategory')}</option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </Select>
          <Input
            name="name"
            label={t('products.placeholderName')}
            placeholder={t('products.placeholderName')}
            value={form.name}
            onChange={handleChange}
            error={fieldErrors.name}
          />
          <Input
            name="salePrice"
            type="number"
            step="0.01"
            label={t('products.placeholderSalePrice')}
            placeholder={t('products.placeholderSalePrice')}
            value={form.salePrice}
            onChange={handleChange}
            error={fieldErrors.salePrice}
          />
          <Input
            name="costPrice"
            type="number"
            step="0.01"
            label={t('products.placeholderCostPrice')}
            placeholder={t('products.placeholderCostPrice')}
            value={form.costPrice}
            onChange={handleChange}
            error={fieldErrors.costPrice}
          />
          <Input
            name="stock"
            type="number"
            label={t('products.placeholderStock')}
            placeholder={t('products.placeholderStock')}
            value={form.stock}
            onChange={handleChange}
            error={fieldErrors.stock}
          />
          <Input
            name="minimumStock"
            type="number"
            label={t('products.placeholderMinimumStock')}
            placeholder={t('products.placeholderMinimumStock')}
            value={form.minimumStock}
            onChange={handleChange}
            error={fieldErrors.minimumStock}
          />
          <label className="flex items-center gap-2 text-sm text-zinc-400 sm:self-end sm:pb-2">
            <input
              type="checkbox"
              name="isActive"
              checked={form.isActive}
              onChange={handleChange}
              className="h-4 w-4 rounded border-zinc-700 bg-zinc-900 text-brand-500 focus:ring-brand-500"
            />
            {t('products.activeLabel')}
          </label>

          <div className="flex gap-2 sm:col-span-2">
            <Button type="submit" loading={saving}>
              <Plus className="h-4 w-4" />
              {editingId ? t('common.saveChanges') : t('products.create')}
            </Button>
            {editingId && (
              <Button type="button" variant="secondary" onClick={resetForm}>
                {t('common.cancel')}
              </Button>
            )}
          </div>
        </form>
      </Card>

      {products.length === 0 ? (
        <EmptyState
          icon={Package}
          title={t('products.emptyTitle')}
          description={t('products.emptyDescription')}
          action={
            <Button onClick={handleNew}>
              <Plus className="h-4 w-4" />
              {t('products.formNew')}
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
                  <th className="px-4 py-3">{t('products.colName')}</th>
                  <th className="px-4 py-3">{t('products.colCategory')}</th>
                  <th className="px-4 py-3">{t('products.colPrice')}</th>
                  <th className="px-4 py-3">{t('products.colStock')}</th>
                  <th className="px-4 py-3 text-right">{t('products.colActions')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800">
                {pageItems.map((product) => (
                  <tr
                    key={product.id}
                    className={cn(
                      'text-zinc-300 hover:bg-zinc-800/50',
                      editingId === product.id && 'bg-brand-950/50',
                    )}
                  >
                    <td className="px-4 py-3 font-medium text-zinc-100">
                      {product.name}
                    </td>
                    <td className="px-4 py-3">
                      {categories.find((category) => category.id === product.categoryId)
                        ?.name ?? '—'}
                    </td>
                    <td className="px-4 py-3">{currency(product.salePrice)}</td>
                    <td className="px-4 py-3">
                      <Badge
                        tone={
                          product.stock <= product.minimumStock ? 'warning' : 'neutral'
                        }
                      >
                        {t('products.units', { count: product.stock })}
                      </Badge>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex justify-end gap-1">
                        <button
                          type="button"
                          onClick={() => handleEdit(product)}
                          aria-label={t('aria.editProduct')}
                          className="rounded-md p-2 text-zinc-400 transition-colors hover:bg-zinc-800 hover:text-brand-400"
                        >
                          <Pencil className="h-4 w-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(product)}
                          aria-label={t('aria.deleteProduct')}
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

export default Products;
