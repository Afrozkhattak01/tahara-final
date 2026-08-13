'use client';

import { useEffect, useState } from 'react';
import AmbientBg from '../AmbientBg';
import PageHero from '../../../components/PageHero';

/**
 * About us.
 *
 * Same shell as /resources — landing.css supplies the tokens and the chrome,
 * the nav and footer are reproduced here because each page owns its own header,
 * and the language follows the same localStorage key the landing toggle writes.
 *
 * ─────────────────────────────────────────────────────────────────────────
 * PLACEHOLDER COPY: every string below marked /* TODO copy *​/ is filler and
 * says nothing true about the company. It is deliberately obvious rather than
 * plausible — invented founding dates, headcounts or offices would read as
 * fact and ship as fact. Replace both the en and the ar side of each.
 * The four "what we do" cards are the exception: they describe the product
 * areas this site already documents, so they are safe as they stand.
 * ─────────────────────────────────────────────────────────────────────────
 */

type Lang = 'en' | 'ar';

const T = {
  /* nav + chrome — same wording as the other pages */
  nav_platform:     { en: 'Platform',     ar: 'المنصة' },
  nav_lifecycle:    { en: 'Lifecycle',    ar: 'دورة الحياة' },
  nav_architecture: { en: 'Architecture', ar: 'البنية' },
  nav_resources:    { en: 'Resources',    ar: 'الموارد' },
  nav_faq:          { en: 'FAQ',          ar: 'الأسئلة الشائعة' },
  nav_about:        { en: 'About us',     ar: 'من نحن' },
  cta_demo:         { en: 'Request a demo', ar: 'اطلب عرضًا توضيحيًا' },

  /* hero */
  badge: { en: 'Now onboarding pilot teams', ar: 'نستقبل الآن فرق التجربة الأولى' },
  cta:   { en: 'Get a Demo', ar: 'احصل على عرض توضيحي' },
  title:     { en: 'Govern Every AI System Running In Your Company',
               ar: 'احكم كل نظام ذكاء اصطناعي يعمل في شركتك' },
  lead:      { en: 'Tahara AI discovers every AI system in your environment, checks it against the frameworks that actually apply, and produces the evidence to prove it — continuously, not once a year.',
               ar: 'يكتشف Tahara AI كل نظام ذكاء اصطناعي في بيئتك، ويفحصه وفق الأطر التي تنطبق فعليًا، وينتج الأدلة التي تثبت ذلك — بشكل مستمر، لا مرة واحدة في السنة.' },

  /* what we do — describes the product areas this site already documents */
  wwd_k:     { en: 'What we do', ar: 'ما الذي نقوم به' },
  wwd_lead:  { en: 'Assurance across the life of an AI system, from what you have deployed to what it does in production.',
               ar: 'ضمان يمتد على طول دورة حياة نظام الذكاء الاصطناعي، من ما هو منشور لديك إلى ما يفعله في الإنتاج.' },
  a1_t: { en: 'Assess',  ar: 'التقييم' },
  a1_d: { en: 'Discover the AI surface you already run — models, agents, APIs and the data they reach.',
          ar: 'اكتشف سطح الذكاء الاصطناعي القائم لديك — النماذج والوكلاء وواجهات البرمجة والبيانات التي تصل إليها.' },
  a2_t: { en: 'Govern',  ar: 'الحوكمة' },
  a2_d: { en: 'Map what you run to the frameworks that bind you, and keep the evidence dated and ready.',
          ar: 'اربط ما تشغّله بالأطر المُلزِمة لك، واحتفظ بالأدلة مؤرَّخة وجاهزة.' },
  a3_t: { en: 'Test',    ar: 'الاختبار' },
  a3_d: { en: 'Probe the system the way an attacker would, on a schedule rather than once a year.',
          ar: 'اختبر النظام بالطريقة التي يسلكها المهاجم، وفق جدول منتظم لا مرة واحدة سنويًا.' },
  a4_t: { en: 'Monitor', ar: 'المراقبة' },
  a4_d: { en: 'Inspect prompts and retrieval at runtime, and hold the line where policy says it should hold.',
          ar: 'افحص الموجّهات والاسترجاع أثناء التشغيل، وطبّق الحدود حيث تقتضي السياسة.' },

  /* overview */
  ov_k:      { en: 'Overview', ar: 'نظرة عامة' },
  /* TODO copy */
  ov_body1:  { en: 'Add your overview here. This block is for the longer story — what the company does, how it started, and what it is building toward.',
               ar: 'أضف نظرتك العامة هنا. هذه الفقرة مخصّصة للسرد الأطول — ما تقوم به الشركة، وكيف بدأت، وما الذي تبنيه.' },
  /* TODO copy */
  ov_body2:  { en: 'Add a second paragraph here if you need one, or delete this block.',
               ar: 'أضف فقرة ثانية هنا إذا احتجت إليها، أو احذف هذه الكتلة.' },

  /* closing */
  cta_title: { en: 'Put your AI under control.', ar: 'ضع الذكاء الاصطناعي لديك تحت السيطرة.' },
  cta_body:  { en: 'Thirty minutes on your own estate: what we would find, and what we would block.',
               ar: 'ثلاثون دقيقة على بيئتك الخاصة: ما الذي سنكتشفه، وما الذي سنمنعه.' },

  footer_tagline:   { en: 'Assurance for AI systems.', ar: 'ضمان لأنظمة الذكاء الاصطناعي.' },
  footer_copyright: { en: '© 2026 Tahara AI', ar: '© 2026 Tahara AI' },
  footer_motto:     { en: 'EVIDENCE, NOT ASSURANCES', ar: 'أدلة، لا وعود' },
} as const;

