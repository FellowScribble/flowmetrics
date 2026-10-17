import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { ArrowLeft, ArrowRight, Loader2, Lock, Mail, ShieldCheck, X } from 'lucide-react';
import { cn } from '../../lib/cn';
import { useLanguage } from '../../i18n/useLanguage';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const inputClass =
  'w-full rounded-lg border border-zinc-800 bg-zinc-900 py-2.5 pl-10 pr-3 text-sm text-white placeholder:text-zinc-600 transition-colors focus:border-brand-600 focus:outline-none';

export default function LoginModal({ open, onClose, onEnterDemo, onCreateAccount }) {
  const { t } = useLanguage();
  const reduceMotion = useReducedMotion();
  const [view, setView] = useState('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [wasOpen, setWasOpen] = useState(open);
  const timerRef = useRef(null);

  // Reinicia el formulario al abrir (patrón de "ajustar estado cuando cambia una prop").
  if (open !== wasOpen) {
    setWasOpen(open);
    if (open) {
      setView('login');
      setEmail('');
      setPassword('');
      setError('');
      setLoading(false);
    }
  }

  // Si el modal se cierra mientras se simula el acceso, se cancela el temporizador.
  useEffect(() => {
    if (!open && timerRef.current) {
      window.clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  }, [open]);

  useEffect(() => {
    if (!open) return undefined;
    const onKeyDown = (event) => {
      if (event.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [open, onClose]);

  const submitLogin = (event) => {
    event.preventDefault();
    setError('');
    if (!EMAIL_RE.test(email)) {
      setError(t('landing.errorEmail'));
      return;
    }
    if (password.length < 6) {
      setError(t('landing.errorPassword'));
      return;
    }
    setLoading(true);
    timerRef.current = window.setTimeout(() => {
      timerRef.current = null;
      setLoading(false);
      onEnterDemo();
    }, 1200);
  };

  const submitForgot = (event) => {
    event.preventDefault();
    if (!EMAIL_RE.test(email)) {
      setError(t('landing.errorEmail'));
      return;
    }
    setError('');
    setView('sent');
  };

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: reduceMotion ? 0 : 0.2 }}
            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            onClick={onClose}
            aria-hidden="true"
          />

          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label={t('landing.loginTitle')}
            initial={reduceMotion ? false : { opacity: 0, scale: 0.96, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 10 }}
            transition={{ duration: reduceMotion ? 0 : 0.25, ease: [0.22, 1, 0.36, 1] }}
            className="relative w-full max-w-md overflow-hidden rounded-2xl border border-purple-900/50 bg-zinc-950 shadow-2xl shadow-purple-950/40"
          >
            <button
              type="button"
              onClick={onClose}
              aria-label={t('aria.close')}
              className="absolute right-4 top-4 z-10 rounded-md p-1 text-zinc-400 transition-colors hover:bg-zinc-800 hover:text-white"
            >
              <X className="h-4 w-4" />
            </button>

            <AnimatePresence mode="wait" initial={false}>
              {view === 'sent' ? (
                <motion.div
                  key="sent"
                  initial={reduceMotion ? false : { opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={reduceMotion ? undefined : { opacity: 0, y: -8 }}
                  transition={{ duration: reduceMotion ? 0 : 0.2 }}
                  className="px-6 py-12 text-center sm:px-10"
                >
                  <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full border border-brand-800/60 bg-brand-950/50 text-brand-300">
                    <Mail className="h-6 w-6" />
                  </div>
                  <h3 className="mt-5 text-lg font-bold text-white">
                    {t('landing.loginForgotSentTitle')}
                  </h3>
                  <p className="mx-auto mt-2 max-w-xs text-sm leading-relaxed text-zinc-400">
                    {t('landing.loginForgotSentDescription')}
                  </p>
                  <button
                    type="button"
                    onClick={() => setView('login')}
                    className="mt-6 inline-flex items-center gap-1.5 text-xs font-medium text-brand-300 transition-colors hover:text-brand-200"
                  >
                    <ArrowLeft className="h-3.5 w-3.5" />
                    {t('landing.loginBack')}
                  </button>
                </motion.div>
              ) : view === 'forgot' ? (
                <motion.form
                  key="forgot"
                  onSubmit={submitForgot}
                  initial={reduceMotion ? false : { opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={reduceMotion ? undefined : { opacity: 0, y: -8 }}
                  transition={{ duration: reduceMotion ? 0 : 0.2 }}
                  className="px-6 py-6 sm:px-8"
                >
                  <h3 className="text-lg font-bold text-white">
                    {t('landing.loginForgotTitle')}
                  </h3>
                  <p className="mt-1 text-xs text-zinc-400">
                    {t('landing.loginForgotDescription')}
                  </p>
                  <div className="mt-5">
                    <span className="mb-1 block text-xs font-medium text-zinc-300">
                      {t('landing.modalEmail')}
                    </span>
                    <span className="relative block">
                      <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
                      <input
                        type="email"
                        autoFocus
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder={t('landing.modalEmailPlaceholder')}
                        className={inputClass}
                      />
                    </span>
                    {error && <span className="mt-1 block text-[11px] text-red-400">{error}</span>}
                  </div>
                  <button
                    type="submit"
                    className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-lg border border-purple-800/40 bg-gradient-to-r from-[#7e22ce] to-[#581c87] px-4 py-2.5 text-sm font-medium text-white shadow-lg shadow-purple-950/50 transition-colors hover:from-[#8b2fd4] hover:to-[#6b21a8]"
                  >
                    {t('landing.loginForgotSubmit')}
                    <ArrowRight className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setView('login')}
                    className="mt-4 inline-flex items-center gap-1.5 text-xs font-medium text-zinc-400 transition-colors hover:text-zinc-200"
                  >
                    <ArrowLeft className="h-3.5 w-3.5" />
                    {t('landing.loginBack')}
                  </button>
                </motion.form>
              ) : (
                <motion.form
                  key="login"
                  onSubmit={submitLogin}
                  initial={reduceMotion ? false : { opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={reduceMotion ? undefined : { opacity: 0, y: -8 }}
                  transition={{ duration: reduceMotion ? 0 : 0.2 }}
                  className="px-6 py-6 sm:px-8"
                >
                  <h3 className="text-lg font-bold text-white">{t('landing.loginTitle')}</h3>
                  <p className="mt-1 text-xs text-zinc-400">{t('landing.loginDescription')}</p>

                  <div className="mt-5 space-y-4">
                    <div>
                      <span className="mb-1 block text-xs font-medium text-zinc-300">
                        {t('landing.modalEmail')}
                      </span>
                      <span className="relative block">
                        <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
                        <input
                          type="email"
                          autoFocus
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder={t('landing.modalEmailPlaceholder')}
                          className={inputClass}
                        />
                      </span>
                    </div>
                    <div>
                      <span className="mb-1 block text-xs font-medium text-zinc-300">
                        {t('landing.modalPassword')}
                      </span>
                      <span className="relative block">
                        <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
                        <input
                          type="password"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          placeholder={t('landing.modalPasswordPlaceholder')}
                          className={inputClass}
                        />
                      </span>
                    </div>
                  </div>

                  {error && <p className="mt-2 text-[11px] text-red-400">{error}</p>}

                  <div className="mt-2 text-right">
                    <button
                      type="button"
                      onClick={() => {
                        setError('');
                        setView('forgot');
                      }}
                      className="text-xs font-medium text-brand-300 transition-colors hover:text-brand-200"
                    >
                      {t('landing.loginForgot')}
                    </button>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-lg border border-purple-800/40 bg-gradient-to-r from-[#7e22ce] to-[#581c87] px-4 py-2.5 text-sm font-medium text-white shadow-lg shadow-purple-950/50 transition-colors hover:from-[#8b2fd4] hover:to-[#6b21a8] disabled:opacity-70"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        {t('layout.preparing')}
                      </>
                    ) : (
                      t('landing.loginSubmit')
                    )}
                  </button>

                  <p className="mt-5 text-center text-xs text-zinc-400">
                    {t('landing.loginNoAccount')}{' '}
                    <button
                      type="button"
                      onClick={() => {
                        onClose();
                        onCreateAccount?.();
                      }}
                      className="font-medium text-brand-300 transition-colors hover:text-brand-200"
                    >
                      {t('landing.loginCreate')}
                    </button>
                  </p>
                </motion.form>
              )}
            </AnimatePresence>

            <p className="flex items-center justify-center gap-1.5 border-t border-zinc-900 bg-zinc-950/80 py-2.5 text-[11px] text-zinc-500">
              <ShieldCheck className={cn('h-3 w-3 text-purple-400')} />
              {t('landing.loginSimulatedBadge')}
            </p>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
