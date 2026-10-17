import { Clock } from 'lucide-react';
import { motion, useReducedMotion } from 'framer-motion';
import Button from '../ui/Button';
import { useLanguage } from '../../i18n/useLanguage';

// Pantalla mostrada cuando el servidor confirma (401) que la sesión de demo ya
// no es válida. Ofrece reiniciar con una sesión nueva sin recargar la página.
export default function SessionExpiredScreen({ onRenew }) {
  const { t } = useLanguage();
  const reduceMotion = useReducedMotion();

  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-5 py-10">
      <motion.div
        role="alert"
        initial={reduceMotion ? false : { opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: reduceMotion ? 0 : 0.4, ease: 'easeOut' }}
        className="w-full max-w-md rounded-2xl border border-brand-950/60 bg-zinc-950 p-6 text-center shadow-2xl shadow-brand-950/30 sm:p-7"
      >
        <span className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-amber-900/60 bg-amber-950/40 text-amber-400">
          <Clock className="h-5 w-5" aria-hidden="true" />
        </span>

        <h1 className="mt-4 text-base font-semibold text-white sm:text-lg">
          {t('layout.sessionExpiredTitle')}
        </h1>
        <p className="mt-3 text-sm leading-relaxed text-zinc-400">
          {t('layout.sessionExpiredDescription')}
        </p>

        <Button onClick={onRenew} className="mt-5 w-full sm:w-auto">
          {t('layout.sessionExpiredAction')}
        </Button>
      </motion.div>
    </div>
  );
}
