'use client';

import { useEffect, useState } from 'react';
import AmbientBg from '../AmbientBg';
import PageHero from '../../../components/PageHero';

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
  nav_platform:     { en: 'Platform',      ar: 'المنصة' },
  nav_lifecycle:    { en: 'Lifecycle',     ar: 'دورة الحياة' },
  nav_architecture: { en: 'Architecture',  ar: 'البنية' },
  nav_resources:    { en: 'Resources',     ar: 'الموارد' },
  nav_faq:          { en: 'FAQ',           ar: 'الأسئلة الشائعة' },
  nav_about:        { en: 'About us',      ar: 'من نحن' },
  cta_demo:         { en: 'Request a demo', ar: 'اطلب عرضًا توضيحيًا' },

  /* platform menu demo panel — the columns come from tahara-mega.js */
  mega_demo_k:     { en: 'Guided demo', ar: 'عرض توضيحي موجَّه' },
  mega_demo_title: { en: 'See Tahara in action', ar: 'شاهد Tahara في العمل' },
  mega_demo_desc:  { en: 'A 30-minute walkthrough, tailored to your stack', ar: 'جولة مدتها 30 دقيقة، مصمَّمة خصيصًا لمنظومتكم' },
  mega_demo_walk:  { en: 'What we walk through', ar: 'ما الذي نستعرضه' },
  stage_assess:    { en: 'Assess',  ar: 'التقييم' },
  stage_govern:    { en: 'Govern',  ar: 'الحوكمة' },
  stage_test:      { en: 'Test',    ar: 'الاختبار' },
  stage_monitor:   { en: 'Monitor', ar: 'المراقبة' },

  /* hero */
  badge: { en: 'Now onboarding pilot teams', ar: 'نستقبل الآن فرق التجربة الأولى' },
  title: { en: 'Govern Every AI System Running In Your Company',
           ar: 'احكم كل نظام ذكاء اصطناعي يعمل في شركتك' },
  lead:  { en: 'Tahara AI discovers every AI system in your environment, checks it against the frameworks that actually apply, and produces the evidence to prove it — continuously, not once a year.',
           ar: 'يكتشف Tahara AI كل نظام ذكاء اصطناعي في بيئتك، ويفحصه وفق الأطر التي تنطبق فعليًا، وينتج الأدلة التي تثبت ذلك — بشكل مستمر، لا مرة واحدة في السنة.' },
  cta:   { en: 'Get a Demo', ar: 'احصل على عرض توضيحي' },

  footer_tagline:   { en: 'Assurance for AI systems.', ar: 'ضمان لأنظمة الذكاء الاصطناعي.' },
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
      {/* ══════════ navigation ══════════ */}
      <header id="siteHeader">
        <nav>
          <a href="/" className="brand">
            <span className="brand-mark" aria-hidden="true"></span>Tahara AI
          </a>
          <div className="nav-links" id="navLinks">
            <a
              href="/#platform"
              className="has-mega"
              id="megaBtn"
              role="button"
              aria-haspopup="true"
              aria-expanded="false"
              aria-controls="mega"
            >
              <span>{tr('nav_platform', lang)}</span>
              <svg className="chev" viewBox="0 0 10 10" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true">
                <path d="M1.6 3.4 5 6.8l3.4-3.4" />
              </svg>
            </a>
            <a href="/#lifecycle">{tr('nav_lifecycle', lang)}</a>
            <a href="/#stack">{tr('nav_architecture', lang)}</a>
            <a href="/resources">{tr('nav_resources', lang)}</a>
            <a href="/#faq">{tr('nav_faq', lang)}</a>
            <a href="/about">{tr('nav_about', lang)}</a>
          </div>
          <div className="nav-right">
            <button className="btn btn-solid" data-cal-link="tahara-ai-xpf7u0/product-demo">
              <span>{tr('cta_demo', lang)}</span>
            </button>
            <button className="nav-toggle" id="navToggle" aria-label="Open menu" aria-expanded="false">
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.6">
                <path d="M2 5h14M2 9h14M2 13h14" />
              </svg>
            </button>
          </div>
        </nav>

        {/* Platform mega-menu shell — tahara-mega.js fills and drives it.
            It has to sit INSIDE the header: .mega is position:absolute at
            top:100%, so its offset parent must be the sticky header. Left as a
            sibling it hung off the page box and opened at the foot of the
            document, which is why hovering Platform appeared to do nothing. */}
        <div className="mega" id="mega" role="region" aria-label="Platform menu">
          <div className="mega-card">
            <div className="mega-inner" id="megaInner">
              {/* columns injected before this panel */}
              <div className="mega-demo">
                <span className="demo-k">{tr('mega_demo_k', lang)}</span>
                <h4>{tr('mega_demo_title', lang)}</h4>
                <p>{tr('mega_demo_desc', lang)}</p>
                <span className="demo-walk-k">{tr('mega_demo_walk', lang)}</span>
                <ul className="demo-steps">
                  <li className="demo-step" style={{ ['--si' as string]: 0 } as React.CSSProperties}>
                    <span className="demo-dot"></span><span>{tr('stage_assess', lang)}</span>
                    <svg className="demo-si" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true">
                      <circle cx="8.5" cy="8.5" r="5" /><path d="M12.5 12.5 17 17" strokeLinecap="round" />
                    </svg>
                  </li>
                  <li className="demo-step" style={{ ['--si' as string]: 1 } as React.CSSProperties}>
                    <span className="demo-dot"></span><span>{tr('stage_govern', lang)}</span>
                    <svg className="demo-si" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true">
                      <path d="M10 2.5 4 5v4.6c0 3.4 2.4 5.8 6 6.4 3.6-.6 6-3 6-6.4V5z" strokeLinejoin="round" />
                    </svg>
                  </li>
                  <li className="demo-step" style={{ ['--si' as string]: 2 } as React.CSSProperties}>
                    <span className="demo-dot"></span><span>{tr('stage_test', lang)}</span>
                    <svg className="demo-si" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true">
                      <circle cx="10" cy="10" r="6.5" /><circle cx="10" cy="10" r="2.4" />
                    </svg>
                  </li>
                  <li className="demo-step" style={{ ['--si' as string]: 3 } as React.CSSProperties}>
                    <span className="demo-dot"></span><span>{tr('stage_monitor', lang)}</span>
                    <svg className="demo-si" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true">
                      <path d="M2 10h3l2.2-5 3 10 2.2-6 1.4 3H18" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </li>
                </ul>
                <a data-cal-link="tahara-ai-xpf7u0/product-demo" className="demo-btn">
                  <span>{tr('cta_demo', lang)}</span> <span className="arw" aria-hidden="true">→</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Fixed overlay, so this one stays outside the header. */}
      <div className="mega-scrim" id="megaScrim" aria-hidden="true"></div>

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
