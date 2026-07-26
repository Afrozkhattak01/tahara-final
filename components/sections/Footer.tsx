'use client';

import { useLanguage } from '../LanguageProvider';
import { FOOTER_LINKS, FOOTER_LINKS_AR } from '@/content/footer';

export function Footer() {
  const { t, lang } = useLanguage();
  const cols = lang === 'ar' ? FOOTER_LINKS_AR : FOOTER_LINKS;

  return (
    <footer>
      <div className="wrap">
        <div className="foot-grid">
          <div className="foot-brand">
            <div className="brand"><span className="brand-mark" aria-hidden="true" />Tahara AI</div>
            <p>{t('footer.tagline')}</p>
          </div>
          {cols.map(([heading, links]) => (
            <div key={heading}>
              <h5>{heading}</h5>
              <ul>{links.map(([label, href]) => <li key={label}><a href={href}>{label}</a></li>)}</ul>
            </div>
          ))}
        </div>
        <div className="foot-bottom">
          <span>{t('footer.copyright')}</span>
          <span className="mono" style={{ fontSize: 11.5, letterSpacing: '.08em' }}>{t('footer.motto')}</span>
        </div>
      </div>
    </footer>
  );
}
