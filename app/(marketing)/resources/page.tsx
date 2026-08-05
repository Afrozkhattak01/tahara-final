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
  news_thanks:     { en: 'Thank you for subscribing', ar: 'شكرًا لاشتراكك' },
  news_check:      { en: 'Check your inbox', ar: 'تحقّق من بريدك الوارد' },
  news_error:      { en: 'Something went wrong. Please try again.', ar: 'حدث خطأ ما. يرجى المحاولة مرة أخرى.' },
  news_invalid:    { en: 'Enter a valid email address.', ar: 'أدخل عنوان بريد إلكتروني صالحًا.' },
  card_open:       { en: 'Read more', ar: 'اقرأ المزيد' },
  res_empty:       { en: 'No posts match that yet.', ar: 'لا توجد مقالات مطابقة بعد.' },
  // footer
  footer_tagline:  { en: 'Safety, governance and transparency for the AI you actually run.', ar: 'السلامة والحوكمة والشفافية للذكاء الاصطناعي الذي تشغّلونه فعليًا.' },
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

        main .wrap { padding-left: 48px; padding-right: 48px; }
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

        .res-grid { min-height: 24px; padding: 0 0 8px;
          display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; }
        /* position:relative bounds the stretched .res-card-link below. Without
           it the link would only be contained while the card is hovered, since
           the hover translateY is what would otherwise create the containing
           block, so the hit area would jump around. */
        .res-card { position: relative; background: #fff; border: 1px solid var(--line);
          border-radius: var(--r-m);
          overflow: hidden; display: flex; flex-direction: column; box-shadow: var(--sh-s);
          transition: transform .3s var(--e-out), box-shadow .3s ease; }
        .res-card:hover { transform: translateY(-3px); box-shadow: var(--sh-m); }
        .res-card-banner { position: relative; height: 180px;
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
        .res-card-body { padding: 18px 18px 20px; display: flex; flex-direction: column;
          gap: 10px; flex: 1; }
        /* tag pill and date share the first row, as in the reference */
        .res-card-top { display: flex; align-items: center; gap: 12px; flex-wrap: wrap; }
        .res-card-tag { font-size: 12px; font-weight: 500; color: var(--g600);
          background: rgba(17,64,134,.09); padding: 4px 11px; border-radius: 999px;
          white-space: nowrap; }
        .res-card-date { font-family: var(--font-mono); font-size: 10.5px; font-weight: 500;
          letter-spacing: .08em; text-transform: uppercase; color: var(--ink-3); white-space: nowrap; }
        .res-card h4 { font-size: 17px; line-height: 1.38; color: var(--ink); }
        .res-card p { font-size: 14px; color: var(--ink-2); line-height: 1.6; margin: 0; }

        /* Stretch the one link over the whole card so any point opens the post,
           bounded by position:relative on .res-card above. The card needs no
           click handler and keyboard users still get a single, properly
           labelled tab stop. */
        .res-card-link::after { content: ""; position: absolute; inset: 0; z-index: 1; }
        /* margin-top:auto pins it to the bottom of the card whatever the excerpt
           length, so the links line up across a row. No divider above it. */
        .res-card-link { margin-top: auto; padding-top: 6px; align-self: flex-start;
          display: inline-flex; align-items: center; gap: 6px;
          font-size: 14px; font-weight: 500; color: var(--g600); }
        .res-card-link svg { width: 14px; height: 14px; flex: none;
          transition: transform .3s var(--e-out); }
        .res-card:hover .res-card-link { color: var(--g900); }
        .res-card:hover .res-card-link svg { transform: translate(2px, -2px); }
        [dir="rtl"] .res-card-link svg { transform: scaleX(-1); }
        [dir="rtl"] .res-card:hover .res-card-link svg { transform: scaleX(-1) translate(2px, -2px); }
        /* the stretched layer sits over the text, so restore selectability */
        .res-card-body h4, .res-card-body p, .res-card-tag { position: relative; z-index: 2; }
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
        .res-news-done h2 { color: #fff; margin: 0; font-size: clamp(22px, 2.6vw, 30px); }
        .res-news-done p { color: #b3cbe5; font-size: 14.5px; margin: 0; }

        @media (max-width: 900px) {
          .res-grid { grid-template-columns: repeat(2, 1fr); }
        }
        @media (max-width: 640px) {
          .res-toolbar { flex-direction: column; align-items: stretch; }
          .res-grid { grid-template-columns: 1fr; }
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
              {/* artwork only: the headline sits below, so it isn't repeated here */}
              <div className="res-card-banner" aria-hidden="true" />
              <div className="res-card-body">
                <div className="res-card-top">
                  <span className="res-card-tag">{post.featured ? `Featured · ${post.tag}` : post.tag}</span>
                  <span className="res-card-date">{post.date}</span>
                </div>
                <h4>{post.title}</h4>
                <p>{post.excerpt}</p>
                <Link className="res-card-link" href={`/resources/${post.slug}`}>
                  {tr('card_open', lang)}
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9"
                    strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d="M7 17 17 7M8.5 7H17v8.5" />
                  </svg>
                </Link>
              </div>
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
