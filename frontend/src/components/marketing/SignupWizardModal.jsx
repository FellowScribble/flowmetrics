import { useEffect, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import {
  ArrowLeft,
  ArrowRight,
  Building2,
  Check,
  CheckCircle2,
  Loader2,
  Lock,
  Mail,
  ShieldCheck,
  Sparkles,
  User,
  X,
} from 'lucide-react';
import { cn } from '../../lib/cn';
import { useLanguage } from '../../i18n/useLanguage';

const INDUSTRIES = [
  { value: 'retail', labelKey: 'landing.wizardIndustryRetail' },
  { value: 'food', labelKey: 'landing.wizardIndustryFood' },
  { value: 'services', labelKey: 'landing.wizardIndustryServices' },
  { value: 'tech', labelKey: 'landing.wizardIndustryTech' },
  { value: 'other', labelKey: 'landing.wizardIndustryOther' },
];

const SIZES = [
  { value: '1', labelKey: 'landing.wizardSize1' },
  { value: '2-10', labelKey: 'landing.wizardSize2' },
  { value: '11-50', labelKey: 'landing.wizardSize3' },
  { value: '50+', labelKey: 'landing.wizardSize4' },
];

const PLANS = [
  {
    value: 'starter',
    nameKey: 'landing.planStarterName',
    price: '19 €',
    featureKeys: ['landing.planStarterFeature1', 'landing.planStarterFeature2'],
  },
  {
    value: 'pro',
    nameKey: 'landing.planProName',
    price: '49 €',
    recommended: true,
    featureKeys: [
      'landing.planProFeature1',
      'landing.planProFeature2',
      'landing.planProFeature3',
    ],
  },
  {
    value: 'enterprise',
    nameKey: 'landing.planEnterpriseName',
    price: '99 €',
    featureKeys: ['landing.planEnterpriseFeature1', 'landing.planEnterpriseFeature2'],
  },
];

const EMPTY_FORM = {
  name: '',
  email: '',
  password: '',
  company: '',
  industry: '',
  size: '',
  plan: 'pro',
};

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function passwordStrength(password) {
  if (password.length >= 12 && /\d/.test(password) && /[A-Z]/.test(password)) return 3;
  if (password.length >= 8) return 2;
  if (password.length > 0) return 1;
  return 0;
}

function Field({ icon: Icon, label, error, children }) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs font-medium text-zinc-300">{label}</span>
      <span className="relative block">
        {Icon && (
          <Icon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
        )}
        {children}
      </span>
      {error && <span className="mt-1 block text-[11px] text-red-400">{error}</span>}
    </label>
  );
}

const inputClass =
  'w-full rounded-lg border border-zinc-800 bg-zinc-900 py-2.5 pl-10 pr-3 text-sm text-white placeholder:text-zinc-500 transition-colors focus:border-brand-600 focus:outline-none';

