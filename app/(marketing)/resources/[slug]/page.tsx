'use client';

import { Fragment, useEffect, useState } from 'react';
import Link from 'next/link';
import AmbientBg from '../../AmbientBg';
import { useParams } from 'next/navigation';
import { getPost, type Rich } from '../posts';

type Lang = 'en' | 'ar';

const T = {
  nav_platform:    { en: 'Platform',    ar: 'المنصة' },
  nav_lifecycle:   { en: 'Lifecycle',   ar: 'دورة الحياة' },
  nav_architecture:{ en: 'Architecture', ar: 'البنية' },
  nav_resources:   { en: 'Resources',    ar: 'الموارد' },
  nav_faq:         { en: 'FAQ',          ar: 'الأسئلة الشائعة' },
  cta_demo:        { en: 'Request a demo', ar: 'اطلب عرضًا توضيحيًا' },
  back_link:       { en: 'All posts', ar: 'كل المقالات' },
  written_by:      { en: 'Written by', ar: 'بقلم' },
  author_role:     { en: 'Contributor', ar: 'مساهم' },
  not_found_title: { en: 'Post not found', ar: 'المقال غير موجود' },
  not_found_desc:  { en: "This entry doesn't exist yet.", ar: 'هذا المقال غير موجود بعد.' },
  footer_tagline:  { en: 'Safety, Governance and Transparency for the AI you actually run.', ar: 'السلامة والحوكمة والشفافية للذكاء الاصطناعي الذي تشغّلونه فعليًا.' },
  footer_copyright:{ en: '© 2026 Tahara AI. All rights reserved.', ar: '© 2026 Tahara AI. جميع الحقوق محفوظة.' },
  footer_motto:    { en: 'SAFE · ETHICAL · TRANSPARENT', ar: 'آمن · أخلاقي · شفّاف' },
};

function tr(key: keyof typeof T, lang: Lang) {
  return T[key][lang];
}

/**
 * Render a paragraph or list item. Plain strings pass straight through; an
 * array is a sequence of runs, any of which may be bold, italic or a link.
 * Links open in a new tab with rel="noopener" since they point off-site.
 */
