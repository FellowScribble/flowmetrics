import { useCallback, useMemo, useRef, useState } from 'react';
import { Plus, Pencil, Trash2, Users, Search } from 'lucide-react';
import { getCustomers, createCustomer, updateCustomer, deleteCustomer } from '../api/customers';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Card from '../components/ui/Card';
import Skeleton from '../components/ui/Skeleton';
import EmptyState from '../components/ui/EmptyState';
import ErrorState from '../components/ui/ErrorState';
import PageHeader from '../components/ui/PageHeader';
import Badge from '../components/ui/Badge';
import TableToolbar from '../components/ui/TableToolbar';
import Pagination from '../components/ui/Pagination';
import { useToast } from '../components/ui/toast/useToast';
import { useConfirm } from '../components/ui/confirm/useConfirm';
import { useAsyncData } from '../lib/useAsyncData';
import { isBlank, isEmail } from '../lib/validation';
import { cn } from '../lib/cn';
import { useLanguage } from '../i18n/useLanguage';

const PAGE_SIZE = 10;

const emptyForm = {
  name: '',
  email: '',
  phone: '',
  city: '',
  country: '',
  isActive: true,
};

function Customers() {
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

  const loadCustomers = useCallback(async () => getCustomers(), []);
  const { data, loading, error, hasData, refresh, refreshError, retry } =
    useAsyncData(loadCustomers);
  const customers = useMemo(() => data ?? [], [data]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return customers;
    return customers.filter((customer) =>
      [customer.name, customer.email, customer.city, customer.country]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(q)),
    );
  }, [customers, query]);

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
    if (isBlank(form.name)) errors.name = t('validation.required');
    if (!isBlank(form.email) && !isEmail(form.email)) errors.email = t('validation.email');
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
        await updateCustomer(editingId, form);
        toast.success(t('customers.toastUpdated'));
      } else {
        await createCustomer(form);
        toast.success(t('customers.toastCreated'));
      }
      resetForm();
      refresh();
    } catch {
      toast.error(t('customers.toastSaveError'));
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
    setFieldErrors({});
    scrollToForm();
  }

  async function handleDelete(customer) {
    const confirmed = await confirm({
      title: t('customers.confirmTitle'),
      message: t('customers.confirmMessage', { name: customer.name }),
      confirmLabel: t('customers.confirmLabel'),
      tone: 'danger',
    });
    if (!confirmed) return;

    try {
      await deleteCustomer(customer.id);
      toast.success(t('customers.toastDeleted'));
      refresh();
    } catch (deleteError) {
      if (deleteError.response?.status === 409) {
        toast.error(t('customers.toastDeleteConflict'));
      } else {
        toast.error(t('customers.toastDeleteError'));
      }
    }
  }

  if (loading) {
    return (
      <div>
        <Skeleton className="mb-6 h-8 w-40" />
        <Skeleton className="mb-6 h-40" />
        <Skeleton className="h-64" />
      </div>
    );
  }

  if (error && !hasData) return <ErrorState onRetry={retry} />;

  return (
    <div>
      <PageHeader
        title={t('customers.title')}
        description={t('customers.description')}
        actions={
          <Button onClick={handleNew}>
            <Plus className="h-4 w-4" />
            {t('customers.formNew')}
          </Button>
        }
      />

      {refreshError && (
        <ErrorState variant="inline" className="mb-6" onRetry={refresh} />
      )}

      <Card className="mb-6 p-5">
        <h2 className="mb-4 text-sm font-semibold text-zinc-100">
          {editingId ? t('customers.formEdit') : t('customers.formNew')}
        </h2>
        <form
          ref={formRef}
          onSubmit={handleSubmit}
          className="grid grid-cols-1 gap-3 sm:grid-cols-2"
        >
          <Input
            name="name"
            label={t('customers.placeholderName')}
            placeholder={t('customers.placeholderName')}
            value={form.name}
            onChange={handleChange}
            error={fieldErrors.name}
          />
          <Input
            name="email"
            type="email"
            label={t('customers.placeholderEmail')}
            placeholder={t('customers.placeholderEmail')}
            value={form.email}
            onChange={handleChange}
            error={fieldErrors.email}
          />
          <Input
            name="phone"
            label={t('customers.placeholderPhone')}
            placeholder={t('customers.placeholderPhone')}
            value={form.phone}
            onChange={handleChange}
          />
          <Input
            name="city"
            label={t('customers.placeholderCity')}
            placeholder={t('customers.placeholderCity')}
            value={form.city}
            onChange={handleChange}
          />
          <Input
            name="country"
            label={t('customers.placeholderCountry')}
            placeholder={t('customers.placeholderCountry')}
            value={form.country}
            onChange={handleChange}
          />
          <label className="flex items-center gap-2 text-sm text-zinc-400 sm:self-end sm:pb-2">
            <input
              type="checkbox"
              name="isActive"
              checked={form.isActive}
              onChange={handleChange}
              className="h-4 w-4 rounded border-zinc-700 bg-zinc-900 text-brand-500 focus:ring-brand-500"
            />
            {t('customers.activeLabel')}
          </label>

          <div className="flex gap-2 sm:col-span-2">
            <Button type="submit" loading={saving}>
              <Plus className="h-4 w-4" />
              {editingId ? t('common.saveChanges') : t('customers.create')}
            </Button>
            {editingId && (
              <Button type="button" variant="secondary" onClick={resetForm}>
                {t('common.cancel')}
              </Button>
            )}
          </div>
        </form>
      </Card>

      {customers.length === 0 ? (
        <EmptyState
          icon={Users}
          title={t('customers.emptyTitle')}
          description={t('customers.emptyDescription')}
          action={
            <Button onClick={handleNew}>
              <Plus className="h-4 w-4" />
              {t('customers.formNew')}
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
                  <th className="px-4 py-3">{t('customers.colName')}</th>
                  <th className="px-4 py-3">{t('customers.colEmail')}</th>
                  <th className="px-4 py-3">{t('customers.colCity')}</th>
                  <th className="px-4 py-3">{t('customers.colCountry')}</th>
                  <th className="px-4 py-3">{t('customers.colStatus')}</th>
                  <th className="px-4 py-3 text-right">{t('customers.colActions')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800">
                {pageItems.map((customer) => (
                  <tr
                    key={customer.id}
                    className={cn(
                      'text-zinc-300 hover:bg-zinc-800/50',
                      editingId === customer.id && 'bg-brand-950/50',
                    )}
                  >
                    <td className="px-4 py-3 font-medium text-zinc-100">
                      {customer.name}
                    </td>
                    <td className="px-4 py-3">{customer.email || '—'}</td>
                    <td className="px-4 py-3">{customer.city || '—'}</td>
                    <td className="px-4 py-3">{customer.country || '—'}</td>
                    <td className="px-4 py-3">
                      <Badge tone={customer.isActive ? 'success' : 'neutral'}>
                        {customer.isActive
                          ? t('customers.statusActive')
                          : t('customers.statusInactive')}
                      </Badge>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex justify-end gap-1">
                        <button
                          type="button"
                          onClick={() => handleEdit(customer)}
                          aria-label={t('aria.editCustomer')}
                          className="rounded-md p-2 text-zinc-400 transition-colors hover:bg-zinc-100 hover:text-brand-400"
                        >
                          <Pencil className="h-4 w-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(customer)}
                          aria-label={t('aria.deleteCustomer')}
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

export default Customers;
