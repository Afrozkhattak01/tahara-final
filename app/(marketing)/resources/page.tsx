'use client';

import { useEffect, useState, type FormEvent } from 'react';
import Link from 'next/link';
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
  page_desc:       { en: 'Add your content here — text, images, cards, anything you want.', ar: 'أضف محتواك هنا — نصوص، صور، بطاقات، أي شيء تريده.' },
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
  news_desc:       { en: "One email a week — the entries that mattered, and nothing written just to fill a schedule.", ar: 'رسالة واحدة أسبوعيًا — المقالات المهمة فقط، دون حشو.' },
  news_email_ph:   { en: 'you@company.com', ar: 'you@company.com' },
  news_submit:     { en: 'Subscribe', ar: 'اشترك' },
  card_open:       { en: 'Open', ar: 'فتح' },
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
  const [subscribed, setSubscribed] = useState(false);
  const [email, setEmail] = useState('');
  const [newsletterStatus, setNewsletterStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');

  function handleSubscribe(e: FormEvent) {
    e.preventDefault();
    if (!email.trim()) return;
    setSubscribed(true);
  }

  const handleNewsletterSubscribe = async () => {
    if (!email) return;
    setNewsletterStatus('loading');
    try {
      await fetch('https://hook.eu1.make.com/gmndde1lm89azj8glxw485eu5s2233ub', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, source: 'newsletter' }),
      });
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
        .res-card { background: #fff; border: 1px solid var(--line); border-radius: var(--r-m);
          overflow: hidden; display: flex; flex-direction: column; box-shadow: var(--sh-s);
          transition: transform .3s var(--e-out), box-shadow .3s ease; }
        .res-card:hover { transform: translateY(-3px); box-shadow: var(--sh-m); }
        .res-card-banner { position: relative; height: 116px; padding: 14px 16px;
          display: flex; align-items: flex-end;
          background: linear-gradient(135deg, #a9c7e8 0%, #4d86c9 30%, var(--g700) 62%, var(--g900) 100%);
          background-size: 180% 180%; background-position: 0% 50%;
          animation: bannerDrift 7s ease-in-out infinite;
          overflow: hidden; }
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
        .res-card-banner span { position: relative; z-index: 1; color: #fff; font-weight: 500;
          font-size: 14px; line-height: 1.3; }
        .res-card-body { padding: 16px; display: flex; flex-direction: column; gap: 8px; flex: 1; }
        .res-card-tag { align-self: flex-start; font-family: var(--font-mono); font-size: 9.5px;
          font-weight: 500; letter-spacing: .1em; text-transform: uppercase; color: var(--g600);
          background: rgba(17,64,134,.1); padding: 4px 9px; border-radius: 6px; }
        .res-card h4 { font-size: 15.5px; line-height: 1.35; color: var(--ink); }
        .res-card p { font-size: 13.5px; color: var(--ink-2); line-height: 1.55; margin: 0; }
        .res-card-meta { margin-top: auto; padding-top: 10px; border-top: 1px solid var(--line);
          display: flex; align-items: center; justify-content: space-between;
          font-family: var(--font-mono); font-size: 10.5px; color: var(--ink-3); }
        .res-card-meta a { color: var(--g600); font-weight: 500; }

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
      <main style={{ minHeight: '60vh', padding: '150px 0 0' }}>
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

        {/* ── blog entries — sourced from posts.ts; add a post there to add a card ── */}
        <section className="wrap res-grid" id="resourceGrid">
          {POSTS.map((post) => (
            <article className="res-card" key={post.slug}>
              <div className="res-card-banner"><span>{post.title}</span></div>
              <div className="res-card-body">
                <span className="res-card-tag">{post.featured ? `Featured · ${post.tag}` : post.tag}</span>
                <h4>{post.title}</h4>
                <p>{post.excerpt}</p>
                <div className="res-card-meta">
                  <span>{post.readingTime} · {post.date}</span>
                  <Link href={`/resources/${post.slug}`}>{tr('card_open', lang)} →</Link>
                </div>
              </div>
            </article>
          ))}
        </section>

        {/* ── newsletter ── */}
        <section className="wrap">
          <div className="res-news">
            <div className="res-news-copy">
              <span className="label res-news-eyebrow">{tr('news_eyebrow', lang)}</span>
              <h2>{tr('news_h2', lang)}</h2>
              <p>{tr('news_desc', lang)}</p>
            </div>
            <form className="res-news-form" onSubmit={(e) => e.preventDefault()}>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={newsletterStatus === 'loading'}
                placeholder={tr('news_email_ph', lang)}
                aria-label={tr('news_email_ph', lang)}
              />
              <button type="submit" className="btn btn-solid" onClick={handleNewsletterSubscribe} disabled={newsletterStatus === 'loading'}>
                <span>{subscribed ? '✓' : tr('news_submit', lang)}</span>
                {!subscribed && <span className="arw">→</span>}
              </button>
              {newsletterStatus === 'success' && <p style={{ color: '#fff', fontSize: '13.5px', margin: 0, marginTop: '8px' }}>Thanks — check your inbox!</p>}
              {newsletterStatus === 'error' && <p style={{ color: '#fff', fontSize: '13.5px', margin: 0, marginTop: '8px' }}>Something went wrong. Please try again.</p>}
            </form>
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
