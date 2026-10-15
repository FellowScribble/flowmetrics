import { useCallback, useMemo, useRef, useState } from 'react';
import { AlertCircle, CheckCircle2, Info, X } from 'lucide-react';
import { ToastContext } from './ToastContext';
import { cn } from '../../../lib/cn';
import { useLanguage } from '../../../i18n/useLanguage';

const toneStyles = {
  success: { icon: CheckCircle2, classes: 'border-emerald-900/60', iconClass: 'text-emerald-400' },
  error: { icon: AlertCircle, classes: 'border-red-900/60', iconClass: 'text-red-400' },
  info: { icon: Info, classes: 'border-zinc-700', iconClass: 'text-brand-400' },
};

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  const idRef = useRef(0);
  const { t } = useLanguage();

  const remove = useCallback((id) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  const push = useCallback(
    (message, tone = 'info') => {
      const id = ++idRef.current;
      setToasts((prev) => [...prev, { id, message, tone }]);
      setTimeout(() => remove(id), 4500);
    },
    [remove],
  );

  const value = useMemo(
    () => ({
      success: (message) => push(message, 'success'),
      error: (message) => push(message, 'error'),
      info: (message) => push(message, 'info'),
    }),
    [push],
  );

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="pointer-events-none fixed bottom-4 right-4 z-[60] flex w-full max-w-sm flex-col gap-2">
        {toasts.map((toast) => {
          const { icon: Icon, classes, iconClass } = toneStyles[toast.tone] ?? toneStyles.info;
          return (
            <div
              key={toast.id}
              role="status"
              className={cn(
                'pointer-events-auto flex items-start gap-2 rounded-lg border bg-zinc-900 px-4 py-3 shadow-lg',
                classes,
              )}
            >
              <Icon className={cn('mt-0.5 h-4 w-4 shrink-0', iconClass)} />
              <p className="flex-1 text-sm text-zinc-200">{toast.message}</p>
              <button
                type="button"
                onClick={() => remove(toast.id)}
                aria-label={t('aria.closeNotification')}
                className="text-zinc-500 transition-colors hover:text-zinc-300"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}
