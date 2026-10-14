import { useCallback, useEffect, useMemo, useState } from 'react';
import { LanguageContext } from './LanguageContext';
import { DEFAULT_LANGUAGE, SUPPORTED_LANGUAGES, getByPath, translations } from './translations';

const STORAGE_KEY = 'flowmetrics.language';

const localeByLanguage = {
  es: 'es-ES',
  en: 'en-GB',
};

function readInitialLanguage() {
  if (typeof window === 'undefined') return DEFAULT_LANGUAGE;
  const stored = window.localStorage.getItem(STORAGE_KEY);
  return SUPPORTED_LANGUAGES.includes(stored) ? stored : DEFAULT_LANGUAGE;
}

function interpolate(template, params) {
  if (!params) return template;
  return template.replace(/\{\{(\w+)\}\}/g, (_, key) =>
    params[key] === undefined || params[key] === null ? '' : String(params[key]),
  );
}

export function LanguageProvider({ children }) {
  const [language, setLanguage] = useState(readInitialLanguage);

  useEffect(() => {
    if (typeof document !== 'undefined') {
      document.documentElement.lang = language;
    }
    window.localStorage.setItem(STORAGE_KEY, language);
  }, [language]);

  const t = useCallback(
    (key, params) => {
      const value = getByPath(translations[language], key);
      if (typeof value !== 'string') return key;
      return interpolate(value, params);
    },
    [language],
  );

  const tEnum = useCallback(
    (prefix, value) => {
      if (value === undefined || value === null || value === '') return '—';
      const resolved = getByPath(translations[language], `${prefix}.${value}`);
      return typeof resolved === 'string' ? resolved : value;
    },
    [language],
  );

  const toggleLanguage = useCallback(() => {
    setLanguage((previous) => (previous === 'es' ? 'en' : 'es'));
  }, []);

  const value = useMemo(
    () => ({
      language,
      locale: localeByLanguage[language] ?? localeByLanguage[DEFAULT_LANGUAGE],
      setLanguage,
      toggleLanguage,
      t,
      tEnum,
    }),
    [language, t, tEnum, toggleLanguage],
  );

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}
