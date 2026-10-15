import { AlertTriangle } from 'lucide-react';
import Button from './Button';
import { useLanguage } from '../../i18n/useLanguage';

export default function ErrorState({ title, description, onRetry }) {
  const { t } = useLanguage();

  return (
    <div className="flex flex-col items-center justify-center gap-3 rounded-card border border-red-900/60 bg-red-950/40 px-6 py-10 text-center">
      <AlertTriangle className="h-8 w-8 text-red-400" />
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
