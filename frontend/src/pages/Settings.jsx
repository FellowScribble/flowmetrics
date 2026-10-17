import { useEffect, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import {
  Check,
  CheckCircle2,
  CreditCard,
  Loader2,
  Sparkles,
  User,
} from 'lucide-react';
import { useDemoSession } from '../context/useDemoSession';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import PageHeader from '../components/ui/PageHeader';
import EmptyState from '../components/ui/EmptyState';
import Modal from '../components/ui/Modal';
import { useToast } from '../components/ui/toast/useToast';
import { cn } from '../lib/cn';
import { useFormat } from '../lib/useFormat';
import { useLanguage } from '../i18n/useLanguage';

const USAGE = [
  { labelKey: 'settings.subscriptionUsageCustomers', used: 24, limit: 100 },
  { labelKey: 'settings.subscriptionUsageProducts', used: 58, limit: 200 },
  { labelKey: 'settings.subscriptionUsageStorage', used: 62, limit: 100 },
];

const PLAN_FEATURES = [
  'landing.planProFeature1',
  'landing.planProFeature2',
  'landing.planProFeature3',
  'landing.planProFeature4',
];

const UPGRADE_FEATURES = [
  'settings.upgradeFeature1',
  'settings.upgradeFeature2',
  'settings.upgradeFeature3',
  'settings.upgradeFeature4',
];

function Settings() {
  const { session } = useDemoSession();
  const { t } = useLanguage();
  const { dateTime } = useFormat();
  const toast = useToast();
  const reduceMotion = useReducedMotion();
  const [tab, setTab] = useState('account');
  const [upgradeOpen, setUpgradeOpen] = useState(false);
  const [upgrading, setUpgrading] = useState(false);
  const [upgraded, setUpgraded] = useState(false);

  useEffect(() => {
    if (!upgrading) return undefined;
    const id = window.setTimeout(() => {
      setUpgrading(false);
      setUpgraded(true);
    }, 1500);
    return () => window.clearTimeout(id);
  }, [upgrading]);

  const openUpgrade = () => {
    setUpgraded(false);
    setUpgrading(false);
    setUpgradeOpen(true);
  };

  const closeUpgrade = () => {
    setUpgradeOpen(false);
    if (upgraded) {
      toast.success(t('settings.upgradeSuccessTitle'));
      setUpgraded(false);
    }
  };

  if (!session) {
    return (
      <div>
        <PageHeader title={t('settings.title')} />
        <EmptyState
          title={t('settings.noSessionTitle')}
          description={t('settings.noSessionDescription')}
        />
      </div>
    );
  }

  const tabs = [
    { id: 'account', labelKey: 'settings.tabAccount', icon: User },
    { id: 'subscription', labelKey: 'settings.tabSubscription', icon: CreditCard },
  ];

  return (
    <div>
      <PageHeader title={t('settings.title')} description={t('settings.description')} />

      <div
        role="tablist"
        aria-label={t('settings.title')}
        className="mb-6 inline-flex gap-1 rounded-lg border border-zinc-800 bg-zinc-950 p-1"
      >
        {tabs.map(({ id, labelKey, icon: Icon }) => (
          <button
            key={id}
            type="button"
            role="tab"
            aria-selected={tab === id}
            onClick={() => setTab(id)}
            className={cn(
              'inline-flex items-center gap-2 rounded-md px-3.5 py-1.5 text-sm font-medium transition-colors',
              tab === id
                ? 'bg-brand-950 text-brand-200'
                : 'text-zinc-400 hover:text-zinc-100',
            )}
          >
            <Icon size={15} />
            {t(labelKey)}
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={tab}
          initial={reduceMotion ? false : { opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={reduceMotion ? undefined : { opacity: 0, y: -8 }}
          transition={{ duration: reduceMotion ? 0 : 0.2, ease: [0.22, 1, 0.36, 1] }}
        >
          {tab === 'account' ? (
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
              <div className="flex flex-col gap-6 lg:col-span-2">
                <Card className="p-5">
                  <h2 className="mb-4 text-lg font-semibold text-zinc-100">
                    {t('settings.sessionTitle')}
                  </h2>
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <InfoCard label={t('settings.infoCompany')} value={session.companyName} />
                    <InfoCard label={t('settings.infoId')} value={session.companyId} />
                    <InfoCard label={t('settings.infoExpires')} value={dateTime(session.expiresAt)} />
                    <InfoCard
                      label={t('settings.infoRemaining')}
                      value={<Remaining expiresAt={session.expiresAt} />}
                    />
                  </div>
                </Card>

                <Card className="p-5">
                  <h2 className="mb-4 text-lg font-semibold text-zinc-100">
                    {t('settings.tabAccount')}
                  </h2>
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <InfoCard
                      label={t('settings.accountEmailLabel')}
                      value={t('settings.accountEmailValue')}
                      note={t('settings.accountEmailNote')}
                    />
                    <InfoCard
                      label={t('settings.accountPasswordLabel')}
                      value={t('settings.accountPasswordValue')}
                      note={t('settings.accountPasswordNote')}
                    />
                  </div>
                </Card>

                <Card className="p-5">
                  <h2 className="mb-2 text-lg font-semibold text-zinc-100">
                    {t('settings.accountDangerTitle')}
                  </h2>
                  <p className="text-sm text-zinc-400">{t('settings.accountDangerText')}</p>
                </Card>
              </div>

              <Card className="h-fit border-brand-900/60 bg-brand-950/40 p-4 text-sm text-brand-300">
                <p className="mb-1 flex items-center gap-2 font-medium">
                  <CheckCircle2 className="h-4 w-4" />
                  {t('settings.demoModeTitle')}
                </p>
                <p className="text-brand-400">{t('settings.demoModeText')}</p>
              </Card>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
              <div className="flex flex-col gap-6 lg:col-span-2">
                <Card className="p-5">
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-2 text-sm text-zinc-400">
                        <CreditCard className="h-4 w-4 text-brand-400" />
                        {t('settings.subscriptionPlanLabel')}
                      </div>
                      <div className="mt-1 flex items-baseline gap-2">
                        <span className="text-3xl font-bold text-white">
                          {t('settings.subscriptionPlanPro')}
                        </span>
                        <span className="text-sm text-zinc-400">
                          {t('settings.subscriptionPrice')}
                          <span className="text-xs text-zinc-500">
                            {' '}
                            {t('settings.subscriptionCycle')}
                          </span>
                        </span>
                      </div>
                    </div>
                    <span className="rounded-full border border-purple-900/50 bg-purple-950/50 px-3 py-1 text-[11px] font-medium text-purple-300">
                      {t('settings.subscriptionPlanBadge')}
                    </span>
                  </div>

                  <div className="mt-5">
                    <InfoCard
                      label={t('settings.subscriptionRenewLabel')}
                      value={t('settings.subscriptionRenewValue')}
                    />
                  </div>

                  <ul className="mt-5 grid grid-cols-1 gap-2 sm:grid-cols-2">
                    {PLAN_FEATURES.map((featureKey) => (
                      <li key={featureKey} className="flex items-center gap-2 text-sm text-zinc-300">
                        <Check className="h-4 w-4 shrink-0 text-emerald-500" />
                        {t(featureKey)}
                      </li>
                    ))}
                  </ul>
                </Card>

                <Card className="p-5">
                  <h2 className="mb-4 text-lg font-semibold text-zinc-100">
                    {t('settings.subscriptionUsageTitle')}
                  </h2>
                  <div className="space-y-4">
                    {USAGE.map((item) => {
                      const percent = Math.round((item.used / item.limit) * 100);
                      return (
                        <div key={item.labelKey}>
                          <div className="mb-1.5 flex items-center justify-between text-sm">
                            <span className="text-zinc-300">{t(item.labelKey)}</span>
                            <span className="text-zinc-500">
                              {item.used} {t('settings.subscriptionUsageOf', { limit: item.limit })}
                            </span>
                          </div>
                          <div className="h-1.5 w-full overflow-hidden rounded-full bg-zinc-800">
                            <div
                              className="h-full rounded-full bg-gradient-to-r from-brand-700 to-brand-400"
                              style={{ width: `${percent}%` }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </Card>
              </div>

              <Card className="flex h-fit flex-col bg-gradient-to-b from-[#24113c] via-zinc-900 to-zinc-950 p-5">
                <span className="inline-flex w-fit items-center gap-1.5 rounded-full border border-purple-500/30 bg-purple-950/60 px-2.5 py-0.5 text-[11px] font-medium text-purple-200">
                  <Sparkles className="h-3 w-3" />
                  {t('settings.simulationBadge')}
                </span>
                <h3 className="mt-3 text-base font-semibold text-white">
                  {t('settings.subscriptionUpgradeTitle')}
                </h3>
                <p className="mt-2 text-sm text-zinc-400">{t('settings.subscriptionUpgradeText')}</p>
                <Button className="mt-4 w-full" onClick={openUpgrade}>
                  {t('settings.subscriptionUpgradeCta')}
                </Button>
              </Card>
            </div>
          )}
        </motion.div>
      </AnimatePresence>

      <Modal
        open={upgradeOpen}
        onClose={closeUpgrade}
        title={upgraded ? t('settings.upgradeSuccessTitle') : t('settings.upgradeTitle')}
        footer={
          upgraded ? (
            <Button onClick={closeUpgrade}>{t('settings.upgradeClose')}</Button>
          ) : (
            <>
              <Button variant="secondary" onClick={closeUpgrade} disabled={upgrading}>
                {t('common.cancel')}
              </Button>
              <Button onClick={() => setUpgrading(true)} loading={upgrading}>
                {upgrading ? t('settings.upgradeProcessing') : t('settings.upgradeCta')}
              </Button>
            </>
          )
        }
      >
        {upgraded ? (
          <p className="text-sm text-zinc-400">{t('settings.upgradeSuccessText')}</p>
        ) : (
          <div className="space-y-4">
            <p className="text-sm text-zinc-400">{t('settings.upgradeSubtitle')}</p>
            <ul className="space-y-2">
              {UPGRADE_FEATURES.map((featureKey) => (
                <li key={featureKey} className="flex items-center gap-2 text-sm text-zinc-300">
                  <Check className="h-4 w-4 shrink-0 text-emerald-500" />
                  {t(featureKey)}
                </li>
              ))}
            </ul>
            {upgrading && (
              <p className="flex items-center gap-2 text-xs text-zinc-500">
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                {t('settings.upgradeProcessing')}
              </p>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
}

function InfoCard({ label, value, note }) {
  return (
    <div className="rounded-lg border border-zinc-800 p-4">
      <div className="text-sm text-zinc-400">{label}</div>
      <div className="mt-0.5 break-all text-lg font-semibold text-zinc-100">{value}</div>
      {note && <div className="mt-1 text-[11px] text-zinc-500">{note}</div>}
    </div>
  );
}

function Remaining({ expiresAt }) {
  const { t } = useLanguage();
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);

  const ms = new Date(expiresAt).getTime() - now;
  if (Number.isNaN(ms)) return '—';
  if (ms <= 0) return t('settings.expired');

  const totalSeconds = Math.floor(ms / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  return t('settings.duration', { h: hours, m: pad(minutes), s: pad(seconds) });
}

function pad(value) {
  return String(value).padStart(2, '0');
}

export default Settings;
