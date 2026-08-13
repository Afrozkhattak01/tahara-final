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

  /* why — section header + four problem/answer blocks */
  why_k:  { en: 'Why Tahara AI', ar: 'لماذا Tahara AI' },
  why_t:  { en: "Outcomes You Can Measure, Not Just Promises You're Told",
            ar: 'نتائج يمكنك قياسها، لا مجرد وعود تُقال لك' },

  w1_k: { en: "Problem — you can't govern what you can't see",
          ar: 'المشكلة — لا يمكنك حوكمة ما لا تراه' },
  w1_t: { en: 'Find Every AI System, Not Just the Ones You Approved',
          ar: 'اعثر على كل نظام ذكاء اصطناعي، لا على ما اعتمدته فقط' },
  w1_d: { en: 'AI systems get built in-house, bundled into tools you already pay for, or shipped before anyone signed off. A read-only collector runs inside your own boundary, under your own credentials, and finds every one within a day.',
          ar: 'تُبنى أنظمة الذكاء الاصطناعي داخليًا، أو تأتي مضمّنة في أدوات تدفع ثمنها بالفعل، أو تُطلق قبل أن يوافق عليها أحد. يعمل جامع بيانات للقراءة فقط داخل نطاقك وببيانات اعتمادك، ويجد كل واحد منها خلال يوم.' },

  w2_k: { en: 'Problem — a document is not proof',
          ar: 'المشكلة — الوثيقة ليست دليلًا' },
  w2_t: { en: 'Map Every System to the Law That Actually Applies',
          ar: 'اربط كل نظام بالقانون الذي ينطبق فعلًا' },
  w2_d: { en: 'A policy that says the right thing isn’t a system that does it. Every requirement is checked against your live system, and only marked "Conforming" once a named person confirms it on the record — a machine’s observation can raise a finding, never close one.',
          ar: 'السياسة التي تقول الشيء الصحيح ليست نظامًا يفعله. يُفحص كل متطلب مقابل نظامك الحي، ولا يُوسم بـ«مطابق» إلا بعد أن يؤكده شخص مُسمّى في السجل — يمكن لملاحظة آلية أن تفتح نتيجة، لا أن تغلقها.' },

  w3_k: { en: 'Problem — a yearly pen test misses everything that changed since',
          ar: 'المشكلة — اختبار اختراق سنوي يفوّت كل ما تغيّر بعده' },
  w3_t: { en: 'Attack Your Own System Before Someone Else Does',
          ar: 'هاجم نظامك قبل أن يهاجمه غيرك' },
  w3_d: { en: 'Most red-teaming happens once, months before launch, against a version of the system that no longer exists by the time it ships. Tahara AI runs the OWASP LLM Top 10 against staging on a recurring schedule, so a regression shows up the next cycle — not next year.',
          ar: 'يجري معظم اختبار الفريق الأحمر مرة واحدة، قبل الإطلاق بأشهر، على نسخة لم تعد موجودة وقت الإطلاق. يشغّل Tahara AI قائمة OWASP LLM العشرة على بيئة التجهيز وفق جدول متكرر، فيظهر أي تراجع في الدورة التالية — لا في العام التالي.' },

  w4_k: { en: 'Problem — the leak happens before anyone reviews the transcript',
          ar: 'المشكلة — يقع التسريب قبل أن يراجع أحد النص' },
  w4_t: { en: 'Catch What Leaks Before It Reaches the Model',
          ar: 'أمسك ما يتسرّب قبل أن يصل إلى النموذج' },
  w4_d: { en: 'By the time a privacy review catches a leak, it’s already happened. Guardrails inspect every prompt before it reaches the model — masking, blocking, bilingually in English and Roman Urdu — and log the rare one that gets through.',
          ar: 'عندما تكتشف مراجعة الخصوصية تسريبًا، يكون قد وقع بالفعل. تفحص حواجز الحماية كل موجّه قبل وصوله إلى النموذج — إخفاءً ومنعًا، بالإنجليزية والأردية بحروف لاتينية — وتسجّل النادر الذي ينفذ.' },

  /* crosswalk */
  fw_t:    { en: 'Built Around One Framework, Not Twelve Separate Ones',
             ar: 'مبنيّ حول إطار واحد، لا اثني عشر إطارًا منفصلًا' },
  fw_req:  { en: 'requirements', ar: 'متطلبًا' },
  fw_rail: { en: 'Crosswalk rail', ar: 'مسار الربط' },
  fw_m:    { en: 'The Tahara Master Framework', ar: 'إطار Tahara الرئيسي' },
  fw_ms:   { en: '112 unique controls · 187 mapped requirements',
             ar: '112 ضابطًا فريدًا · 187 متطلبًا مرتبطًا' },
  fw_note: { en: 'A single crosswalk that every supported framework maps onto — built once per control, not once per regulator. Adding a new regional framework extends the map; it doesn’t mean re-asking every question from scratch.',
             ar: 'مسار ربط واحد ترتبط به كل الأطر المدعومة — يُبنى مرة لكل ضابط، لا مرة لكل جهة تنظيمية. إضافة إطار إقليمي جديد توسّع الخريطة، ولا تعني إعادة طرح كل سؤال من الصفر.' },

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

