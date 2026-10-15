import { useEffect, useState } from 'react';
import { CheckCircle2 } from 'lucide-react';
import { useDemoSession } from '../context/useDemoSession';
import Card from '../components/ui/Card';
import PageHeader from '../components/ui/PageHeader';
import EmptyState from '../components/ui/EmptyState';
import { useFormat } from '../lib/useFormat';
import { useLanguage } from '../i18n/useLanguage';

function Settings() {
  const { session } = useDemoSession();
  const { t } = useLanguage();
  const { dateTime } = useFormat();

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

  return (
    <div>
      <PageHeader title={t('settings.title')} description={t('settings.description')} />

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
            <h2 className="mb-2 text-lg font-semibold text-zinc-100">
              {t('settings.aboutTitle')}
            </h2>
            <p className="mb-4 text-sm text-zinc-400">{t('settings.aboutParagraph1')}</p>
            <p className="text-sm text-zinc-400">{t('settings.aboutParagraph2')}</p>
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
    </div>
  );
}

function InfoCard({ label, value }) {
  return (
    <div className="rounded-lg border border-zinc-800 p-4">
      <div className="text-sm text-zinc-400">{label}</div>
      <div className="mt-0.5 break-all text-lg font-semibold text-zinc-100">{value}</div>
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
