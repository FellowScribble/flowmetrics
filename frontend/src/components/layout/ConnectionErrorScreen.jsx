import { AlertTriangle } from 'lucide-react';
import { motion, useReducedMotion } from 'framer-motion';
import Button from '../ui/Button';
import { useLanguage } from '../../i18n/useLanguage';

// Detalle técnico breve y seguro (código HTTP o código de Axios), sin trazas.
function describeError(error) {
  if (!error) return null;
  if (error.response?.status) return `HTTP ${error.response.status}`;
  if (error.code) return String(error.code);
  if (error.message) return String(error.message);
  return null;
}

// Estado de error recuperable: se mantiene el contexto y se ofrece un reintento
// manual sin recargar la página.
export default function ConnectionErrorScreen({ error, errorKind, onRetry }) {
  const { t } = useLanguage();
  const reduceMotion = useReducedMotion();
  const detail = describeError(error);
  const messageKey =
    errorKind === 'fatal' ? 'connection.failedMessageHttp' : 'connection.failedMessage';

  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-5 py-10">
      <motion.div
        role="alert"
        initial={reduceMotion ? false : { opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: reduceMotion ? 0 : 0.4, ease: 'easeOut' }}
        className="w-full max-w-md rounded-2xl border border-brand-950/60 bg-zinc-950 p-6 text-center shadow-2xl shadow-brand-950/30 sm:p-7"
      >
        <span className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-red-900/60 bg-red-950/40 text-red-400">
          <AlertTriangle className="h-5 w-5" aria-hidden="true" />
        </span>

        <h1 className="mt-4 text-base font-semibold text-white sm:text-lg">
          {t('connection.failedTitle')}
        </h1>
        <p className="mt-3 text-sm leading-relaxed text-zinc-400">{t(messageKey)}</p>
        <p className="mt-2 text-xs text-zinc-500">{t('connection.retryHint')}</p>

        {detail && (
          <p className="mt-3 break-all font-mono text-[11px] text-zinc-600">
            {t('connection.failedDetail', { detail })}
          </p>
        )}

        <Button onClick={onRetry} className="mt-5 w-full sm:w-auto">
          {t('common.retry')}
        </Button>
      </motion.div>
    </div>
  );
}
