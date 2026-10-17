import { Link } from 'react-router-dom';
import { ArrowLeft, Scale } from 'lucide-react';
import { useLanguage } from '../../i18n/useLanguage';

const SECTIONS = {
  privacy: {
    titleKey: 'legal.privacyTitle',
    introKey: 'legal.privacyIntro',
    blocks: [
      { titleKey: 'legal.privacyP1Title', bodyKey: 'legal.privacyP1Body' },
      { titleKey: 'legal.privacyP2Title', bodyKey: 'legal.privacyP2Body' },
      { titleKey: 'legal.privacyP3Title', bodyKey: 'legal.privacyP3Body' },
    ],
  },
  terms: {
    titleKey: 'legal.termsTitle',
    introKey: 'legal.termsIntro',
    blocks: [
      { titleKey: 'legal.termsP1Title', bodyKey: 'legal.termsP1Body' },
      { titleKey: 'legal.termsP2Title', bodyKey: 'legal.termsP2Body' },
      { titleKey: 'legal.termsP3Title', bodyKey: 'legal.termsP3Body' },
    ],
  },
  cookies: {
    titleKey: 'legal.cookiesTitle',
    introKey: 'legal.cookiesIntro',
    blocks: [
      { titleKey: 'legal.cookiesP1Title', bodyKey: 'legal.cookiesP1Body' },
      { titleKey: 'legal.cookiesP2Title', bodyKey: 'legal.cookiesP2Body' },
    ],
  },
};

export default function LegalPage({ type }) {
  const { t } = useLanguage();
  const section = SECTIONS[type] ?? SECTIONS.privacy;

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100">
      <header className="border-b border-zinc-900">
        <div className="mx-auto flex max-w-3xl items-center justify-between px-6 py-5">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-sm font-medium text-zinc-400 transition-colors hover:text-brand-300"
          >
            <ArrowLeft className="h-4 w-4" />
            {t('legal.backHome')}
          </Link>
          <span className="inline-flex items-center gap-2 text-sm font-semibold text-white">
            <Scale className="h-4 w-4 text-brand-400" />
            FlowMetrics
          </span>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-6 py-12 sm:py-16">
        <p className="text-xs font-semibold uppercase tracking-widest text-brand-400">
          {t('legal.updated')}
        </p>
        <h1 className="mt-3 text-3xl font-bold tracking-tight text-white sm:text-4xl">
          {t(section.titleKey)}
        </h1>
        <p className="mt-4 text-sm leading-relaxed text-zinc-400">{t(section.introKey)}</p>

        <div className="mt-10 space-y-8">
          {section.blocks.map((block) => (
            <section key={block.titleKey}>
              <h2 className="text-base font-semibold text-zinc-100">{t(block.titleKey)}</h2>
              <p className="mt-2 text-sm leading-relaxed text-zinc-400">{t(block.bodyKey)}</p>
            </section>
          ))}
        </div>

        <p className="mt-12 rounded-xl border border-zinc-900 bg-zinc-950 px-4 py-3 text-xs text-zinc-400">
          {t('legal.simulatedNote')}
        </p>
      </main>
    </div>
  );
}