/* The dashboard panels are stills captured from the landing page's live
   dashboard (scripts in /public/dash). The dashboard is a singleton bound to
   #dashTabs/#dashPanel by id, so four live copies would need it extracted into
   a component first — worth doing, not done here. Regenerate these if the
   dashboard's data or layout changes. `flip` puts the image first. */
/* Fixed here rather than read from the dashboard. The counts agree with the
   `conf` table in tahara-engine.js — 33 + 76 + 41 + 37 = 187, the figure the
   master bar quotes — so if that table changes, change these too. */
const FW = [
  { n: 'EU AI Act', c: 33 },
  { n: 'ISO/IEC 42001', c: 76 },
  { n: 'ISO/IEC 23894', c: 41 },
  { n: 'NIST AI RMF', c: 37 },
] as const;

const WHY = [
  { k: 'w1_k', t: 'w1_t', d: 'w1_d', img: 'discover',    flip: false },
  { k: 'w2_k', t: 'w2_t', d: 'w2_d', img: 'govern',      flip: true  },
  { k: 'w3_k', t: 'w3_t', d: 'w3_d', img: 'adversarial', flip: false },
  { k: 'w4_k', t: 'w4_t', d: 'w4_d', img: 'guardrails',  flip: true  },
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

  /* Draw the crosswalk connectors when they scroll into view. Firing on mount
     would spend the animation while the band is still far below the fold. */
  useEffect(() => {
    const el = document.getElementById('fwLink');
    if (!el) return;
    if (!('IntersectionObserver' in window)) { el.classList.add('in'); return; }
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (!e.isIntersecting) return;
          e.target.classList.add('in');
          io.unobserve(e.target);        /* draws once, not on every pass */
        });
      },
      { threshold: 0.35 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

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

        /* why — wider than .wrap so the dashboard stills stay legible; at
           .wrap's 1180px each panel would render near half its captured size */
        .ab-why{padding:78px 0 0}
        .ab-why-wrap{max-width:1500px;margin:0 auto;padding:0 var(--gutter)}
        /* no width cap: at 940px the heading wrapped to two lines, and it is
           short enough to hold one across the section's full width */
        .ab-why-head{text-align:center;margin:0 auto}
        .ab-why-k{font-family:var(--font-mono);font-size:11px;font-weight:500;
          letter-spacing:.18em;text-transform:uppercase;color:var(--g600)}
        .ab-why-head h2{margin-top:18px;font-size:clamp(25px,3vw,40px);line-height:1.18;
          letter-spacing:-.015em;color:var(--ink)}

        .ab-row{display:grid;grid-template-columns:minmax(0,.82fr) minmax(0,1.18fr);
          gap:60px;align-items:center;margin-top:84px}
        /* The widths have to swap with the order. Reordering alone left the
           panel in the narrow column on flipped rows, so alternate rows showed
           the dashboard at two different sizes. */
        .ab-row.is-flip{grid-template-columns:minmax(0,1.18fr) minmax(0,.82fr)}
        .ab-row.is-flip .ab-row-txt{order:2}
        .ab-row.is-flip .ab-row-img{order:1}
        .ab-row-k{display:block;font-family:var(--font-mono);font-size:11px;font-weight:500;
          letter-spacing:.13em;text-transform:uppercase;color:var(--signal);line-height:1.6}
        .ab-row-txt h3{margin-top:14px;font-size:clamp(22px,2.3vw,31px);line-height:1.26;
          letter-spacing:-.01em;color:var(--ink)}
        .ab-row-txt p{margin-top:18px;font-size:16.5px;line-height:1.72;color:var(--ink-2)}
        .ab-row-img img{display:block;width:100%;height:auto;border-radius:16px;
          border:1px solid var(--line);box-shadow:var(--sh-m)}

        @media(max-width:900px){
          .ab-why{padding:56px 0 0}
          /* stack, and always put the words above their panel — flipping the
             order only reads as alternation when the two sit side by side */
          .ab-row{grid-template-columns:1fr;gap:26px;margin-top:56px}
          .ab-row.is-flip .ab-row-txt{order:1}
          .ab-row.is-flip .ab-row-img{order:2}
        }

        /* crosswalk */
        .ab-fw{padding:96px 0 0;text-align:center}
        .ab-fw h2{font-size:clamp(25px,3vw,40px);line-height:1.18;letter-spacing:-.015em;
          color:var(--ink)}
        .ab-fw-tops{margin-top:44px;display:grid;grid-template-columns:repeat(4,1fr);gap:24px}
        .ab-fw-box{background:#fff;border:1px solid var(--line);border-inline-start:3px solid var(--g400);
          border-radius:10px;padding:14px 10px;display:grid;gap:5px;box-shadow:var(--sh-s)}
        .ab-fw-box b{font-weight:500;font-size:16px;color:var(--ink);letter-spacing:-.01em}
        .ab-fw-box span{font-family:var(--font-mono);font-size:11.5px;color:var(--g600)}

        /* connector band — same 4 columns, so each drop sits under its box */
        .ab-fw-link{position:relative;height:132px;display:grid;
          grid-template-columns:repeat(4,1fr);gap:24px}
        /* The lines draw themselves: each is scaled from nothing along its own
           axis, in the order the eye would follow — the four drops fall, the
           rail opens outward from the centre, the node lands, the stem runs
           down to the master bar. */
        .ab-fw-drop{align-self:start;justify-self:center;width:1px;height:66px;
          background:var(--line-2);
          transform:scaleY(0);transform-origin:top;
          transition:transform .52s var(--e-out) calc(var(--i,0) * .09s)}
        .ab-fw-link.in .ab-fw-drop{transform:scaleY(1)}
        /* the rail spans centre-of-first to centre-of-last: with 4 columns and
           a 24px gap each column is (100% - 72px)/4, so half of that is the
           inset on each side */
        .ab-fw-rail{position:absolute;top:66px;height:1px;background:var(--line-2);
          left:calc((100% - 72px)/8);right:calc((100% - 72px)/8);
          transform:scaleX(0);transform-origin:center;
          transition:transform .72s var(--e-out) .4s}
        .ab-fw-link.in .ab-fw-rail{transform:scaleX(1)}
        .ab-fw-node{position:absolute;top:62px;left:50%;width:9px;height:9px;
          margin-left:-4.5px;background:#fff;border:1px solid var(--g400);
          opacity:0;transform:rotate(45deg) scale(.3);
          transition:opacity .3s ease 1.02s,transform .42s var(--e-back) 1.02s}
        .ab-fw-link.in .ab-fw-node{opacity:1;transform:rotate(45deg) scale(1)}
        .ab-fw-stem{position:absolute;top:66px;left:50%;width:1px;height:66px;
          background:var(--line-2);
          transform:scaleY(0);transform-origin:top;
          transition:transform .5s var(--e-out) 1.18s}
        .ab-fw-link.in .ab-fw-stem{transform:scaleY(1)}

        /* nothing moves, everything is simply already drawn */
        @media(prefers-reduced-motion:reduce){
          .ab-fw-drop,.ab-fw-rail,.ab-fw-node,.ab-fw-stem{transition:none;opacity:1;
            transform:none}
          .ab-fw-node{transform:rotate(45deg)}
        }
        .ab-fw-raillabel{position:absolute;top:58px;inset-inline-start:0;
          font-family:var(--font-mono);font-size:10px;font-weight:500;letter-spacing:.14em;
          text-transform:uppercase;color:var(--ink-3)}

        .ab-fw-master{border-radius:12px;padding:18px 22px;display:grid;gap:6px;
          background:linear-gradient(120deg,var(--g900) 0%,var(--g800) 55%,var(--g700) 100%);
          box-shadow:0 12px 30px rgba(3,24,56,.24)}
        .ab-fw-master b{font-weight:600;font-size:17px;color:#fff;letter-spacing:-.01em}
        .ab-fw-master span{font-family:var(--font-mono);font-size:11.5px;letter-spacing:.1em;
          text-transform:uppercase;color:rgba(255,255,255,.72)}
        .ab-fw-note{margin:26px auto 0;max-width:62ch;font-size:14.5px;line-height:1.7;
          color:var(--ink-2)}

        @media(max-width:820px){
          .ab-fw{padding:64px 0 0}
          .ab-fw-card{padding:26px 20px 24px}
          /* two columns, and the rail no longer describes the layout */
          .ab-fw-tops{grid-template-columns:repeat(2,1fr);gap:14px}
          .ab-fw-link{height:44px;display:block}
          .ab-fw-drop,.ab-fw-rail,.ab-fw-node,.ab-fw-raillabel{display:none}
          .ab-fw-stem{top:0;height:44px}
        }

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

        {/* ── why · four problem/answer blocks against dashboard stills ── */}
        <section className="ab-why">
          <div className="ab-why-wrap">
            <div className="ab-why-head">
              <span className="ab-why-k">{tr('why_k', lang)}</span>
              <h2>{tr('why_t', lang)}</h2>
            </div>
            {WHY.map((r) => (
              <div className={'ab-row' + (r.flip ? ' is-flip' : '')} key={r.img}>
                <div className="ab-row-txt">
                  <span className="ab-row-k">{tr(r.k, lang)}</span>
                  <h3>{tr(r.t, lang)}</h3>
                  <p>{tr(r.d, lang)}</p>
                </div>
                <div className="ab-row-img">
                  {/* decorative: the heading and paragraph beside it already
                      carry the meaning, so a description here would just
                      repeat them to a screen reader */}
                  <img src={`/dash/${r.img}.png`} alt="" width={1440} height={760} loading="lazy" />
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ── crosswalk · many frameworks onto one internal model ── */}
        <section className="ab-fw">
          <div className="wrap">
            <h2>{tr('fw_t', lang)}</h2>

            {/* The connectors are laid out with the same 4-column grid as the
                boxes, so every drop line stays under its own box at any width
                instead of being positioned by hand. The lines draw themselves
                in once the band scrolls into view — see the observer below. */}
            <div className="ab-fw-tops">
              {FW.map((f) => (
                <div className="ab-fw-box" key={f.n}>
                  <b>{f.n}</b>
                  <span>{f.c} {tr('fw_req', lang)}</span>
                </div>
              ))}
            </div>

            <div className="ab-fw-link" id="fwLink" aria-hidden="true">
              <span className="ab-fw-raillabel">{tr('fw_rail', lang)}</span>
              {FW.map((f, i) => (
                <span className="ab-fw-drop" key={f.n} style={{ ['--i' as string]: i }} />
              ))}
              <span className="ab-fw-rail" />
              <span className="ab-fw-node" />
              <span className="ab-fw-stem" />
            </div>

            <div className="ab-fw-master">
              <b>{tr('fw_m', lang)}</b>
              <span>{tr('fw_ms', lang)}</span>
            </div>

            <p className="ab-fw-note">{tr('fw_note', lang)}</p>
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