function rich(text: Rich) {
  if (typeof text === 'string') return text;
  return text.map((part, i) => {
    if (typeof part === 'string') return <Fragment key={i}>{part}</Fragment>;
    if ('b' in part) return <strong key={i}>{part.b}</strong>;
    if ('i' in part) return <em key={i}>{part.i}</em>;
    return (
      <a key={i} href={part.href} target="_blank" rel="noopener noreferrer" className="post-link">
        {part.t}
      </a>
    );
  });
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
      <AmbientBg />
      <style>{`
        footer { padding: 32px 0 18px !important; margin-top: 56px !important; }
        .foot-grid { gap: 24px !important; padding-bottom: 22px !important; }
        .foot-brand p { margin-top: 8px !important; }
        footer h5 { margin-bottom: 10px !important; }
        footer li { margin-bottom: 6px !important; }
        .foot-bottom { padding-top: 14px !important; }

        main .wrap { padding-left: 48px; padding-right: 48px; }
        /* margin:0 auto is what centres the article. Without it the column
           sat against the left edge of the 1132px .wrap. */
        .post-wrap { max-width: 720px; margin: 0 auto; }
        /* Plain text and an arrow, no pill or border. */
        .post-back { display: inline-flex; align-items: center; gap: 9px; margin-bottom: 26px;
          font-size: 14.5px; font-weight: 500; color: var(--ink-2);
          transition: color .2s ease; }
        .post-back svg { width: 17px; height: 17px; flex: none; transition: transform .3s var(--e-out); }
        .post-back:hover { color: var(--g900); }
        .post-back:hover svg { transform: translateX(-3px); }
        [dir="rtl"] .post-back svg { transform: scaleX(-1); }
        [dir="rtl"] .post-back:hover svg { transform: scaleX(-1) translateX(-3px); }

        /* Category badge and date sit on one line above the headline. */
        .post-topline { display: flex; align-items: center; gap: 14px; flex-wrap: wrap;
          margin-bottom: 20px; }
        .post-tag { display: inline-block; font-family: var(--font-mono); font-size: 10px;
          font-weight: 500; letter-spacing: .1em; text-transform: uppercase; color: #fff;
          background: var(--g700); padding: 6px 11px; border-radius: 8px; }
        .post-date { display: inline-flex; align-items: center; gap: 7px;
          font-size: 13.5px; color: var(--ink-3); }
        .post-date svg { width: 15px; height: 15px; flex: none; }
        /* Headings are Libre Caslon here, as they are everywhere else on the
           site. This is the article's one headline: the banner below carries
           no text, so the title is never repeated on screen. */
        .post-title { margin: 0; font-family: var(--font-display); font-weight: 400;
          letter-spacing: -.018em; font-size: clamp(30px, 4.2vw, 46px); line-height: 1.16;
          color: var(--g900); }

        /* Byline: rule, "Written by", name and role, with the read time and
           date opposite. No avatar, as the posts carry no author images. */
        .post-byline { display: flex; align-items: center; justify-content: space-between;
          gap: 20px; flex-wrap: wrap;
          border-top: 1px solid var(--line); margin: 26px 0 32px; padding-top: 20px; }
        .post-byline-who { display: flex; flex-direction: column; gap: 1px; }
        .post-written { font-size: 12.5px; color: var(--ink-3); }
        .post-author { font-size: 15px; font-weight: 600; color: var(--ink); }
        .post-role { font-size: 12.5px; color: var(--ink-3); }
        .post-when { font-size: 13.5px; color: var(--ink-3); }

        /* The banner repeats the headline, as the reference does. It is marked
           aria-hidden so screen readers announce the title once, not twice. */
        .post-banner { position: relative; min-height: 300px; border-radius: 18px; overflow: hidden;
          margin-bottom: 34px; display: flex; align-items: center; justify-content: center;
          padding: 46px 42px; text-align: center;
          background: linear-gradient(135deg, #a9c7e8 0%, #4d86c9 30%, var(--g700) 62%, var(--g900) 100%);
          background-size: 180% 180%; animation: bannerDrift 8s ease-in-out infinite; }
        .post-banner-t { position: relative; z-index: 1; margin: 0;
          font-family: var(--font-display); font-weight: 400; letter-spacing: -.015em;
          font-size: clamp(22px, 2.9vw, 34px); line-height: 1.26; color: #fff;
          text-shadow: 0 1px 24px rgba(3,24,56,.35); }
        [dir="rtl"] .post-banner-t { font-family: 'IBM Plex Sans Arabic', var(--font-body);
          font-weight: 500; letter-spacing: -.02em; }
        .post-banner svg.motif { position: absolute; right: -30px; bottom: -30px; width: 220px; height: 220px;
          opacity: .16; stroke: #fff; fill: none; stroke-width: 1.4; }
        @keyframes bannerDrift {
          0%,100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }
        @media (prefers-reduced-motion: reduce) { .post-banner { animation: none; } }

        /* Opening paragraph: same words the card shows, set as a lede rather
           than boxed, so the article reads straight from banner into prose. */
        .post-lede { font-size: 19px; line-height: 1.65; color: var(--ink-2);
          margin: 0 0 38px; }

        .post-body h2 { font-family: var(--font-display); font-weight: 400; font-size: 27px;
          letter-spacing: -.01em; line-height: 1.28; color: var(--ink); margin: 52px 0 18px; }
        .post-body p { font-size: 17px; line-height: 1.75; color: var(--ink-2); margin-bottom: 22px; }
        .post-body strong { font-weight: 600; color: var(--ink); }
        .post-body em { font-style: italic; }
        .post-link { color: var(--g600); font-weight: 500;
          border-bottom: 1px solid rgba(17,64,134,.35); transition: color .2s, border-color .2s; }
        .post-link:hover { color: var(--g900); border-bottom-color: var(--g900); }
        .post-body ul { margin: 0 0 22px; padding-left: 22px; }
        .post-body li { font-size: 17px; line-height: 1.7; color: var(--ink-2); margin-bottom: 10px;
          list-style: none; position: relative; padding-left: 4px; }
        .post-body li::before { content: '–'; position: absolute; left: -18px; color: var(--ink-3); }

        /* Libre Caslon carries no Arabic glyphs, and a synthesised serif reads as
           a rendering fault, so Arabic headings fall back like the landing page's. */
        [dir="rtl"] .post-title,
        [dir="rtl"] .post-body h2 { font-family: 'IBM Plex Sans Arabic', var(--font-body);
          font-weight: 500; letter-spacing: -.02em; }
        [dir="rtl"] .post-body li { padding-left: 0; padding-right: 4px; }
        [dir="rtl"] .post-body li::before { left: auto; right: -18px; }
        [dir="rtl"] .post-body ul { padding-left: 0; padding-right: 22px; }
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

      <main style={{ minHeight: '60vh', padding: '120px 0 80px' }}>
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
                <div className="post-topline">
                  <span className="post-tag">{post.featured ? `Featured · ${post.tag}` : post.tag}</span>
                  <span className="post-date">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7"
                      strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <rect x="3.5" y="5" width="17" height="16" rx="2.2" />
                      <path d="M8 2.8v4.4M16 2.8v4.4M3.5 10h17" />
                    </svg>
                    {post.date}
                  </span>
                </div>
                <h1 className="post-title">{post.title}</h1>
                <div className="post-byline">
                  <div className="post-byline-who">
                    <span className="post-written">{tr('written_by', lang)}</span>
                    <span className="post-author">{post.author}</span>
                    <span className="post-role">{post.authorRole ?? tr('author_role', lang)}</span>
                  </div>
                  <span className="post-when">{post.readingTime}</span>
                </div>
                <div className="post-banner">
                  <svg className="motif" viewBox="0 0 200 200" aria-hidden="true">
                    <circle cx="150" cy="60" r="46" />
                    <circle cx="150" cy="60" r="70" />
                    <path d="M10 190 L70 130 L110 160 L190 60" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  {/* visual repeat of the headline; hidden from screen readers */}
                  <p className="post-banner-t" aria-hidden="true">{post.title}</p>
                </div>
                <p className="post-lede">{post.excerpt}</p>
                <div className="post-body">
                  {post.content.map((block, i) => {
                    if (block.type === 'h2') return <h2 key={i}>{block.text}</h2>;
                    if (block.type === 'list') {
                      return (
                        <ul key={i}>
                          {block.items.map((item, j) => <li key={j}>{rich(item)}</li>)}
                        </ul>
                      );
                    }
                    return <p key={i}>{rich(block.text)}</p>;
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