function tr(key: keyof typeof T, lang: Lang) {
  return T[key][lang];
}

const CARDS = [
  ['a1_t', 'a1_d'],
  ['a2_t', 'a2_d'],
  ['a3_t', 'a3_d'],
  ['a4_t', 'a4_d'],
] as const;

export default function AboutPage() {
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

  /* the shared platform mega-menu, same as every other page */
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
      <style suppressHydrationWarning>{`

        /* video — the frame comes from landing.css (.pv-frame); only the play
           control differs, translucent rather than the landing page's solid
           white disc */
        .ab-video{padding:4px 0 0}
        .ab-play{position:absolute;left:50%;top:50%;transform:translate(-50%,-50%);
          width:80px;height:80px;border-radius:50%;cursor:pointer;
          background:rgba(255,255,255,.13);border:1px solid rgba(255,255,255,.42);
          display:grid;place-items:center;color:#fff;
          transition:background .25s ease,transform .3s var(--e-out)}
        .ab-play svg{width:26px;height:26px;margin-left:4px}
        .ab-play:hover{background:rgba(255,255,255,.2);
          transform:translate(-50%,-50%) scale(1.06)}
        @media(max-width:640px){ .ab-play{width:60px;height:60px}
          .ab-play svg{width:20px;height:20px;margin-left:3px} }

        .ab-sec{padding:56px 0 0}
        .ab-sec-head{display:flex;align-items:baseline;gap:16px;padding-bottom:10px;
          border-bottom:1px solid var(--line)}
        .ab-sec-head span{font-family:var(--font-mono);font-size:11px;font-weight:500;
          letter-spacing:.16em;text-transform:uppercase;color:var(--ink-3)}
        .ab-sec-lead{margin-top:22px;font-size:17px;line-height:1.7;color:var(--ink-2);max-width:70ch}

        .ab-cards{display:grid;grid-template-columns:repeat(4,1fr);gap:18px;margin-top:30px}
        .ab-card{border:1px solid var(--line);border-radius:16px;background:var(--paper);
          padding:22px 20px 24px;box-shadow:var(--sh-s)}
        .ab-card b{display:block;font-family:var(--font-display);font-weight:400;font-size:19px;
          color:var(--ink)}
        .ab-card p{margin-top:9px;font-size:14px;line-height:1.6;color:var(--ink-2)}

        .ab-prose{margin-top:24px;max-width:70ch}
        .ab-prose p{font-size:16.5px;line-height:1.75;color:var(--ink-2)}
        .ab-prose p + p{margin-top:16px}

        .ab-cta{margin:76px 0 90px;border:1px solid var(--line);border-radius:22px;
          background:var(--paper);padding:46px 44px;display:flex;align-items:center;
          justify-content:space-between;gap:30px;flex-wrap:wrap;box-shadow:var(--sh-m)}
        .ab-cta h2{font-size:clamp(24px,3vw,34px)}
        .ab-cta p{margin-top:10px;font-size:15.5px;line-height:1.6;color:var(--ink-2);max-width:52ch}

        @media(max-width:900px){ .ab-cards{grid-template-columns:repeat(2,1fr)} }
        @media(max-width:560px){
          .ab-cards{grid-template-columns:1fr}
          .ab-cta{padding:32px 24px}
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
            <a href="/resources">{tr('nav_resources', lang)}</a>
            <a href="/#faq">{tr('nav_faq', lang)}</a>
            <a href="/about" className="on">{tr('nav_about', lang)}</a>
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
      </header>

      {/* Platform mega-menu shell — tahara-mega.js fills and drives it. */}
      <div className="mega-scrim" id="megaScrim" aria-hidden="true"></div>
      <div className="mega" id="mega" aria-hidden="true">
        <div className="mega-card">
          <div className="mega-inner" id="megaInner"></div>
        </div>
      </div>

      <main>
        <PageHero
          title={tr('title', lang)}
          lead={tr('lead', lang)}
          cta={tr('cta', lang)}
          calLink="tahara-ai-xpf7u0/product-demo"
        />

        {/* Video. .pv-frame is the landing page's own panel — same gradient,
            inner grid, radius and shadow — so this needs no new frame styling.
            The play control is deliberately inert, matching the landing page:
            there is no video wired to it yet. */}
        <section className="ab-video">
          <div className="wrap">
            <div className="pv-frame">
              <button className="ab-play" type="button" aria-label="Play video">
                <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                  <path d="M8 5.4v13.2L19 12z" />
                </svg>
              </button>
            </div>
          </div>
        </section>

        <div className="wrap">
          <section className="ab-sec">
            <div className="ab-sec-head"><span>{tr('wwd_k', lang)}</span></div>
            <p className="ab-sec-lead">{tr('wwd_lead', lang)}</p>
            <div className="ab-cards">
              {CARDS.map(([t, d]) => (
                <div className="ab-card" key={t}>
                  <b>{tr(t, lang)}</b>
                  <p>{tr(d, lang)}</p>
                </div>
              ))}
            </div>
          </section>

          <section className="ab-sec">
            <div className="ab-sec-head"><span>{tr('ov_k', lang)}</span></div>
            <div className="ab-prose">
              <p>{tr('ov_body1', lang)}</p>
              <p>{tr('ov_body2', lang)}</p>
            </div>
          </section>

          <section className="ab-cta">
            <div>
              <h2>{tr('cta_title', lang)}</h2>
              <p>{tr('cta_body', lang)}</p>
            </div>
            <button className="btn btn-solid" data-cal-link="tahara-ai-xpf7u0/product-demo">
              <span>{tr('cta_demo', lang)}</span>
            </button>
          </section>
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