export default function SignupWizardModal({ open, onClose, onEnterDemo }) {
  const { t } = useLanguage();
  const reduceMotion = useReducedMotion();
  const [step, setStep] = useState(1);
  const [status, setStatus] = useState('form');
  const [form, setForm] = useState(EMPTY_FORM);
  const [errors, setErrors] = useState({});
  const [wasOpen, setWasOpen] = useState(open);

  // Reinicia el asistente cada vez que el modal pasa de cerrado a abierto
  // (patrón de "ajustar estado cuando cambia una prop", sin efectos).
  if (open !== wasOpen) {
    setWasOpen(open);
    if (open) {
      setStep(1);
      setStatus('form');
      setForm(EMPTY_FORM);
      setErrors({});
    }
  }

  useEffect(() => {
    if (status !== 'loading') return undefined;
    const id = window.setTimeout(() => setStatus('success'), 1500);
    return () => window.clearTimeout(id);
  }, [status]);

  useEffect(() => {
    if (!open) return undefined;
    const onKeyDown = (event) => {
      if (event.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [open, onClose]);

  const update = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => ({ ...prev, [key]: undefined }));
  };

  const validateStep = () => {
    const next = {};
    if (step === 1) {
      if (!form.name.trim()) next.name = t('landing.errorRequired');
      if (!form.email.trim()) next.email = t('landing.errorRequired');
      else if (!EMAIL_RE.test(form.email)) next.email = t('landing.errorEmail');
      if (!form.password) next.password = t('landing.errorRequired');
      else if (form.password.length < 8) next.password = t('landing.errorPassword');
    }
    if (step === 2) {
      if (!form.company.trim()) next.company = t('landing.errorRequired');
      if (!form.industry) next.industry = t('landing.errorRequired');
      if (!form.size) next.size = t('landing.errorRequired');
    }
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const goNext = () => {
    if (!validateStep()) return;
    setStep((value) => Math.min(3, value + 1));
  };

  const goBack = () => setStep((value) => Math.max(1, value - 1));

  const submit = (event) => {
    event.preventDefault();
    if (step < 3) {
      goNext();
      return;
    }
    setStatus('loading');
  };

  const strength = passwordStrength(form.password);
  const strengthLabel = [
    '',
    t('landing.wizardPasswordWeak'),
    t('landing.wizardPasswordMedium'),
    t('landing.wizardPasswordStrong'),
  ][strength];
  const strengthColor = ['', 'bg-red-500', 'bg-amber-500', 'bg-emerald-500'][strength];
  const strengthWidth = ['0%', '33%', '66%', '100%'][strength];

  const stepLabels = [t('landing.wizardStep1'), t('landing.wizardStep2'), t('landing.wizardStep3')];
  const stepSubtitles = [
    t('landing.wizardSubtitle1'),
    t('landing.wizardSubtitle2'),
    t('landing.wizardSubtitle3'),
  ];

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
            aria-label={t('landing.modalTitle')}
            initial={reduceMotion ? false : { opacity: 0, scale: 0.96, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 10 }}
            transition={{ duration: reduceMotion ? 0 : 0.25, ease: [0.22, 1, 0.36, 1] }}
            className="relative w-full max-w-lg overflow-hidden rounded-2xl border border-brand-900/50 bg-zinc-950 shadow-2xl shadow-brand-950/40"
          >
            <button
              type="button"
              onClick={onClose}
              aria-label={t('aria.close')}
              className="absolute right-4 top-4 z-10 rounded-md p-1 text-zinc-400 transition-colors hover:bg-zinc-800 hover:text-white"
            >
              <X className="h-4 w-4" />
            </button>

            {status === 'success' ? (
              <div className="px-6 py-12 text-center sm:px-10">
                <motion.div
                  initial={reduceMotion ? false : { scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                  className="mx-auto flex h-14 w-14 items-center justify-center rounded-full border border-emerald-800/60 bg-emerald-950/50 text-emerald-400"
                >
                  <CheckCircle2 className="h-7 w-7" />
                </motion.div>
                <h3 className="mt-5 text-xl font-bold text-white">
                  {t('landing.wizardSuccessTitle')}
                </h3>
                <p className="mx-auto mt-2 max-w-sm text-sm leading-relaxed text-zinc-400">
                  {t('landing.wizardSuccessDescription')}
                </p>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={onEnterDemo}
                  className="mt-7 inline-flex w-full items-center justify-center gap-2 rounded-lg border border-brand-800/40 bg-gradient-to-r from-brand-600 to-brand-800 px-6 py-3 text-sm font-medium text-white shadow-lg shadow-brand-950/50 transition-colors hover:from-brand-500 hover:to-brand-700"
                >
                  {t('landing.wizardSuccessCta')}
                  <ArrowRight className="h-4 w-4" />
                </motion.button>
                <p className="mt-4 text-[11px] text-zinc-400">
                  {t('landing.wizardSimulatedNote')}
                </p>
              </div>
            ) : (
              <form onSubmit={submit} className="flex flex-col">
                <div className="border-b border-zinc-900 px-6 pb-5 pt-6 sm:px-8">
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-brand-900/40 bg-brand-950/30 px-2.5 py-0.5 text-[11px] font-medium text-brand-300">
                    <Sparkles className="h-3 w-3" />
                    {t('landing.modalEyebrow')}
                  </span>
                  <h3 className="mt-3 text-lg font-bold text-white">{t('landing.modalTitle')}</h3>
                  <p className="mt-1 text-xs text-zinc-400">{stepSubtitles[step - 1]}</p>

                  <div className="mt-5 flex items-center gap-2">
                    {stepLabels.map((label, index) => {
                      const stepNumber = index + 1;
                      const isDone = stepNumber < step;
                      const isActive = stepNumber === step;
                      return (
                        <div key={label} className="flex flex-1 items-center gap-2">
                          <div className="flex items-center gap-2">
                            <span
                              className={cn(
                                'flex h-6 w-6 items-center justify-center rounded-full text-[11px] font-semibold transition-colors',
                                isActive && 'bg-brand-600 text-white',
                                isDone && 'bg-emerald-600 text-white',
                                !isActive && !isDone && 'bg-zinc-800 text-zinc-400',
                              )}
                            >
                              {isDone ? <Check className="h-3 w-3" /> : stepNumber}
                            </span>
                            <span
                              className={cn(
                                'text-xs font-medium',
                                isActive ? 'text-zinc-100' : 'text-zinc-400',
                              )}
                            >
                              {label}
                            </span>
                          </div>
                          {stepNumber < stepLabels.length && (
                            <span
                              className={cn(
                                'h-px flex-1',
                                isDone ? 'bg-emerald-600' : 'bg-zinc-800',
                              )}
                            />
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="px-6 py-5 sm:px-8">
                  <AnimatePresence mode="wait" initial={false}>
                    <motion.div
                      key={step}
                      initial={reduceMotion ? false : { opacity: 0, x: 16 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={reduceMotion ? undefined : { opacity: 0, x: -16 }}
                      transition={{ duration: reduceMotion ? 0 : 0.2 }}
                      className="space-y-4"
                    >
                      {step === 1 && (
                        <>
                          <Field
                            icon={User}
                            label={t('landing.modalFullName')}
                            error={errors.name}
                          >
                            <input
                              type="text"
                              autoFocus
                              value={form.name}
                              onChange={(e) => update('name', e.target.value)}
                              placeholder={t('landing.modalFullNamePlaceholder')}
                              className={inputClass}
                            />
                          </Field>
                          <Field
                            icon={Mail}
                            label={t('landing.modalEmail')}
                            error={errors.email}
                          >
                            <input
                              type="email"
                              value={form.email}
                              onChange={(e) => update('email', e.target.value)}
                              placeholder={t('landing.modalEmailPlaceholder')}
                              className={inputClass}
                            />
                          </Field>
                          <Field
                            icon={Lock}
                            label={t('landing.modalPassword')}
                            error={errors.password}
                          >
                            <input
                              type="password"
                              value={form.password}
                              onChange={(e) => update('password', e.target.value)}
                              placeholder={t('landing.modalPasswordPlaceholder')}
                              className={inputClass}
                            />
                          </Field>
                          {form.password && (
                            <div>
                              <div className="h-1.5 w-full overflow-hidden rounded-full bg-zinc-800">
                                <div
                                  className={cn('h-full rounded-full transition-all', strengthColor)}
                                  style={{ width: strengthWidth }}
                                />
                              </div>
                              <p className="mt-1.5 text-[11px] text-zinc-400">
                                {t('landing.wizardPasswordHint')} ·{' '}
                                <span className="text-zinc-400">{strengthLabel}</span>
                              </p>
                            </div>
                          )}
                        </>
                      )}

                      {step === 2 && (
                        <>
                          <Field
                            icon={Building2}
                            label={t('landing.modalCompany')}
                            error={errors.company}
                          >
                            <input
                              type="text"
                              autoFocus
                              value={form.company}
                              onChange={(e) => update('company', e.target.value)}
                              placeholder={t('landing.modalCompanyPlaceholder')}
                              className={inputClass}
                            />
                          </Field>
                          <Field icon={Building2} label={t('landing.wizardIndustry')} error={errors.industry}>
                            <select
                              value={form.industry}
                              onChange={(e) => update('industry', e.target.value)}
                              className={cn(inputClass, 'appearance-none pr-8 text-zinc-300')}
                            >
                              <option value="">{t('landing.wizardIndustryPlaceholder')}</option>
                              {INDUSTRIES.map((option) => (
                                <option key={option.value} value={option.value}>
                                  {t(option.labelKey)}
                                </option>
                              ))}
                            </select>
                          </Field>
                          <Field label={t('landing.wizardSize')} error={errors.size}>
                            <div className="grid grid-cols-2 gap-2">
                              {SIZES.map((option) => (
                                <button
                                  key={option.value}
                                  type="button"
                                  onClick={() => update('size', option.value)}
                                  className={cn(
                                    'rounded-lg border px-3 py-2 text-xs font-medium transition-colors',
                                    form.size === option.value
                                      ? 'border-brand-600 bg-brand-950/60 text-brand-200'
                                      : 'border-zinc-800 bg-zinc-900 text-zinc-400 hover:border-zinc-700 hover:text-zinc-200',
                                  )}
                                >
                                  {t(option.labelKey)}
                                </button>
                              ))}
                            </div>
                          </Field>
                        </>
                      )}

                      {step === 3 && (
                        <>
                          <p className="text-xs text-zinc-400">{t('landing.wizardPlanSubtitle')}</p>
                          <div className="space-y-2.5">
                            {PLANS.map((plan) => {
                              const selected = form.plan === plan.value;
                              return (
                                <button
                                  key={plan.value}
                                  type="button"
                                  onClick={() => update('plan', plan.value)}
                                  className={cn(
                                    'flex w-full items-start gap-3 rounded-xl border p-3.5 text-left transition-colors',
                                    selected
                                      ? 'border-brand-600 bg-brand-950/40'
                                      : 'border-zinc-800 bg-zinc-900/60 hover:border-zinc-700',
                                  )}
                                >
                                  <span
                                    className={cn(
                                      'mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full border',
                                      selected
                                        ? 'border-brand-500 bg-brand-500'
                                        : 'border-zinc-600',
                                    )}
                                  >
                                    {selected && <Check className="h-2.5 w-2.5 text-white" />}
                                  </span>
                                  <span className="min-w-0 flex-1">
                                    <span className="flex items-center gap-2">
                                      <span className="text-sm font-semibold text-zinc-100">
                                        {t(plan.nameKey)}
                                      </span>
                                      {plan.recommended && (
                                        <span className="rounded-full bg-brand-950/70 px-2 py-0.5 text-[10px] font-medium text-brand-300">
                                          {t('landing.planProBadge')}
                                        </span>
                                      )}
                                      <span className="ml-auto text-sm font-semibold text-white">
                                        {plan.price}
                                        <span className="text-[11px] font-normal text-zinc-400">
                                          {t('landing.pricePerMonth')}
                                        </span>
                                      </span>
                                    </span>
                                    <span className="mt-1.5 flex flex-wrap gap-x-3 gap-y-1">
                                      {plan.featureKeys.map((featureKey) => (
                                        <span
                                          key={featureKey}
                                          className="flex items-center gap-1 text-[11px] text-zinc-400"
                                        >
                                          <Check className="h-3 w-3 text-emerald-500" />
                                          {t(featureKey)}
                                        </span>
                                      ))}
                                    </span>
                                  </span>
                                </button>
                              );
                            })}
                          </div>
                        </>
                      )}
                    </motion.div>
                  </AnimatePresence>
                </div>

                <div className="flex items-center justify-between gap-3 border-t border-zinc-900 px-6 py-4 sm:px-8">
                  {step > 1 ? (
                    <button
                      type="button"
                      onClick={goBack}
                      className="inline-flex items-center gap-1.5 rounded-lg border border-zinc-800 bg-zinc-900 px-3.5 py-2 text-xs font-medium text-zinc-300 transition-colors hover:bg-zinc-800"
                    >
                      <ArrowLeft className="h-3.5 w-3.5" />
                      {t('landing.wizardBack')}
                    </button>
                  ) : (
                    <span className="text-[11px] text-zinc-400">
                      {t('landing.wizardSteps', { step, total: 3 })}
                    </span>
                  )}

                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    type="submit"
                    disabled={status === 'loading'}
                    className="inline-flex items-center gap-2 rounded-lg border border-brand-800/40 bg-gradient-to-r from-brand-600 to-brand-800 px-4 py-2 text-xs font-medium text-white shadow-lg shadow-brand-950/50 transition-colors hover:from-brand-500 hover:to-brand-700 disabled:opacity-70"
                  >
                    {status === 'loading' ? (
                      <>
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        {t('landing.wizardCreating')}
                      </>
                    ) : (
                      <>
                        {step < 3 ? t('landing.wizardNext') : t('landing.wizardCreate')}
                        <ArrowRight className="h-3.5 w-3.5" />
                      </>
                    )}
                  </motion.button>
                </div>

                <p className="flex items-center justify-center gap-1.5 border-t border-zinc-900 bg-zinc-950/80 py-2.5 text-[11px] text-zinc-400">
                  <ShieldCheck className="h-3 w-3 text-brand-400" />
                  {t('landing.wizardSimulatedNote')}
                </p>
              </form>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
