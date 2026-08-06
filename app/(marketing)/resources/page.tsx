'use client';

import { useEffect, useState, type FormEvent } from 'react';
import Link from 'next/link';
import AmbientBg from '../AmbientBg';
import { POSTS } from './posts';

type Lang = 'en' | 'ar';

const T = {
  // nav
  nav_platform:    { en: 'Platform',    ar: 'المنصة' },
  nav_lifecycle:   { en: 'Lifecycle',   ar: 'دورة الحياة' },
  nav_architecture:{ en: 'Architecture', ar: 'البنية' },
  nav_resources:   { en: 'Resources',    ar: 'الموارد' },
  nav_faq:         { en: 'FAQ',          ar: 'الأسئلة الشائعة' },
  cta_demo:        { en: 'Request a demo', ar: 'اطلب عرضًا توضيحيًا' },
  // platform menu demo panel — the columns come from tahara-mega.js
  mega_demo_k:     { en: 'Guided demo', ar: 'عرض توضيحي موجَّه' },
  mega_demo_title: { en: 'See Tahara in action', ar: 'شاهد Tahara في العمل' },
  mega_demo_desc:  { en: 'A 30-minute walkthrough, tailored to your stack', ar: 'جولة مدتها 30 دقيقة، مصمَّمة خصيصًا لمنظومتكم' },
  mega_demo_walk:  { en: 'What we walk through', ar: 'ما الذي نستعرضه' },
  stage_assess:    { en: 'Assess',  ar: 'التقييم' },
  stage_govern:    { en: 'Govern',  ar: 'الحوكمة' },
  stage_test:      { en: 'Test',    ar: 'الاختبار' },
  stage_monitor:   { en: 'Monitor', ar: 'المراقبة' },
  // page content
  page_title:      { en: 'Resources', ar: 'الموارد' },
  page_desc:       { en: 'Add your content here: text, images, cards, anything you want.', ar: 'أضف محتواك هنا: نصوص، صور، بطاقات، أي شيء تريده.' },
  res_eyebrow:     { en: 'Field notes', ar: 'ملاحظات ميدانية' },
  res_h1_l1:       { en: 'Agents that have to answer for', ar: 'وكلاء عليهم أن' },
  res_h1_l2:       { en: 'themselves.', ar: 'يُجيبوا عن أنفسهم.' },
  res_lede:        { en: "Three pieces on prompting AI well, and on proving what an agent did once it's out acting on your behalf.", ar: 'ثلاث مقالات حول توجيه الذكاء الاصطناعي بشكل جيد، وإثبات ما فعله الوكيل بعد أن يبدأ بالتصرف نيابة عنك.' },
  res_search_ph:   { en: 'Search the blog', ar: 'ابحث في المدونة' },
  res_filter_all:  { en: 'All', ar: 'الكل' },
  res_filter_craft:{ en: 'Craft', ar: 'الحِرفة' },
  res_filter_gov:  { en: 'Governance', ar: 'الحوكمة' },
  res_filter_news: { en: 'News', ar: 'الأخبار' },
  news_eyebrow:    { en: 'Weekly, not daily', ar: 'أسبوعيًا، وليس يوميًا' },
  news_h2:         { en: 'Get the next entry in your inbox', ar: 'احصل على المقال التالي في بريدك' },
  news_desc:       { en: "One email a week. The entries that mattered, and nothing written just to fill a schedule.", ar: 'رسالة واحدة أسبوعيًا: المقالات المهمة فقط، دون حشو.' },
  news_email_ph:   { en: 'you@company.com', ar: 'you@company.com' },
  news_submit:     { en: 'Subscribe', ar: 'اشترك' },
  news_thanks:     { en: 'Thank you for joining our valuable subscriber list', ar: 'شكرًا لانضمامك إلى قائمة مشتركينا القيّمة' },
  news_check:      { en: 'Check your inbox', ar: 'تحقّق من بريدك الوارد' },
  news_error:      { en: 'Something went wrong. Please try again.', ar: 'حدث خطأ ما. يرجى المحاولة مرة أخرى.' },
  news_invalid:    { en: 'Enter a valid email address.', ar: 'أدخل عنوان بريد إلكتروني صالحًا.' },
  card_open:       { en: 'Read more', ar: 'اقرأ المزيد' },
  res_empty:       { en: 'No posts match that yet.', ar: 'لا توجد مقالات مطابقة بعد.' },
  // footer
  footer_tagline:  { en: 'Safety, Governance and Transparency for the AI you actually run.', ar: 'السلامة والحوكمة والشفافية للذكاء الاصطناعي الذي تشغّلونه فعليًا.' },
  footer_copyright:{ en: '© 2026 Tahara AI. All rights reserved.', ar: '© 2026 Tahara AI. جميع الحقوق محفوظة.' },
  footer_motto:    { en: 'SAFE · ETHICAL · TRANSPARENT', ar: 'آمن · أخلاقي · شفّاف' },
};

