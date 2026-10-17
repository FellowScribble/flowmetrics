import { motion, useReducedMotion } from 'framer-motion';
import Spinner from '../ui/Spinner';
import { useLanguage } from '../../i18n/useLanguage';

// Pantalla de espera mostrada cuando la conexión tarda más de lo habitual
// (p. ej. el backend gratuito de Render despertando tras estar inactivo).
export default function ConnectingScreen({ elapsedMs, deadlineMs }) {
  const { t } = useLanguage();
  const reduceMotion = useReducedMotion();

  const elapsedSeconds = Math.max(0, Math.floor(elapsedMs / 1000));
  // La barra estima el tiempo de espera consumido, no el progreso real del
  // servidor (que desconocemos). Nunca llega al 100 %: la conexión aún no ha
  // terminado.
  const estimatedPercent = Math.min(
    95,
    Math.max(2, Math.round((elapsedMs / deadlineMs) * 100)),
  );

  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-5 py-10">
      <motion.div
        role="status"
        aria-live="polite"
        aria-busy="true"
        initial={reduceMotion ? false : { opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: reduceMotion ? 0 : 0.4, ease: 'easeOut' }}
        className="w-full max-w-md rounded-2xl border border-brand-950/60 bg-zinc-950 p-6 shadow-2xl shadow-brand-950/30 sm:p-7"
      >
        <div className="flex items-center gap-3">
          <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-brand-950/60 bg-zinc-900 shadow-inner shadow-brand-950/20">
            <Spinner />
          </span>
          <h1 className="text-base font-semibold text-white sm:text-lg">
            {t('connection.connectingTitle')}
          </h1>
        </div>

        <p className="mt-4 text-sm leading-relaxed text-zinc-400">
          {t('connection.connectingMessage')}
        </p>

        <div className="mt-5">
          <div
            aria-hidden="true"
            className="h-1.5 w-full overflow-hidden rounded-full bg-zinc-900 ring-1 ring-inset ring-zinc-800"
          >
            <motion.div
              className="h-full rounded-full bg-gradient-to-r from-brand-900 via-brand-600 to-brand-400"
              initial={{ width: '0%' }}
              animate={{ width: `${estimatedPercent}%` }}
              transition={{ duration: reduceMotion ? 0 : 0.7, ease: 'easeOut' }}
            />
          </div>
          <div className="mt-2 flex flex-wrap items-center justify-between gap-x-3 gap-y-1 text-[11px]">
            <span className="text-zinc-500">{t('connection.progressNote')}</span>
            <span
              aria-hidden="true"
              className="shrink-0 font-mono text-zinc-400"
            >
              {t('connection.elapsed', { seconds: elapsedSeconds })}
            </span>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
