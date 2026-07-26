'use client';

import { useLanguage } from '../LanguageProvider';

export function Ribbon() {
  const { t } = useLanguage();
  return (
    <div className="ribbon">
      <a href="#resources">
        <span className="tag">New</span>
        <span>{t('ribbon.text')}</span>
        <span className="arw" aria-hidden="true">→</span>
      </a>
    </div>
  );
}
