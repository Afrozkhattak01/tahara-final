'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { getPost } from '../posts';

type Lang = 'en' | 'ar';

const T = {
  nav_platform:    { en: 'Platform',    ar: 'المنصة' },
  nav_lifecycle:   { en: 'Lifecycle',   ar: 'دورة الحياة' },
  nav_architecture:{ en: 'Architecture', ar: 'البنية' },
  nav_resources:   { en: 'Resources',    ar: 'الموارد' },
  nav_faq:         { en: 'FAQ',          ar: 'الأسئلة الشائعة' },
  cta_demo:        { en: 'Request a demo', ar: 'اطلب عرضًا توضيحيًا' },
  back_link:       { en: 'Back', ar: 'رجوع' },
  not_found_title: { en: 'Post not found', ar: 'المقال غير موجود' },
  not_found_desc:  { en: "This entry doesn't exist yet.", ar: 'هذا المقال غير موجود بعد.' },
  footer_tagline:  { en: 'Safety, governance and transparency for the AI you actually run.', ar: 'السلامة والحوكمة والشفافية للذكاء الاصطناعي الذي تشغّلونه فعليًا.' },
  footer_copyright:{ en: '© 2026 Tahara AI. All rights reserved.', ar: '© 2026 Tahara AI. جميع الحقوق محفوظة.' },
  footer_motto:    { en: 'SAFE · ETHICAL · TRANSPARENT', ar: 'آمن · أخلاقي · شفّاف' },
};

function tr(key: keyof typeof T, lang: Lang) {
  return T[key][lang];
}

export default function BlogPostPage() {
  const params = useParams<{ slug: string }>();
  const post = getPost(params.slug);
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

        main .wrap { padding-left: 48px; padding-right: 48px; }
        .post-wrap { max-width: 720px; }
        .post-back { display: inline-flex; align-items: center; gap: 7px; margin-bottom: 28px;
          font-family: var(--font-body); font-size: 13.5px; font-weight: 500; color: var(--ink-2);
          background: #fff; border: 1px solid var(--line-2); border-radius: 999px; padding: 9px 16px 9px 12px;
          box-shadow: var(--sh-s); transition: border-color .2s ease, color .2s ease, transform .3s var(--e-out); }
        .post-back svg { width: 14px; height: 14px; flex: none; transition: transform .3s var(--e-out); }
        .post-back:hover { color: var(--g900); border-color: var(--g600); transform: translateX(-2px); }
        .post-back:hover svg { transform: translateX(-2px); }
        .post-tag { display: inline-block; font-family: var(--font-mono); font-size: 9.5px;
          font-weight: 500; letter-spacing: .1em; text-transform: uppercase; color: var(--ink-2);
          background: var(--bg-2); padding: 4px 9px; border-radius: 6px; margin-bottom: 16px; }
        .post-title { margin: 0 0 14px; font-family: var(--font-body); font-weight: 700;
          letter-spacing: -.02em; font-size: clamp(26px, 3.6vw, 42px); line-height: 1.16;
          color: var(--g900); }
        .post-meta { font-size: 13.5px; color: var(--ink-3); margin-bottom: 26px; }
        .post-meta b { color: var(--ink); font-weight: 600; }
        .post-meta .sep { margin: 0 8px; }
        .post-quote { background: radial-gradient(ellipse 90% 130% at 0% 0%, #0b3472, var(--g900) 70%);
          color: #fff; border-radius: 16px; padding: 26px 28px; margin-bottom: 36px; }
        .post-quote p { font-size: 17px; font-weight: 600; line-height: 1.5; margin: 0; color: #fff; }
        .post-body h2 { font-family: var(--font-body); font-weight: 700; font-size: 19px;
          letter-spacing: -.01em; color: var(--ink); margin: 34px 0 14px; }
        .post-body p { font-size: 15.5px; line-height: 1.72; color: var(--ink-2); margin-bottom: 18px; }
        .post-body ul { margin: 0 0 18px; padding-left: 20px; }
        .post-body li { font-size: 15.5px; line-height: 1.6; color: var(--ink-2); margin-bottom: 8px;
          list-style: none; position: relative; padding-left: 4px; }
        .post-body li::before { content: '–'; position: absolute; left: -18px; color: var(--ink-3); }
      `}</style>

      <header id="siteHeader">
        <nav>
          <a href="/" className="brand">
            <span className="brand-mark" aria-hidden="true"></span>Tahara AI
          </a>
          <div className="nav-links" id="navLinks">
            <a href="/#platform" className="has-mega">
              <span>{tr('nav_platform', lang)}</span>
              <svg className="chev" viewBox="0 0 10 10" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true">
                <path d="M1.6 3.4 5 6.8l3.4-3.4" />
              </svg>
            </a>
            <a href="/#lifecycle">{tr('nav_lifecycle', lang)}</a>
            <a href="/#stack">{tr('nav_architecture', lang)}</a>
            <a href="/resources" className="on">{tr('nav_resources', lang)}</a>
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

      <main style={{ minHeight: '60vh', padding: '150px 0 80px' }}>
        <div className="wrap">
          <div className="post-wrap">
            <Link href="/resources" className="post-back">
              <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
                <path d="M13 8H3M7 4 3 8l4 4" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              {tr('back_link', lang)}
            </Link>

            {post ? (
              <>
                <span className="post-tag">{post.featured ? `Featured · ${post.tag}` : post.tag}</span>
                <h1 className="post-title">{post.title}</h1>
                <p className="post-meta">
                  <b>{post.author}</b>
                  <span className="sep">·</span>{post.readingTime}
                  <span className="sep">·</span>{post.date}
                </p>
                <div className="post-quote"><p>{post.excerpt}</p></div>
                <div className="post-body">
                  {post.content.map((block, i) => {
                    if (block.type === 'h2') return <h2 key={i}>{block.text}</h2>;
                    if (block.type === 'list') {
                      return (
                        <ul key={i}>
                          {block.items.map((item, j) => <li key={j}>{item}</li>)}
                        </ul>
                      );
                    }
                    return <p key={i}>{block.text}</p>;
                  })}
                </div>
              </>
            ) : (
              <>
                <h1 className="post-title">{tr('not_found_title', lang)}</h1>
                <p className="lede">{tr('not_found_desc', lang)}</p>
              </>
            )}
          </div>
        </div>
      </main>

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
