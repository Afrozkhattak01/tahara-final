'use client';

import React from 'react';
import Link from 'next/link';

/**
 * The shared site header: brand, nav, the Platform mega-menu shell and the
 * fixed scrim behind it.
 *
 * This markup used to be copy-pasted into /about, /governance, /resources and
 * /resources/[slug] -- four near-identical copies differing only in which nav
 * link carried `.on` and whether the reading-progress bar was present. Any menu
 * change meant four edits, and they had already drifted: blog post pages had
 * silently lost the "About us" link.
 *
 * Only the shell lives here. tahara-mega.js fills in the mega-menu columns and
 * drives open/close; each page still owns its own `lang` state and mounts that
 * script, because the pages need `lang` for their own copy too.
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
  mega_demo_k:     { en: 'Guided demo', ar: 'عرض توضيحي موجَّه' },
  mega_demo_title: { en: 'See Tahara in action', ar: 'شاهد Tahara في العمل' },
  mega_demo_desc:  { en: 'A 30-minute walkthrough, tailored to your stack', ar: 'جولة مدتها 30 دقيقة، مصمَّمة خصيصًا لمنظومتكم' },
  mega_demo_walk:  { en: 'What we walk through', ar: 'ما الذي نستعرضه' },
  stage_assess:    { en: 'Assess',  ar: 'التقييم' },
  stage_govern:    { en: 'Govern',  ar: 'الحوكمة' },
  stage_test:      { en: 'Test',    ar: 'الاختبار' },
  stage_monitor:   { en: 'Monitor', ar: 'المراقبة' }
};

function tr(key: keyof typeof T, lang: Lang) {
  return T[key][lang];
}

export type SiteHeaderProps = {
  lang: Lang;
  /** Which nav link renders as the current page. */
  active?: 'resources' | 'about';
  /** Reading-progress bar -- the two /resources pages show it, others do not. */
  progress?: boolean;
};

export default function SiteHeader({ lang, active, progress = false }: SiteHeaderProps) {
  return (
    <>
      {/* navigation */}
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
            {/* These four point at the landing page, and they MUST stay plain
                <a> tags rather than <Link>. TaharaRuntime boots the vanilla
                engine once per document ("if (document.getElementById(
                'tahara-engine')) return"), so a client-side navigation to /
                would re-inject the markup without ever re-running the engine:
                no animations, no mega-menu, no language toggle. A full page
                load is what makes the landing page work. */}
            <a href="/#lifecycle">{tr('nav_lifecycle', lang)}</a>
            <a href="/#stack">{tr('nav_architecture', lang)}</a>
            <Link href="/resources" {...(active === 'resources' ? { className: 'on' } : {})}>{tr('nav_resources', lang)}</Link>
            <a href="/#faq">{tr('nav_faq', lang)}</a>
            <Link href="/about" {...(active === 'about' ? { className: 'on' } : {})}>{tr('nav_about', lang)}</Link>
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
          {progress ? <span className="prog" id="prog" aria-hidden="true"></span> : null}
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
    </>
  );
}