function tr(key: keyof typeof T, lang: Lang) {
  return T[key][lang];
}

type Filter = 'all' | 'craft' | 'governance' | 'news';

export default function ResourcesPage() {
  const [lang, setLang] = useState<Lang>('en');
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<Filter>('all');
  const [email, setEmail] = useState('');
  const [newsletterStatus, setNewsletterStatus] =
    useState<'idle' | 'loading' | 'success' | 'error' | 'invalid'>('idle');

  /* The search box and the filter pills used to update state that nothing
     read, so the grid always showed every post. Both are applied here. */
  const q = search.trim().toLowerCase();
  const visible = POSTS.filter((post) => {
    if (filter !== 'all' && post.category !== filter) return false;
    if (!q) return true;
    return (post.title + ' ' + post.excerpt + ' ' + post.tag).toLowerCase().includes(q);
  });

  const handleNewsletterSubscribe = async (e: FormEvent) => {
    e.preventDefault();
    const value = email.trim();
    /* The submit used to be wired to the button's onClick, which fires even
       when the browser rejects the field, so an invalid address still POSTed.
       Validating here covers both the click and the Enter key. */
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) { setNewsletterStatus('invalid'); return; }

    setNewsletterStatus('loading');
    try {
      const res = await fetch('https://hook.eu1.make.com/gmndde1lm89azj8glxw485eu5s2233ub', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: value, source: 'newsletter' }),
      });
      /* fetch only rejects on a network failure: a 4xx/5xx resolves normally,
         so without this a rejected signup was reported as a success. */
      if (!res.ok) throw new Error('Webhook responded ' + res.status);
      setNewsletterStatus('success');
      setEmail('');
    } catch (err) {
      setNewsletterStatus('error');
    }
  };

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

  /* Platform mega-menu — the same script the landing page runs. It builds the
     columns into the shell below and wires open/close itself; re-running mount
     on a language change rebuilds them, exactly as the landing page does. */
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

  // Apply lang/dir to <html> so RTL CSS from landing.css works
  useEffect(() => {
    document.documentElement.setAttribute('lang', lang === 'ar' ? 'ar' : 'en');
    document.documentElement.setAttribute('dir', lang === 'ar' ? 'rtl' : 'ltr');
  }, [lang]);

  return (
    <>
      <AmbientBg />
      <style suppressHydrationWarning>{`
        footer { padding: 32px 0 18px !important; margin-top: 56px !important; }
        .foot-grid { gap: 24px !important; padding-bottom: 22px !important; }
        .foot-brand p { margin-top: 8px !important; }
        footer h5 { margin-bottom: 10px !important; }
        footer li { margin-bottom: 6px !important; }
        .foot-bottom { padding-top: 14px !important; }

        /* One width for the whole page. The card grid needs 1390px to hold
           three wide cards, so the hero, toolbar and newsletter take it too —
           otherwise the grid hangs ~105px outside everything above it. */
        main .wrap { max-width: 1390px; padding-left: 48px; padding-right: 48px; }
        .res-hero { padding-bottom: 56px; text-align: left; }
        .res-grid { margin-bottom: 64px; }
        .res-h1 { margin-top: 16px; margin-bottom: 14px;
          font-size: clamp(34px, 4.4vw, 54px); line-height: 1.1; color: var(--g900); }
        .res-lede { margin-bottom: 0; font-size: 15px; max-width: 46ch; color: var(--ink-2); }

        .res-toolbar { display: flex; align-items: center; gap: 12px; margin-top: 30px; flex-wrap: wrap; }
        .res-search { flex: 1 1 320px; min-width: 240px; display: flex; align-items: center; gap: 10px;
          background: #fff; border: 1px solid var(--line-2); border-radius: 14px; padding: 13px 16px;
          box-shadow: var(--sh-s); transition: border-color .2s, box-shadow .2s; }
        .res-search:focus-within { border-color: var(--g600); box-shadow: 0 0 0 4px rgba(17,64,134,.1); }
        .res-search svg { width: 16px; height: 16px; color: var(--ink-3); flex: none; }
        .res-search input { flex: 1; min-width: 0; border: none; outline: none; background: transparent;
          font-family: var(--font-body); font-size: 14.5px; color: var(--ink); }
        .res-search input::placeholder { color: var(--ink-3); }

        .res-filters { display: flex; gap: 8px; flex-wrap: wrap; }
        .res-filter-pill { font-family: var(--font-mono); font-size: 10.5px; font-weight: 500;
          letter-spacing: .1em; text-transform: uppercase; padding: 11px 16px; border-radius: 999px;
          background: #fff; color: var(--ink-2); border: 1px solid var(--line-2);
          transition: background .2s, color .2s, border-color .2s; white-space: nowrap; }
        .res-filter-pill:hover { border-color: var(--g600); }
        .res-filter-pill.on { background: var(--g900); color: #fff; border-color: var(--g900); }

        /* width and side padding come from the main .wrap rule above, so the
           cards start on the same left edge as the headline */
        .res-grid { min-height: 24px; padding-bottom: 8px;
          display: grid; grid-template-columns: repeat(3, 1fr); gap: 32px; }
        .res-card { position: relative; background: #fff; border: 1px solid var(--line);
          border-radius: var(--r-m);
          overflow: hidden; display: flex; flex-direction: column; box-shadow: var(--sh-s);
          transition: transform .3s var(--e-out), box-shadow .3s ease; }
        .res-card:hover { transform: translateY(-3px); box-shadow: var(--sh-m); }
        /* the link IS the card: it fills it edge to edge, so there is no part
           of the card that is not the link */
        .res-card-hit { display: flex; flex-direction: column; flex: 1;
          color: inherit; text-decoration: none; }
        /* ratio, not a fixed height, so it stays proportional through the
           breakpoints. 21:9 keeps the banner a wide strip rather than a block
           that drives the card's height */
        .res-card-banner { position: relative; aspect-ratio: 21 / 9;
          background: linear-gradient(135deg, #a9c7e8 0%, #4d86c9 30%, var(--g700) 62%, var(--g900) 100%);
          background-size: 180% 180%; background-position: 0% 50%;
          animation: bannerDrift 7s ease-in-out infinite;
          overflow: hidden; }
        @media (prefers-reduced-motion: reduce) {
          .res-card-banner, .res-card-banner::after { animation: none; }
        }
        .res-card-banner::after { content: ""; position: absolute; inset: 0;
          background: linear-gradient(115deg, transparent 30%, rgba(255,255,255,.28) 46%, transparent 62%);
          background-size: 220% 100%; background-position: 130% 0;
          animation: bannerShine 5.5s ease-in-out infinite; }
        @keyframes bannerDrift {
          0%,100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }
        @keyframes bannerShine {
          0%,60%,100% { background-position: 130% 0; }
          30% { background-position: -30% 0; }
        }
        .res-empty { grid-column: 1 / -1; margin: 0; padding: 40px 0;
          font-size: 15px; color: var(--ink-3); }
        .res-card-body { padding: 22px 22px 24px; display: flex; flex-direction: column;
          gap: 10px; flex: 1; }
        /* tag pill and date share the first row, as in the reference */
        .res-card-top { display: flex; align-items: center; gap: 12px; flex-wrap: wrap; }
        .res-card-tag { font-size: 12.5px; font-weight: 500; color: var(--g600);
          background: rgba(17,64,134,.09); padding: 5px 12px; border-radius: 999px;
          white-space: nowrap; }
        .res-card-date { font-family: var(--font-mono); font-size: 11px; font-weight: 500;
          letter-spacing: .08em; text-transform: uppercase; color: var(--ink-3); white-space: nowrap; }
        .res-card h4 { font-size: 19px; line-height: 1.4; color: var(--ink); }
        .res-card p { font-size: 15px; color: var(--ink-2); line-height: 1.62; margin: 0; }

        /* margin-top:auto pins it to the bottom of the card whatever the excerpt
           length, so the "Read more" lines up across a row. No divider above it. */
        .res-card-link { margin-top: auto; padding-top: 10px; align-self: flex-start;
          display: inline-flex; align-items: center; gap: 6px;
          font-size: 15px; font-weight: 500; color: var(--g600); }
        .res-card-link svg { width: 15px; height: 15px; flex: none;
          transition: transform .3s var(--e-out); }
        .res-card:hover .res-card-link { color: var(--g900); }
        .res-card:hover .res-card-link svg { transform: translate(2px, -2px); }
        [dir="rtl"] .res-card-link svg { transform: scaleX(-1); }
        [dir="rtl"] .res-card:hover .res-card-link svg { transform: scaleX(-1) translate(2px, -2px); }
        /* Nothing in the body is lifted above the stretched layer: raising the
           title, excerpt or tag made those areas swallow the click, so only the
           blank parts of the card opened the post. Every pixel opens it now —
           the cost is that the card's text can no longer be drag-selected. */
        .res-card:focus-within { outline: 2px solid var(--g600); outline-offset: 3px; }
        .res-card-link:focus-visible { outline: none; }

        .res-news { position: relative; overflow: hidden; border-radius: 26px; padding: 44px 40px;
          color: #fff; background: radial-gradient(ellipse 80% 90% at 50% 0%, #0b3472, var(--g900) 68%);
          display: flex; align-items: center; justify-content: space-between; gap: 32px; flex-wrap: wrap; }
        .res-news-copy { max-width: 460px; }
        .res-news-eyebrow { color: var(--g400) !important; display: block; margin-bottom: 10px; }
        .res-news-copy h2 { color: #fff; margin-bottom: 10px; font-size: clamp(22px, 2.6vw, 30px); }
        .res-news-copy p { color: #b3cbe5; font-size: 14.5px; margin: 0; }
        .res-news-form { display: flex; gap: 10px; flex: 0 0 auto; flex-wrap: wrap; }
        .res-news-form input { border: 1px solid rgba(255,255,255,.28); border-radius: 12px;
          padding: 13px 16px; font-size: 14.5px; color: #fff; background: rgba(255,255,255,.08);
          outline: none; min-width: 220px; transition: border-color .2s, background .2s; }
        .res-news-form input::placeholder { color: rgba(255,255,255,.55); }
        .res-news-form input:focus { border-color: var(--g400); background: rgba(255,255,255,.14); }
        .res-news-form input[aria-invalid="true"] { border-color: #e88a7d; }
        .res-news-err { width: 100%; margin: 0; color: #f0b4aa; font-size: 13.5px; }

        /* Success replaces the whole box. The min-height holds roughly the
           height the copy + form occupied, so the section doesn't collapse
           and shunt the footer up the moment someone subscribes. */
        .res-news-done { flex: 1; min-height: 150px; display: flex; flex-direction: column;
          align-items: center; justify-content: center; text-align: center; gap: 8px; }
        /* one line: no width cap, and the size tracks the viewport steeply
           enough that the sentence keeps fitting as the box narrows */
        .res-news-done h2 { color: #fff; margin: 0; font-size: clamp(15px, 3.1vw, 30px);
          line-height: 1.2; }
        .res-news-done p { color: #b3cbe5; font-size: 14.5px; margin: 0; }

        @media (max-width: 900px) {
          .res-grid { grid-template-columns: repeat(2, 1fr); gap: 26px; }
        }
        @media (max-width: 640px) {
          .res-toolbar { flex-direction: column; align-items: stretch; }
          /* one column: a 32px gutter between stacked cards reads as a hole */
          .res-grid { grid-template-columns: 1fr; gap: 22px; }
          .res-card-body { padding: 22px 22px 24px; }
          .res-news { padding: 34px 24px; }
          .res-news-form { width: 100%; }
          .res-news-form input { flex: 1; min-width: 0; }
        }
      `}</style>
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

        {/* Platform mega-menu. Only the shell lives here — tahara-mega.js fills
            in the columns and the "more" row, same as on the landing page. */}
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

      <div className="mega-scrim" id="megaScrim" aria-hidden="true"></div>

      {/* ══════════ page content ══════════ */}
      <main style={{ minHeight: '60vh', padding: '120px 0 0' }}>
        {/* ── hero ── */}
        <section className="wrap res-hero">
          <span className="eyebrow"><i></i>{tr('res_eyebrow', lang)}</span>
          <h1 className="res-h1">{tr('res_h1_l1', lang)}<br />{tr('res_h1_l2', lang)}</h1>
          <p className="lede res-lede">{tr('res_lede', lang)}</p>

          <div className="res-toolbar">
            <div className="res-search">
              <svg viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true">
                <circle cx="8" cy="8" r="6.2" />
                <path d="m16 16-3.4-3.4" strokeLinecap="round" />
              </svg>
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder={tr('res_search_ph', lang)}
                aria-label={tr('res_search_ph', lang)}
              />
            </div>
            <div className="res-filters" role="tablist">
              {([
                ['all', 'res_filter_all'],
                ['craft', 'res_filter_craft'],
                ['governance', 'res_filter_gov'],
                ['news', 'res_filter_news'],
              ] as [Filter, keyof typeof T][]).map(([key, label]) => (
                <button
                  key={key}
                  type="button"
                  role="tab"
                  aria-selected={filter === key}
                  className={'res-filter-pill' + (filter === key ? ' on' : '')}
                  onClick={() => setFilter(key)}
                >
                  {tr(label, lang)}
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* ── blog entries, sourced from posts.ts; add a post there to add a card ──
             The whole card opens the post: .res-card-link is stretched across it
             by ::after rather than wrapping everything in an <a>, so the heading
             stays a heading and the card keeps a single link to one destination. */}
        <section className="wrap res-grid" id="resourceGrid">
          {visible.length === 0 && <p className="res-empty">{tr('res_empty', lang)}</p>}
          {visible.map((post) => (
            <article className="res-card" key={post.slug}>
              {/* The link wraps the entire card — banner, text and all — so every
                  part of it navigates. "Read more" is a span, not a second link:
                  one card, one destination, one tab stop. */}
              <Link className="res-card-hit" href={`/resources/${post.slug}`}>
                {/* artwork only: the headline sits below, so it isn't repeated here */}
                <div className="res-card-banner" aria-hidden="true" />
                <div className="res-card-body">
                  <div className="res-card-top">
                    <span className="res-card-tag">{post.featured ? `Featured · ${post.tag}` : post.tag}</span>
                    <span className="res-card-date">{post.date}</span>
                  </div>
                  <h4>{post.title}</h4>
                  <p>{post.excerpt}</p>
                  <span className="res-card-link">
                    {tr('card_open', lang)}
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9"
                      strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <path d="M7 17 17 7M8.5 7H17v8.5" />
                    </svg>
                  </span>
                </div>
              </Link>
            </article>
          ))}
        </section>

        {/* ── newsletter ── */}
        <section className="wrap">
          <div className="res-news">
            {newsletterStatus === 'success' ? (
              /* the whole box becomes the confirmation, with no eyebrow, heading or form */
              <div className="res-news-done" role="status" aria-live="polite">
                <h2>{tr('news_thanks', lang)}</h2>
                <p>{tr('news_check', lang)}</p>
              </div>
            ) : (
              <>
                <div className="res-news-copy">
                  <span className="label res-news-eyebrow">{tr('news_eyebrow', lang)}</span>
                  <h2>{tr('news_h2', lang)}</h2>
                  <p>{tr('news_desc', lang)}</p>
                </div>
                <form className="res-news-form" onSubmit={handleNewsletterSubscribe} noValidate>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => { setEmail(e.target.value); if (newsletterStatus !== 'idle') setNewsletterStatus('idle'); }}
                    disabled={newsletterStatus === 'loading'}
                    placeholder={tr('news_email_ph', lang)}
                    aria-label={tr('news_email_ph', lang)}
                    aria-invalid={newsletterStatus === 'invalid'}
                  />
                  <button type="submit" className="btn btn-solid" disabled={newsletterStatus === 'loading'}>
                    <span>{tr('news_submit', lang)}</span>
                    <span className="arw">→</span>
                  </button>
                  {(newsletterStatus === 'error' || newsletterStatus === 'invalid') && (
                    <p className="res-news-err" role="alert">
                      {tr(newsletterStatus === 'invalid' ? 'news_invalid' : 'news_error', lang)}
                    </p>
                  )}
                </form>
              </>
            )}
          </div>
        </section>
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
