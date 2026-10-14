import { Link } from 'react-router-dom';
import Button from '../components/ui/Button';
import { useLanguage } from '../i18n/useLanguage';

export default function NotFound() {
  const { t } = useLanguage();

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 px-6 text-center">
      <p className="text-5xl font-bold text-brand-600">404</p>
      <h1 className="text-xl font-semibold text-zinc-100">{t('notFound.title')}</h1>
      <p className="max-w-sm text-sm text-zinc-400">{t('notFound.description')}</p>
      <Link to="/">
        <Button>{t('notFound.backHome')}</Button>
      </Link>
    </div>
  );
}
