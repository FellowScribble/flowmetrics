import { useEffect, useRef } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { X } from 'lucide-react';
import { cn } from '../../lib/cn';
import { useLanguage } from '../../i18n/useLanguage';

export default function Modal({ open, onClose, title, children, footer, maxWidth = 'max-w-md' }) {
  const panelRef = useRef(null);
  const { t } = useLanguage();
  const reduceMotion = useReducedMotion();

  useEffect(() => {
    if (!open) return undefined;

    const onKeyDown = (event) => {
      if (event.key === 'Escape') onClose?.();
    };
    document.addEventListener('keydown', onKeyDown);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    panelRef.current?.focus();

    return () => {
      document.removeEventListener('keydown', onKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, [open, onClose]);

  const duration = reduceMotion ? 0 : 0.25;

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: reduceMotion ? 0 : 0.2 }}
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            onClick={onClose}
            aria-hidden="true"
          />
          <motion.div
            ref={panelRef}
            role="dialog"
            aria-modal="true"
            aria-label={title}
            tabIndex={-1}
            initial={reduceMotion ? false : { opacity: 0, scale: 0.96, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 8 }}
            transition={{ duration, ease: [0.22, 1, 0.36, 1] }}
            className={cn(
              'relative w-full rounded-card border border-zinc-800 bg-zinc-900 shadow-xl focus:outline-none',
              maxWidth,
            )}
          >
            <div className="flex items-start justify-between border-b border-zinc-800 px-5 py-4">
              <h2 className="text-base font-semibold text-zinc-100">{title}</h2>
              <button
                type="button"
                onClick={onClose}
                aria-label={t('aria.close')}
                className="rounded-md p-1 text-zinc-500 transition-colors hover:bg-zinc-800 hover:text-zinc-200"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="px-5 py-4 text-sm text-zinc-400">{children}</div>
            {footer && (
              <div className="flex justify-end gap-2 border-t border-zinc-800 px-5 py-3">
                {footer}
              </div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
