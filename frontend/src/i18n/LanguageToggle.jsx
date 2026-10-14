import { useLanguage } from './useLanguage';
import { cn } from '../lib/cn';

const labels = { es: 'ES', en: 'EN' };

export default function LanguageToggle({ className }) {
  const { language, setLanguage } = useLanguage();

  return (
    <div
      role="group"
      aria-label="Idioma / Language"
      className={cn(
        'inline-flex items-center rounded-full border border-zinc-800 bg-zinc-900/70 p-0.5 text-xs font-semibold',
        className,
      )}
    >
      {['es', 'en'].map((code) => (
        <button
          key={code}
          type="button"
          onClick={() => setLanguage(code)}
          aria-pressed={language === code}
          className={cn(
            'rounded-full px-2.5 py-1 transition-colors',
            language === code
              ? 'bg-brand-600 text-white'
              : 'text-zinc-400 hover:text-zinc-100',
          )}
        >
          {labels[code]}
        </button>
      ))}
    </div>
  );
}
