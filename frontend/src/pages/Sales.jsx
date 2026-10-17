import { useCallback, useMemo, useRef, useState } from 'react';
import { Plus, Pencil, Trash2, ShoppingCart, X, Search } from 'lucide-react';
import { getSales, createSale, updateSale, deleteSale } from '../api/sales';
import { getCustomers } from '../api/customers';
import { getProducts } from '../api/products';
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
import { isBlank, isPositiveInteger } from '../lib/validation';
import { cn } from '../lib/cn';
import { useLanguage } from '../i18n/useLanguage';

const PAGE_SIZE = 10;

const emptyItem = { productId: '', quantity: 1 };

function Sales() {
  const [saving, setSaving] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [customerId, setCustomerId] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('CARD');
  const [paymentStatus, setPaymentStatus] = useState('PAID');
  const [status, setStatus] = useState('COMPLETED');
  const [items, setItems] = useState([emptyItem]);
  const [formError, setFormError] = useState(null);
  const [itemErrors, setItemErrors] = useState([]);
  const [query, setQuery] = useState('');
  const [page, setPage] = useState(1);
  const formRef = useRef(null);

  const toast = useToast();
  const confirm = useConfirm();
  const { t, tEnum } = useLanguage();
  const { currency, date, saleStatus } = useFormat();

  const loadSales = useCallback(async () => {
    const [sales, customers, products] = await Promise.all([
      getSales(),
      getCustomers(),
      getProducts(),
    ]);
    return { sales, customers, products };
  }, []);
  const { data, loading, error, hasData, refresh, refreshError, retry } =
    useAsyncData(loadSales);

  const products = useMemo(() => data?.products ?? [], [data]);
  const sales = useMemo(() => data?.sales ?? [], [data]);
  const customers = useMemo(() => data?.customers ?? [], [data]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return sales;
    return sales.filter((sale) => {
      const customerName =
        customers.find((customer) => customer.id === sale.customerId)?.name ?? '';
      const productNames = sale.items.map((item) => item.productName).join(' ');
      return [customerName, sale.status, productNames, String(sale.total)]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(q));
    });
  }, [sales, customers, query]);

  const pages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage = Math.min(page, pages);
  const pageItems = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  function scrollToForm() {
    formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  function handleItemChange(index, field, value) {
    setItems((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
    setItemErrors((prev) => {
      if (!prev[index]) return prev;
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: undefined };
      return updated;
    });
  }

  function addItemRow() {
    setItems((prev) => [...prev, emptyItem]);
  }

  function removeItemRow(index) {
    setItems((prev) => prev.filter((_, i) => i !== index));
    setItemErrors((prev) => prev.filter((_, i) => i !== index));
  }

  function calculateEstimatedTotal() {
    return items.reduce((sum, item) => {
      const product = products.find((p) => p.id === Number(item.productId));
      if (!product) return sum;
      return sum + product.salePrice * Number(item.quantity || 0);
    }, 0);
  }

  function validate() {
    const hasAnyItem = items.some((item) => !isBlank(item.productId));
    const errors = items.map((item) => {
      if (isBlank(item.productId)) {
        return hasAnyItem ? { productId: t('validation.select') } : {};
      }
      if (!isPositiveInteger(item.quantity)) {
        return { quantity: t('validation.quantity') };
      }
      return {};
    });
    return { hasAnyItem, errors };
  }

  async function handleSubmit(event) {
    event.preventDefault();

    const { hasAnyItem, errors } = validate();

    if (!hasAnyItem) {
      toast.error(t('sales.toastNoItems'));
      return;
    }

    const hasItemErrors = errors.some((entry) => entry.productId || entry.quantity);
    const customerError = isBlank(customerId) ? t('validation.select') : null;

    setFormError(customerError);
    setItemErrors(errors);

    if (customerError || hasItemErrors) {
      toast.error(t('validation.fixErrors'));
      return;
    }

    const payload = {
      customerId: Number(customerId),
      paymentMethod,
      paymentStatus,
      status,
      notes: null,
      items: items
        .filter((item) => item.productId)
        .map((item) => ({
          productId: Number(item.productId),
          quantity: Number(item.quantity),
        })),
    };

    setSaving(true);
    try {
      if (editingId) {
        await updateSale(editingId, payload);
        toast.success(t('sales.toastUpdated'));
      } else {
        await createSale(payload);
        toast.success(t('sales.toastCreated'));
      }
      resetForm();
      refresh();
    } catch (submitError) {
      if (submitError.response?.status === 400) {
        toast.error(submitError.response.data.error ?? t('sales.toastStockError'));
      } else if (submitError.response?.status === 404) {
        toast.error(t('sales.toastNotFound'));
      } else {
        toast.error(t('sales.toastSaveError'));
      }
    } finally {
      setSaving(false);
    }
  }

  function resetForm() {
    setCustomerId('');
    setPaymentMethod('CARD');
    setPaymentStatus('PAID');
    setStatus('COMPLETED');
    setItems([emptyItem]);
    setItemErrors([]);
    setFormError(null);
    setEditingId(null);
  }

  function handleNew() {
    resetForm();
    scrollToForm();
  }

  function handleEdit(sale) {
    setCustomerId(sale.customerId ?? '');
    setPaymentMethod(sale.paymentMethod ?? 'CARD');
    setPaymentStatus(sale.paymentStatus ?? 'PAID');
    setStatus(sale.status ?? 'COMPLETED');
    setItems(
      sale.items.length > 0
        ? sale.items.map((item) => ({
            productId: String(item.productId),
            quantity: item.quantity,
          }))
        : [emptyItem],
    );
    setItemErrors([]);
    setFormError(null);
    setEditingId(sale.id);
    scrollToForm();
  }

  async function handleDelete(sale) {
    const confirmed = await confirm({
      title: t('sales.confirmTitle'),
      message: t('sales.confirmMessage'),
      confirmLabel: t('sales.confirmLabel'),
      tone: 'danger',
    });
    if (!confirmed) return;

    try {
      await deleteSale(sale.id);
      toast.success(t('sales.toastDeleted'));
      refresh();
    } catch {
      toast.error(t('sales.toastDeleteError'));
    }
  }

  if (loading) {
    return (
      <div>
        <Skeleton className="mb-6 h-8 w-40" />
        <Skeleton className="mb-6 h-72" />
        <Skeleton className="h-64" />
      </div>
    );
  }

  if (error && !hasData) return <ErrorState onRetry={retry} />;

  return (
    <div>
      <PageHeader
        title={t('sales.title')}
        description={t('sales.description')}
        actions={
          <Button onClick={handleNew}>
            <Plus className="h-4 w-4" />
            {t('sales.formNew')}
          </Button>
        }
      />

      {refreshError && (
        <ErrorState variant="inline" className="mb-6" onRetry={refresh} />
      )}

      <Card className="mb-6 p-5">
        <h2 className="mb-4 text-sm font-semibold text-zinc-100">
          {editingId ? t('sales.formEdit') : t('sales.formNew')}
        </h2>
        <form ref={formRef} onSubmit={handleSubmit} className="flex flex-col gap-4">
          <Select
            label={t('sales.colCustomer')}
            value={customerId}
            onChange={(event) => {
              setCustomerId(event.target.value);
              setFormError(null);
            }}
            error={formError}
          >
            <option value="">{t('sales.selectCustomer')}</option>
            {customers.map((customer) => (
              <option key={customer.id} value={customer.id}>
                {customer.name}
              </option>
            ))}
          </Select>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <Select
              label={t('sales.paymentMethodLabel')}
              value={paymentMethod}
              onChange={(event) => setPaymentMethod(event.target.value)}
            >
              <option value="CARD">{tEnum('enums.paymentMethod', 'CARD')}</option>
              <option value="CASH">{tEnum('enums.paymentMethod', 'CASH')}</option>
              <option value="TRANSFER">{tEnum('enums.paymentMethod', 'TRANSFER')}</option>
            </Select>
            <Select
              label={t('sales.paymentStatusLabel')}
              value={paymentStatus}
              onChange={(event) => setPaymentStatus(event.target.value)}
            >
              <option value="PAID">{tEnum('enums.paymentStatus', 'PAID')}</option>
              <option value="PENDING">{tEnum('enums.paymentStatus', 'PENDING')}</option>
            </Select>
            <Select
              label={t('sales.statusLabel')}
              value={status}
              onChange={(event) => setStatus(event.target.value)}
            >
              <option value="COMPLETED">{tEnum('enums.saleStatus', 'COMPLETED')}</option>
              <option value="PENDING">{tEnum('enums.saleStatus', 'PENDING')}</option>
              <option value="CANCELLED">{tEnum('enums.saleStatus', 'CANCELLED')}</option>
            </Select>
          </div>

          <div className="flex flex-col gap-2">
            <span className="text-xs font-medium text-zinc-400">{t('sales.productsLabel')}</span>

            {items.map((item, index) => {
              const entry = itemErrors[index] ?? {};
              const rowMessage = entry.productId || entry.quantity;
              return (
                <div key={index} className="flex flex-col gap-1">
                  <div className="flex items-center gap-2">
                    <Select
                      value={item.productId}
                      onChange={(event) =>
                        handleItemChange(index, 'productId', event.target.value)
                      }
                      className="flex-1"
                      error={Boolean(entry.productId)}
                    >
                      <option value="">{t('sales.selectProduct')}</option>
                      {products.map((product) => (
                        <option key={product.id} value={product.id}>
                          {product.name} ({currency(product.salePrice)})
                        </option>
                      ))}
                    </Select>

                    <Input
                      type="number"
                      min="1"
                      value={item.quantity}
                      onChange={(event) =>
                        handleItemChange(index, 'quantity', event.target.value)
                      }
                      className="w-24"
                      error={Boolean(entry.quantity)}
                    />

                    {items.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeItemRow(index)}
                        aria-label={t('aria.removeProduct')}
                        className="rounded-md p-2 text-zinc-400 transition-colors hover:bg-red-950/50 hover:text-red-400"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                  {rowMessage && <p className="text-xs text-red-400">{rowMessage}</p>}
                </div>
              );
            })}

            <button
              type="button"
              onClick={addItemRow}
              className="flex items-center gap-1 self-start text-sm font-medium text-brand-400 hover:text-brand-300"
            >
              <Plus className="h-4 w-4" />
              {t('sales.addProduct')}
            </button>
          </div>

          <div className="text-sm font-medium text-zinc-100">
            {t('sales.estimatedTotal')} {currency(calculateEstimatedTotal())}
          </div>

          <div className="flex gap-2">
            <Button type="submit" loading={saving}>
              {editingId ? t('common.saveChanges') : t('sales.create')}
            </Button>
            {editingId && (
              <Button type="button" variant="secondary" onClick={resetForm}>
                {t('common.cancel')}
              </Button>
            )}
          </div>
        </form>
      </Card>

      {sales.length === 0 ? (
        <EmptyState
          icon={ShoppingCart}
          title={t('sales.emptyTitle')}
          description={t('sales.emptyDescription')}
          action={
            <Button onClick={handleNew}>
              <Plus className="h-4 w-4" />
              {t('sales.formNew')}
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
                  <th className="px-4 py-3">{t('sales.colDate')}</th>
                  <th className="px-4 py-3">{t('sales.colCustomer')}</th>
                  <th className="px-4 py-3">{t('sales.colTotal')}</th>
                  <th className="px-4 py-3">{t('sales.colStatus')}</th>
                  <th className="px-4 py-3">{t('sales.colProducts')}</th>
                  <th className="px-4 py-3 text-right">{t('sales.colActions')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800">
                {pageItems.map((sale) => {
                  const statusInfo = saleStatus(sale.status);
                  return (
                    <tr
                      key={sale.id}
                      className={cn(
                        'align-top text-zinc-300 hover:bg-zinc-800/50',
                        editingId === sale.id && 'bg-brand-950/50',
                      )}
                    >
                      <td className="whitespace-nowrap px-4 py-3">
                        {date(sale.saleDate)}
                      </td>
                      <td className="px-4 py-3">
                        {customers.find((customer) => customer.id === sale.customerId)
                          ?.name ?? '—'}
                      </td>
                      <td className="whitespace-nowrap px-4 py-3 font-medium text-zinc-100">
                        {currency(sale.total)}
                      </td>
                      <td className="px-4 py-3">
                        <Badge tone={statusInfo.tone}>{statusInfo.label}</Badge>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex flex-col gap-0.5 text-zinc-400">
                          {sale.items.map((item) => (
                            <span key={item.id}>
                              {item.quantity} × {item.productName}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex justify-end gap-1">
                          <button
                            type="button"
                            onClick={() => handleEdit(sale)}
                            aria-label={t('aria.editSale')}
                            className="rounded-md p-2 text-zinc-400 transition-colors hover:bg-zinc-800 hover:text-brand-400"
                          >
                            <Pencil className="h-4 w-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDelete(sale)}
                            aria-label={t('aria.deleteSale')}
                            className="rounded-md p-2 text-zinc-400 transition-colors hover:bg-red-950/50 hover:text-red-400"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <Pagination page={currentPage} pages={pages} onChange={setPage} />
        </Card>
      )}
    </div>
  );
}

export default Sales;
