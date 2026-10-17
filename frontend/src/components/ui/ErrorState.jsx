import { AlertTriangle } from 'lucide-react';
import Button from './Button';
import { cn } from '../../lib/cn';
import { useLanguage } from '../../i18n/useLanguage';

export default function ErrorState({
  title,
  description,
  onRetry,
  variant = 'block',
  className,
}) {
  const { t } = useLanguage();

  if (variant === 'inline') {
    return (
      <div
        role="alert"
        className={cn(
          'flex flex-wrap items-center gap-3 rounded-card border border-amber-900/60 bg-amber-950/40 px-4 py-2.5',
          className,
        )}
      >
        <AlertTriangle className="h-4 w-4 shrink-0 text-amber-400" aria-hidden="true" />
        <p className="flex-1 text-xs text-amber-300">
          {description ?? t('errorState.refreshFailed')}
        </p>
        {onRetry && (
          <Button variant="secondary" size="sm" onClick={onRetry}>
            {t('common.retry')}
          </Button>
        )}
      </div>
    );
  }

  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center gap-3 rounded-card border border-red-900/60 bg-red-950/40 px-6 py-10 text-center',
        className,
      )}
    >
      <AlertTriangle className="h-8 w-8 text-red-400" aria-hidden="true" />
      <p className="text-sm font-medium text-red-300">{title ?? t('errorState.title')}</p>
      <p className="max-w-sm text-xs text-red-400/80">
        {description ?? t('errorState.description')}
      </p>
      {onRetry && (
        <Button variant="secondary" size="sm" onClick={onRetry}>
          {t('common.retry')}
        </Button>
      )}
    </div>
  );
}
