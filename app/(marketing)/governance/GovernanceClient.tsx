'use client';

import { useEffect, useState } from 'react';
import AmbientBg from '../AmbientBg';
import PageHero from '../../../components/PageHero';
import SiteHeader from '@/components/SiteHeader';

/**
 * Governance.
 *
 * Replaces the old app/platform/governance/page.jsx, which was plain JS with a
 * 578-line stylesheet of its own that re-declared the design tokens. This one
 * is TypeScript and reads the tokens from landing.css, like /about and
 * /resources — one place defines the palette.
 *
 * Hero only for now. Sections go below <main> as they are decided.
 */

type Lang = 'en' | 'ar';

const T = {

  /* hero */
  badge: { en: 'Now onboarding pilot teams', ar: 'نستقبل الآن فرق التجربة الأولى' },
  title: { en: 'Govern Every AI System Running In Your Company',
           ar: 'احكم كل نظام ذكاء اصطناعي يعمل في شركتك' },
  lead:  { en: 'Tahara AI discovers every AI system in your environment, checks it against the frameworks that actually apply, and produces the evidence to prove it — continuously, not once a year.',
           ar: 'يكتشف Tahara AI كل نظام ذكاء اصطناعي في بيئتك، ويفحصه وفق الأطر التي تنطبق فعليًا، وينتج الأدلة التي تثبت ذلك — بشكل مستمر، لا مرة واحدة في السنة.' },
  cta:   { en: 'Get a Demo', ar: 'احصل على عرض توضيحي' },

  footer_tagline:   { en: 'Safety, governance and transparency for the AI you actually run.', ar: 'السلامة والحوكمة والشفافية للذكاء الاصطناعي الذي تشغّلونه فعليًا.' },
  footer_copyright: { en: '© 2026 Tahara AI', ar: '© 2026 Tahara AI' },
  footer_motto:     { en: 'EVIDENCE, NOT ASSURANCES', ar: 'أدلة، لا وعود' },
} as const;

const tr = (key: keyof typeof T, lang: Lang) => T[key][lang];

export default function GovernancePage() {
  const [lang, setLang] = useState<Lang>('en');

  useEffect(() => {
    try {
      const saved = localStorage.getItem('tahara-lang') as Lang;
      if (saved === 'ar' || saved === 'en') setLang(saved);
    } catch (_) {}

    const onStorage = (e: StorageEvent) => {
      if (e.key === 'tahara-lang' && (e.newValue === 'ar' || e.newValue === 'en')) {
        setLang(e.newValue as Lang);
      }
    };
    window.addEventListener('storage', onStorage);

    const toggle = document.getElementById('navToggle');
    const links = document.getElementById('navLinks');
    let navHandler: (() => void) | undefined;
    if (toggle && links) {
      navHandler = () => {
        links.classList.toggle('open');
        toggle.setAttribute('aria-expanded', links.classList.contains('open') ? 'true' : 'false');
      };
      toggle.addEventListener('click', navHandler);
    }
    return () => {
      window.removeEventListener('storage', onStorage);
      if (toggle && navHandler) toggle.removeEventListener('click', navHandler);
    };
  }, []);

  useEffect(() => {
    const boot = () => (window as any).TaharaMega?.mount(lang);
    if ((window as any).TaharaMega) { boot(); return; }
    let s = document.getElementById('tahara-mega') as HTMLScriptElement | null;
    if (!s) {
      s = document.createElement('script');
      s.id = 'tahara-mega';
      s.src = '/tahara-mega.js';
      s.async = false;
      document.body.appendChild(s);
    }
    const el = s;
    el.addEventListener('load', boot);
    return () => el.removeEventListener('load', boot);
  }, [lang]);

  useEffect(() => {
    document.documentElement.setAttribute('lang', lang === 'ar' ? 'ar' : 'en');
    document.documentElement.setAttribute('dir', lang === 'ar' ? 'rtl' : 'ltr');
  }, [lang]);

  return (
    <>
      <AmbientBg />
      <SiteHeader lang={lang} />

      <main>
        <PageHero
          badge={tr('badge', lang)}
          title={tr('title', lang)}
          lead={tr('lead', lang)}
          cta={tr('cta', lang)}
          calLink="tahara-ai-xpf7u0/product-demo"
        />
      </main>

      {/* ══════════ footer ══════════ */}
      <footer>
        <div className="wrap">
          <div className="foot-grid">
            <div className="foot-brand">
              <div className="brand">
                <span className="brand-mark" aria-hidden="true"></span>Tahara AI
              </div>
              <p>{tr('footer_tagline', lang)}</p>
            </div>
            <div id="footCols"></div>
          </div>
          <div className="foot-bottom">
            <span>{tr('footer_copyright', lang)}</span>
            <span className="mono" style={{ fontSize: '11.5px', letterSpacing: '.08em' }}>
              {tr('footer_motto', lang)}
            </span>
          </div>
        </div>
      </footer>
    </>
  );
}
