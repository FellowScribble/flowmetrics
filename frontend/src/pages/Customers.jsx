import { useCallback, useState } from 'react';
import { Plus, Pencil, Trash2, Users } from 'lucide-react';
import { getCustomers, createCustomer, updateCustomer, deleteCustomer } from '../api/customers';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Card from '../components/ui/Card';
import Skeleton from '../components/ui/Skeleton';
import EmptyState from '../components/ui/EmptyState';
import ErrorState from '../components/ui/ErrorState';
import PageHeader from '../components/ui/PageHeader';
import Badge from '../components/ui/Badge';
import { useToast } from '../components/ui/toast/useToast';
import { useConfirm } from '../components/ui/confirm/useConfirm';
import { useAsyncData } from '../lib/useAsyncData';
import { useLanguage } from '../i18n/useLanguage';

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

  const toast = useToast();
  const confirm = useConfirm();
  const { t } = useLanguage();

  const loadCustomers = useCallback(async () => getCustomers(), []);
  const { data: customers = [], loading, error, refresh, retry } = useAsyncData(loadCustomers);

  function handleChange(event) {
    const { name, value, type, checked } = event.target;
    setForm((prev) => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
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

  if (error) return <ErrorState onRetry={retry} />;

  return (
    <div>
      <PageHeader title={t('customers.title')} description={t('customers.description')} />

      <Card className="mb-6 p-5">
        <h2 className="mb-4 text-sm font-semibold text-zinc-100">
          {editingId ? t('customers.formEdit') : t('customers.formNew')}
        </h2>
        <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <Input
            name="name"
            placeholder={t('customers.placeholderName')}
            value={form.name}
            onChange={handleChange}
            required
          />
          <Input
            name="email"
            type="email"
            placeholder={t('customers.placeholderEmail')}
            value={form.email}
            onChange={handleChange}
          />
          <Input
            name="phone"
            placeholder={t('customers.placeholderPhone')}
            value={form.phone}
            onChange={handleChange}
          />
          <Input
            name="city"
            placeholder={t('customers.placeholderCity')}
            value={form.city}
            onChange={handleChange}
          />
          <Input
            name="country"
            placeholder={t('customers.placeholderCountry')}
            value={form.country}
            onChange={handleChange}
          />
          <label className="flex items-center gap-2 text-sm text-zinc-400">
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
        />
      ) : (
        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
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
                {customers.map((customer) => (
                  <tr key={customer.id} className="text-zinc-300 hover:bg-zinc-800/50">
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
                          className="rounded-md p-1.5 text-zinc-400 transition-colors hover:bg-zinc-100 hover:text-brand-400"
                        >
                          <Pencil className="h-4 w-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(customer)}
                          aria-label={t('aria.deleteCustomer')}
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

export default Customers;
