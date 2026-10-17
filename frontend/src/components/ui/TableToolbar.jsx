import { Search } from 'lucide-react';
import { cn } from '../../lib/cn';
import { useLanguage } from '../../i18n/useLanguage';

export default function TableToolbar({ query, onQueryChange, shown, total, className }) {
  const { t } = useLanguage();

  return (
    <div
      className={cn(
        'flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between',
        className,
      )}
    >
      <div className="relative sm:max-w-xs sm:flex-1">
        <Search
          className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500"
          aria-hidden="true"
        />
        <input
          type="search"
          value={query}
          onChange={(event) => onQueryChange(event.target.value)}
          placeholder={t('common.searchPlaceholder')}
          aria-label={t('common.searchPlaceholder')}
          className="w-full rounded-lg border border-zinc-700 bg-zinc-950 py-2 pl-9 pr-3 text-sm text-zinc-100 placeholder:text-zinc-500 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20"
        />
      </div>
      <p className="text-xs text-zinc-500" aria-live="polite">
        {t('common.resultsCount', { shown, total })}
      </p>
    </div>
  );
}
