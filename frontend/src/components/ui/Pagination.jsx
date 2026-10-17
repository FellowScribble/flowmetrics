import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '../../lib/cn';
import { useLanguage } from '../../i18n/useLanguage';

export default function Pagination({ page, pages, onChange, className }) {
  const { t } = useLanguage();

  if (pages <= 1) return null;

  return (
    <div
      className={cn(
        'flex items-center justify-between gap-3 border-t border-zinc-800 px-4 py-3 text-sm',
        className,
      )}
    >
      <button
        type="button"
        onClick={() => onChange(page - 1)}
        disabled={page <= 1}
        className="inline-flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-zinc-300 transition-colors hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-40"
      >
        <ChevronLeft className="h-4 w-4" aria-hidden="true" />
        {t('common.prevPage')}
      </button>
      <span className="text-xs text-zinc-400">{t('common.pageOf', { page, pages })}</span>
      <button
        type="button"
        onClick={() => onChange(page + 1)}
        disabled={page >= pages}
        className="inline-flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-zinc-300 transition-colors hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-40"
      >
        {t('common.nextPage')}
        <ChevronRight className="h-4 w-4" aria-hidden="true" />
      </button>
    </div>
  );
}
