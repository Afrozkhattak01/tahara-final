'use client';

import { useEffect, useState } from 'react';

type Lang = 'en' | 'ar';

const T = {
  // nav
  nav_platform:    { en: 'Platform',    ar: 'المنصة' },
  nav_lifecycle:   { en: 'Lifecycle',   ar: 'دورة الحياة' },
  nav_architecture:{ en: 'Architecture', ar: 'البنية' },
  nav_resources:   { en: 'Resources',    ar: 'الموارد' },
  nav_faq:         { en: 'FAQ',          ar: 'الأسئلة الشائعة' },
  cta_demo:        { en: 'Request a demo', ar: 'اطلب عرضًا توضيحيًا' },
  // page content
  page_title:      { en: 'Resources', ar: 'الموارد' },
  page_desc:       { en: 'Add your content here — text, images, cards, anything you want.', ar: 'أضف محتواك هنا — نصوص، صور، بطاقات، أي شيء تريده.' },
  // footer
  footer_tagline:  { en: 'Safety, governance and transparency for the AI you actually run.', ar: 'السلامة والحوكمة والشفافية للذكاء الاصطناعي الذي تشغّلونه فعليًا.' },
  footer_copyright:{ en: '© 2026 Tahara AI. All rights reserved.', ar: '© 2026 Tahara AI. جميع الحقوق محفوظة.' },
  footer_motto:    { en: 'SAFE · ETHICAL · TRANSPARENT', ar: 'آمن · أخلاقي · شفّاف' },
};

function tr(key: keyof typeof T, lang: Lang) {
  return T[key][lang];
}

export default function ResourcesPage() {
  const [lang, setLang] = useState<Lang>('en');

  useEffect(() => {
    // Read saved language from localStorage (set by landing page toggle)
    try {
      const saved = localStorage.getItem('tahara-lang') as Lang;
      if (saved === 'ar' || saved === 'en') setLang(saved);
    } catch (_) {}

    // Listen for language changes from other tabs/pages
    const onStorage = (e: StorageEvent) => {
      if (e.key === 'tahara-lang' && (e.newValue === 'ar' || e.newValue === 'en')) {
        setLang(e.newValue as Lang);
      }
    };
    window.addEventListener('storage', onStorage);

    // Mobile nav toggle
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

  // Apply lang/dir to <html> so RTL CSS from landing.css works
  useEffect(() => {
    document.documentElement.setAttribute('lang', lang === 'ar' ? 'ar' : 'en');
    document.documentElement.setAttribute('dir', lang === 'ar' ? 'rtl' : 'ltr');
  }, [lang]);

  return (
    <>
      <style>{`
        footer { padding: 32px 0 18px !important; margin-top: 56px !important; }
        .foot-grid { gap: 24px !important; padding-bottom: 22px !important; }
        .foot-brand p { margin-top: 8px !important; }
        footer h5 { margin-bottom: 10px !important; }
        footer li { margin-bottom: 6px !important; }
        .foot-bottom { padding-top: 14px !important; }
      `}</style>
      {/* ══════════ navigation ══════════ */}
      <header id="siteHeader">
        <nav>
          <a href="/" className="brand">
            <span className="brand-mark" aria-hidden="true"></span>Tahara AI
          </a>
          <div className="nav-links" id="navLinks">
            <a href="/#platform" className="on has-mega">
              <span>{tr('nav_platform', lang)}</span>
              <svg className="chev" viewBox="0 0 10 10" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true">
                <path d="M1.6 3.4 5 6.8l3.4-3.4" />
              </svg>
            </a>
            <a href="/#lifecycle">{tr('nav_lifecycle', lang)}</a>
            <a href="/#stack">{tr('nav_architecture', lang)}</a>
            <a href="/resources" className="active">{tr('nav_resources', lang)}</a>
            <a href="/#faq">{tr('nav_faq', lang)}</a>
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
          <span className="prog" id="prog" aria-hidden="true"></span>
        </nav>
      </header>

      {/* ══════════ page content — edit freely below ══════════ */}
      <main style={{ minHeight: '60vh', padding: '120px 24px 80px' }}>
        <div className="wrap" style={{ maxWidth: 1160, margin: '0 auto' }}>
          <h1 style={{ fontSize: 42, fontWeight: 400, color: 'var(--g900)', marginBottom: 16 }}>
            {tr('page_title', lang)}
          </h1>
          <p style={{ fontSize: 18, color: 'var(--ink-2)', maxWidth: 600 }}>
            {tr('page_desc', lang)}
          </p>
        </div>
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
