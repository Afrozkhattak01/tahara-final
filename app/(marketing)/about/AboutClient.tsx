'use client';

import { useEffect, useState } from 'react';
import AmbientBg from '../AmbientBg';
import PageHero from '../../../components/PageHero';
import SiteHeader from '@/components/SiteHeader';

/**
 * About us.
 *
 * Same shell as /resources — landing.css supplies the tokens and the chrome,
 * the nav and footer are reproduced here because each page owns its own header,
 * and the language follows the same localStorage key the landing toggle writes.
 *
 * ─────────────────────────────────────────────────────────────────────────
 * PLACEHOLDER COPY: every string below marked "TODO copy" is filler and
 * says nothing true about the company. It is deliberately obvious rather than
 * plausible — invented founding dates, headcounts or offices would read as
 * fact and ship as fact. Replace both the en and the ar side of each.
 * ─────────────────────────────────────────────────────────────────────────
 */

type Lang = 'en' | 'ar';

const T = {
  /* nav + chrome — same wording as the other pages */

  /* hero */
  badge: { en: 'Now onboarding pilot teams', ar: 'نستقبل الآن فرق التجربة الأولى' },
  cta:   { en: 'Get a Demo', ar: 'احصل على عرض توضيحي' },
  title:     { en: 'Govern Every AI System Running In Your Company',
               ar: 'احكم كل نظام ذكاء اصطناعي يعمل في شركتك' },
  lead:      { en: 'Tahara AI discovers every AI system in your environment, checks it against the frameworks that actually apply, and produces the evidence to prove it, continuously rather than once a year.',
               ar: 'يكتشف Tahara AI كل نظام ذكاء اصطناعي في بيئتك، ويفحصه وفق الأطر التي تنطبق فعليًا، وينتج الأدلة التي تثبت ذلك، بشكل مستمر، لا مرة واحدة في السنة.' },

  /* why — section header + four problem/answer blocks */
  why_k:  { en: 'Why Tahara AI', ar: 'لماذا Tahara AI' },
  why_t:  { en: "Outcomes You Can Measure, Not Just Promises You're Told",
            ar: 'نتائج يمكنك قياسها، لا مجرد وعود تُقال لك' },

  w1_k: { en: "Problem: you can't govern what you can't see",
          ar: 'المشكلة: لا يمكنك حوكمة ما لا تراه' },
  w1_t: { en: 'Find Every AI System, Not Just the Ones You Approved',
          ar: 'اعثر على كل نظام ذكاء اصطناعي، لا على ما اعتمدته فقط' },
  w1_d: { en: 'AI systems get built in-house, bundled into tools you already pay for, or shipped before anyone signed off. A read-only collector runs inside your own boundary, under your own credentials, and finds every one within a day.',
          ar: 'تُبنى أنظمة الذكاء الاصطناعي داخليًا، أو تأتي مضمّنة في أدوات تدفع ثمنها بالفعل، أو تُطلق قبل أن يوافق عليها أحد. يعمل جامع بيانات للقراءة فقط داخل نطاقك وببيانات اعتمادك، ويجد كل واحد منها خلال يوم.' },

  w2_k: { en: 'Problem: a document is not proof',
          ar: 'المشكلة: الوثيقة ليست دليلًا' },
  w2_t: { en: 'Map Every System to the Law That Actually Applies',
          ar: 'اربط كل نظام بالقانون الذي ينطبق فعلًا' },
  w2_d: { en: 'A policy that says the right thing isn’t a system that does it. Every requirement is checked against your live system, and only marked "Conforming" once a named person confirms it on the record. A machine’s observation can raise a finding, never close one.',
          ar: 'السياسة التي تقول الشيء الصحيح ليست نظامًا يفعله. يُفحص كل متطلب مقابل نظامك الحي، ولا يُوسم بـ«مطابق» إلا بعد أن يؤكده شخص مُسمّى في السجل، يمكن لملاحظة آلية أن تفتح نتيجة، لا أن تغلقها.' },

  w3_k: { en: 'Problem: a yearly pen test misses everything that changed since',
          ar: 'المشكلة: اختبار اختراق سنوي يفوّت كل ما تغيّر بعده' },
  w3_t: { en: 'Attack Your Own System Before Someone Else Does',
          ar: 'هاجم نظامك قبل أن يهاجمه غيرك' },
  w3_d: { en: 'Most red-teaming happens once, months before launch, against a version of the system that no longer exists by the time it ships. Tahara AI runs the OWASP LLM Top 10 against staging on a recurring schedule, so a regression shows up the next cycle, not next year.',
          ar: 'يجري معظم اختبار الفريق الأحمر مرة واحدة، قبل الإطلاق بأشهر، على نسخة لم تعد موجودة وقت الإطلاق. يشغّل Tahara AI قائمة OWASP LLM العشرة على بيئة التجهيز وفق جدول متكرر، فيظهر أي تراجع في الدورة التالية، لا في العام التالي.' },

  w4_k: { en: 'Problem: the leak happens before anyone reviews the transcript',
          ar: 'المشكلة: يقع التسريب قبل أن يراجع أحد النص' },
  w4_t: { en: 'Catch What Leaks Before It Reaches the Model',
          ar: 'أمسك ما يتسرّب قبل أن يصل إلى النموذج' },
  w4_d: { en: 'By the time a privacy review catches a leak, it’s already happened. Guardrails inspect every prompt before it reaches the model, masking and blocking, bilingually in English and Roman Urdu, and logging the rare one that gets through.',
          ar: 'عندما تكتشف مراجعة الخصوصية تسريبًا، يكون قد وقع بالفعل. تفحص حواجز الحماية كل موجّه قبل وصوله إلى النموذج، إخفاءً ومنعًا، بالإنجليزية والأردية بحروف لاتينية، وتسجّل النادر الذي ينفذ.' },

  /* crosswalk */
  fw_t:    { en: 'Built Around One Framework, Not Twelve Separate Ones',
             ar: 'مبنيّ حول إطار واحد، لا اثني عشر إطارًا منفصلًا' },
  fw_req:  { en: 'requirements', ar: 'متطلبًا' },
  fw_more: { en: 'international & regional AI frameworks', ar: 'أطر ذكاء اصطناعي دولية وإقليمية' },
  fw_m:    { en: 'The Tahara Master Framework', ar: 'إطار Tahara الرئيسي' },

  /* key features */
  kf_k:  { en: 'Key features', ar: 'الميزات الرئيسية' },
  kf_t:  { en: 'What Actually Makes Tahara AI Different',
           ar: 'ما الذي يجعل Tahara AI مختلفًا فعلًا' },
  kf_cta:{ en: 'Request Early Access', ar: 'اطلب وصولًا مبكرًا' },

  k1_t: { en: 'Applicability Engine', ar: 'محرك الانطباق' },
  k1_d: { en: 'Figures out exactly which laws and standards apply to a specific system, not a generic checklist.',
          ar: 'يحدّد بدقة أي القوانين والمعايير تنطبق على نظام بعينه، لا قائمة تحقق عامة.' },
  k2_t: { en: 'Discovery Collector', ar: 'جامع الاكتشاف' },
  k2_d: { en: 'Read-only, runs inside your boundary, never holds your credentials, has no inbound path back in.',
          ar: 'للقراءة فقط، يعمل داخل نطاقك، ولا يحتفظ ببيانات اعتمادك، وليس له مسار دخول إليك.' },
  k3_t: { en: 'Claim vs. Reality Triangulation', ar: 'مطابقة الادعاء بالواقع' },
  k3_d: { en: 'Compares what a person said, what the policy states, and what the live system shows. The mismatch is the finding.',
          ar: 'يقارن ما قاله الشخص، وما تنصّ عليه السياسة، وما يُظهره النظام الحي، والتعارض هو النتيجة.' },
  k4_t: { en: 'Continuous Attack Simulation', ar: 'محاكاة هجوم مستمرة' },
  k4_d: { en: 'The OWASP LLM Top 10, run on a recurring schedule against staging, not a once-a-year pen test.',
          ar: 'قائمة OWASP LLM العشرة، تُشغَّل وفق جدول متكرر على بيئة التجهيز، لا اختبار اختراق سنوي.' },
  k5_t: { en: 'Bilingual PII Guardrails', ar: 'حواجز حماية ثنائية اللغة' },
  k5_d: { en: 'Prompt inspection and masking in English and Roman Urdu, before anything reaches the model.',
          ar: 'فحص الموجّهات وإخفاؤها بالإنجليزية والأردية بحروف لاتينية، قبل أن يصل أي شيء إلى النموذج.' },
  k6_t: { en: 'Evidence Locker & Audit Ledger', ar: 'خزانة الأدلة وسجل التدقيق' },
  k6_d: { en: 'Every piece of proof stored and dated, in a hash-chained record that can’t be edited after the fact.',
          ar: 'كل دليل مخزَّن ومؤرَّخ، في سجل مترابط بالبصمات لا يمكن تعديله لاحقًا.' },

  /* the idea */
  id_k:   { en: 'The idea this product is built on', ar: 'الفكرة التي بُني عليها هذا المنتج' },
  id_t1:  { en: 'Compliance is not a photograph. It is a ',
            ar: 'الامتثال ليس صورة فوتوغرافية. إنه ' },
  id_t2:  { en: 'live signal.', ar: 'إشارة حيّة.' },

  id_ck:  { en: 'Every layer', ar: 'كل طبقة' },
  id_cd:  { en: 'Discovery, governance, adversarial testing, and guardrails run as one cycle against the same evidence trail.',
            ar: 'الاكتشاف والحوكمة والاختبار العدائي وحواجز الحماية تعمل كدورة واحدة على مسار الأدلة نفسه.' },
  id_ct:  { en: 'Assurance Across Every Layer of the Stack',
            ar: 'ضمان يمتد عبر كل طبقة من طبقات المنظومة' },
  id_cta: { en: 'See how it fits together', ar: 'شاهد كيف يتكامل الأمر' },

  t1_t: { en: 'See Every System', ar: 'شاهد كل نظام' },
  t1_d: { en: 'Discover every AI system in your environment, including the ones nobody remembered to log.',
          ar: 'اكتشف كل نظام ذكاء اصطناعي في بيئتك، بما فيها ما لم يتذكّر أحد تسجيله.' },
  t2_t: { en: 'Check It Daily', ar: 'افحصه يوميًا' },
  t2_d: { en: 'The full cycle re-runs automatically, so a change is caught within a day, not a year.',
          ar: 'تُعاد الدورة كاملة تلقائيًا، فيُرصد أي تغيير خلال يوم، لا خلال عام.' },
  t3_t: { en: 'Prove It to Anyone', ar: 'أثبته لأي جهة' },
  t3_d: { en: 'One evidence trail, the same record for your team, an auditor, or a regulator.',
          ar: 'مسار أدلة واحد، والسجل نفسه لفريقك أو لمدقّق أو لجهة تنظيمية.' },
  t4_t: { en: 'Never Guess', ar: 'لا تخمّن أبدًا' },
  t4_d: { en: 'A machine’s observation can flag a problem. Only a person can close one.',
          ar: 'يمكن لملاحظة آلية أن تُبلّغ عن مشكلة. ولا يمكن إغلاقها إلا بشخص.' },

  /* closing */

  footer_tagline:   { en: 'Assurance for AI systems.', ar: 'ضمان لأنظمة الذكاء الاصطناعي.' },
  footer_copyright: { en: '© 2026 Tahara AI', ar: '© 2026 Tahara AI' },
  footer_motto:     { en: 'EVIDENCE, NOT ASSURANCES', ar: 'أدلة، لا وعود' },
} as const;

function tr(key: keyof typeof T, lang: Lang) {
  return T[key][lang];
}

/* The dashboard panels are stills captured from the landing page's live
   dashboard (scripts in /public/dash). The dashboard is a singleton bound to
   #dashTabs/#dashPanel by id, so four live copies would need it extracted into
   a component first — worth doing, not done here. Regenerate these if the
   dashboard's data or layout changes. `flip` puts the image first. */
/* Fixed here rather than read from the dashboard. The counts agree with the
   `conf` table in tahara-engine.js — 33 + 76 + 41 + 37 = 187, the figure the
   master bar quotes — so if that table changes, change these too. The 5th
   entry is a summary tile rather than a counted framework, so it carries
   `more: true` instead of a `c` count and renders the fw_more copy line. */
const FW = [
  { n: 'EU AI Act', c: 33 },
  { n: 'ISO/IEC 42001', c: 76 },
  { n: 'ISO/IEC 23894', c: 41 },
  { n: 'NIST AI RMF', c: 37 },
  { n: '50+ More Frameworks', more: true },
] as const;

/* Icons are drawn here in the same 24-box stroke style as the rest of the
   site rather than pulled from an icon set, so they inherit currentColor and
   need no dependency. `pathLength={100}` puts every stroke on the same
   0–100 dash scale so the draw-in stagger below animates them uniformly
   regardless of each icon's actual path length.

   Each one is a distinct pictogram of what the feature does — k1 and k6
   share the same "file with a folded corner" base (applicability reads a
   system, evidence stores the record of it) but diverge from there, and
   k2/k4 no longer reuse the same shield outline (they used to — a radar
   sweep for discovery, a shield-with-target for the attack simulation). */
/* Icons are Lucide (ISC-licensed) at 24×24, so they read as a coherent,
   professionally-drawn set rather than one-off sketches. Every drawable
   element carries pathLength={100} so the scroll-in draw normalises the
   same way across strokes of very different real lengths. */
const KF = [
  /* Applicability Engine — file-search: read a specific system, find the match */
  { t: 'k1_t', d: 'k1_d', ic: <>
      <path d="M14 2v4a2 2 0 0 0 2 2h4" pathLength={100} />
      <path d="M4.268 21a2 2 0 0 0 1.727 1H18a2 2 0 0 0 2-2V7l-5-5H6a2 2 0 0 0-2 2v3" pathLength={100} />
      <path d="m9 18-1.5-1.5" pathLength={100} />
      <circle cx="5" cy="14" r="3" pathLength={100} />
    </> },
  /* Discovery Collector — radar: sweep the environment for what's out there */
  { t: 'k2_t', d: 'k2_d', ic: <>
      <path d="M19.07 4.93A10 10 0 0 0 6.99 3.34" pathLength={100} />
      <path d="M4 6h.01" pathLength={100} />
      <path d="M2.29 9.62A10 10 0 1 0 21.31 8.35" pathLength={100} />
      <path d="M16.24 7.76A6 6 0 1 0 8.23 16.67" pathLength={100} />
      <path d="M12 18h.01" pathLength={100} />
      <path d="M17.99 11.66A6 6 0 0 1 15.77 16.67" pathLength={100} />
      <circle cx="12" cy="12" r="2" pathLength={100} />
      <path d="m13.41 10.59 5.66-5.66" pathLength={100} />
    </> },
  /* Claim vs. Reality Triangulation — waypoints: three sources, one path */
  { t: 'k3_t', d: 'k3_d', ic: <>
      <circle cx="12" cy="4.5" r="2.5" pathLength={100} />
      <path d="m10.2 6.3-3.9 3.9" pathLength={100} />
      <circle cx="4.5" cy="12" r="2.5" pathLength={100} />
      <path d="M7 12h10" pathLength={100} />
      <circle cx="19.5" cy="12" r="2.5" pathLength={100} />
      <path d="m13.8 17.7 3.9-3.9" pathLength={100} />
      <circle cx="12" cy="19.5" r="2.5" pathLength={100} />
    </> },
  /* Continuous Attack Simulation — bug: red-team the system on a schedule */
  { t: 'k4_t', d: 'k4_d', ic: <>
      <path d="m8 2 1.88 1.88" pathLength={100} />
      <path d="M14.12 3.88 16 2" pathLength={100} />
      <path d="M9 7.13v-1a3.003 3.003 0 1 1 6 0v1" pathLength={100} />
      <path d="M12 20c-3.3 0-6-2.7-6-6v-3a4 4 0 0 1 4-4h4a4 4 0 0 1 4 4v3c0 3.3-2.7 6-6 6" pathLength={100} />
      <path d="M12 20v-9" pathLength={100} />
      <path d="M6.53 9C4.6 8.8 3 7.1 3 5" pathLength={100} />
      <path d="M6 13H2" pathLength={100} />
      <path d="M3 21c0-2.1 1.7-3.9 3.8-4" pathLength={100} />
      <path d="M20.97 5c0 2.1-1.6 3.8-3.5 4" pathLength={100} />
      <path d="M22 13h-4" pathLength={100} />
      <path d="M17.2 17c2.1.1 3.8 1.9 3.8 4" pathLength={100} />
    </> },
  /* Bilingual PII Guardrails — shield-check: every prompt validated before it passes */
  { t: 'k5_t', d: 'k5_d', ic: <>
      <path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z" pathLength={100} />
      <path d="m9 12 2 2 4-4" pathLength={100} />
    </> },
  /* Evidence Locker & Audit Ledger — file-lock: a dated record sealed after the fact */
  { t: 'k6_t', d: 'k6_d', ic: <>
      <path d="M13 2.5H6.6A1.6 1.6 0 0 0 5 4.1v15.8A1.6 1.6 0 0 0 6.6 21.5h10.8a1.6 1.6 0 0 0 1.6-1.6V8.2z" pathLength={100} />
      <path d="M13 2.5v4.1a1.5 1.5 0 0 0 1.5 1.5H19" pathLength={100} />
      <rect x="8.9" y="13.4" width="6.2" height="4.8" rx="1.1" pathLength={100} />
      <path d="M10.4 13.4v-1.35a1.6 1.6 0 0 1 3.2 0v1.35" pathLength={100} />
    </> },
] as const;

/* Four tiles docking onto the core. `side` decides which way the rail draws
   and which way the tile travels; the index drives the stagger. */
const TILES = [
  { n: '01', t: 't1_t', d: 't1_d', side: 'l', row: 1 },
  { n: '02', t: 't2_t', d: 't2_d', side: 'l', row: 2 },
  { n: '03', t: 't3_t', d: 't3_d', side: 'r', row: 1 },
  { n: '04', t: 't4_t', d: 't4_d', side: 'r', row: 2 },
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

  /* Draw the crosswalk connectors and the key-features icon stagger when
     they scroll into view. Firing on mount would spend the animation while
     the band is still far below the fold. */
  useEffect(() => {
    const els = ['fwLink', 'ideaGrid']
      .map((id) => document.getElementById(id))
      .filter(Boolean) as HTMLElement[];
    if (!els.length) return;
    if (!('IntersectionObserver' in window)) {
      els.forEach((el) => el.classList.add('in'));
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (!e.isIntersecting) return;
          e.target.classList.add('in');
          io.unobserve(e.target);        /* draws once, not on every pass */
        });
      },
      { threshold: 0.25 }
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);

  /* Key-feature cards reveal individually rather than as one grid: gating
     the icon draw-in on the whole grid becoming visible meant row 2 often
     fired (and finished) off-screen while row 1 was still mid-animation, so
     the two rows never looked like they matched. Each card now gets its own
     .in class the moment it personally scrolls into view, with a short
     3-step stagger that repeats per row (see --i on each cell, set to the
     card's position within its row rather than its position in the grid). */
  useEffect(() => {
    const cells = Array.from(document.querySelectorAll<HTMLElement>('.ab-kf-cell'));
    if (!cells.length) return;
    if (!('IntersectionObserver' in window)) {
      cells.forEach((el) => el.classList.add('in'));
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (!e.isIntersecting) return;
          e.target.classList.add('in');
          io.unobserve(e.target);
        });
      },
      { threshold: 0.35 }
    );
    cells.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, [lang]);

  /* Key-feature cards: click/tap selects a single card (re-tapping the
     selected one clears it) with one quiet settle. No ripple, pop or flash —
     the accent bar, the lift and the icon accent carry the state now.
     Rebuilt as plain DOM handlers since the effect is imperative rather
     than state-driven. */
  useEffect(() => {
    const cards = Array.from(document.querySelectorAll<HTMLElement>('.ab-kf-cell'));
    if (!cards.length) return;

    function activate(card: HTMLElement) {
      card.classList.remove('kf-settle');
      void card.offsetWidth; // restart the settle
      card.classList.add('kf-settle');

      const wasSelected = card.classList.contains('is-selected');
      cards.forEach((c) => {
        c.classList.remove('is-selected');
        c.setAttribute('aria-pressed', 'false');
      });
      if (!wasSelected) {
        card.classList.add('is-selected');
        card.setAttribute('aria-pressed', 'true');
      }
    }

    const cleanups: Array<() => void> = [];
    cards.forEach((card) => {
      card.setAttribute('tabindex', '0');
      card.setAttribute('role', 'button');
      card.setAttribute('aria-pressed', 'false');

      const onClick = () => activate(card);
      const onKeydown = (e: KeyboardEvent) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          activate(card);
        }
      };
      const onAnimEnd = (e: AnimationEvent) => {
        if (e.animationName === 'ab-kf-settle') card.classList.remove('kf-settle');
      };
      card.addEventListener('click', onClick);
      card.addEventListener('keydown', onKeydown);
      card.addEventListener('animationend', onAnimEnd);
      cleanups.push(() => {
        card.removeEventListener('click', onClick);
        card.removeEventListener('keydown', onKeydown);
        card.removeEventListener('animationend', onAnimEnd);
      });
    });

    return () => cleanups.forEach((off) => off());
  }, [lang]);

  return (
    <>
      <AmbientBg />
      <style suppressHydrationWarning>{`
        /* footer — the same compact spacing /resources uses, so the two
           pages end identically rather than one sitting taller */
        footer { padding: 32px 0 18px !important; margin-top: 56px !important; }
        .foot-grid { gap: 24px !important; padding-bottom: 22px !important; }
        .foot-brand p { margin-top: 8px !important; }
        footer h5 { margin-bottom: 10px !important; }
        footer li { margin-bottom: 6px !important; }
        .foot-bottom { padding-top: 14px !important; }

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

        /* crosswalk — 5-box grid with an SVG merging manifold: box1+2 and
           box4+5 merge inward, box3 drops straight, all three converge into
           one stem down to the master bar. Draws with stroke-dashoffset in
           three staggered waves, using the same #fwLink id and the same
           IntersectionObserver-driven .in class as before. */
        .ab-fw{padding:96px 0 0;text-align:center}
        .ab-fw h2{font-size:clamp(25px,3vw,40px);line-height:1.18;letter-spacing:-.015em;
          color:var(--ink)}
        .ab-fw-tops{margin-top:44px;display:grid;grid-template-columns:repeat(5,1fr);gap:20px}
        .ab-fw-box{background:#fff;border:1px solid var(--line);border-radius:12px;
          padding:22px 14px;display:grid;gap:6px;box-shadow:var(--sh-s);
          position:relative;isolation:isolate;
          transition:border-color .25s ease,box-shadow .25s ease,transform .25s ease}
        .ab-fw-box b{font-weight:600;font-size:15px;color:var(--ink);letter-spacing:-.005em}
        .ab-fw-box span{font-family:var(--font-mono);font-size:11px;color:var(--g600);line-height:1.5}
        .ab-fw-box:hover{border-color:var(--line-2);box-shadow:var(--sh-m);transform:translateY(-4px)}

        /* thin rotating gradient ring on each framework card, same treatment
           as the master bar below but subtler — every card runs at a slightly
           different speed/direction so the row doesn't pulse in unison, and
           it pauses under the cursor rather than fighting the hover lift */
        @property --fwc-angle{
          syntax:'<angle>';
          inherits:false;
          initial-value:0deg;
        }
        .ab-fw-box::before{
          content:'';
          position:absolute;inset:0;border-radius:12px;padding:1px;
          background:conic-gradient(from var(--fwc-angle,0deg),
            transparent 0deg,
            rgba(17,64,134,.5) 35deg,
            transparent 90deg,
            transparent 360deg);
          -webkit-mask:linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0);
          -webkit-mask-composite:xor;
          mask-composite:exclude;
          animation:ab-fwc-ring-rotate 11s linear infinite;
          pointer-events:none;
        }
        .ab-fw-tops .ab-fw-box:nth-child(1)::before{animation-duration:11s}
        .ab-fw-tops .ab-fw-box:nth-child(2)::before{animation-duration:12.5s;animation-direction:reverse}
        .ab-fw-tops .ab-fw-box:nth-child(3)::before{animation-duration:13.5s}
        .ab-fw-tops .ab-fw-box:nth-child(4)::before{animation-duration:12s;animation-direction:reverse}
        .ab-fw-tops .ab-fw-box:nth-child(5)::before{animation-duration:14s}
        .ab-fw-box:hover::before{animation-play-state:paused}
        @keyframes ab-fwc-ring-rotate{ to{ --fwc-angle:360deg } }

        .ab-fw-link{position:relative;height:150px}
        .ab-fw-svg{width:100%;height:100%;overflow:visible}
        .ab-fw-seg{fill:none;stroke:var(--line-2);stroke-width:1.5;
          stroke-dasharray:400;stroke-dashoffset:400;
          transition:stroke-dashoffset .55s var(--e-out) calc(var(--i,0) * .22s)}
        .ab-fw-link.in .ab-fw-seg{stroke-dashoffset:0}

        @media(prefers-reduced-motion:reduce){
          .ab-fw-seg{transition:none;stroke-dashoffset:0}
          .ab-fw-box::before{animation:none}
        }

        .ab-fw-master{border-radius:12px;padding:20px 22px;display:grid;
          background:linear-gradient(120deg,var(--g900) 0%,var(--g800) 35%,var(--g700) 60%,var(--g800) 85%,var(--g900) 100%);
          background-size:300% 300%;
          animation:ab-fw-gradient-drift 14s ease infinite;
          position:relative;overflow:hidden;isolation:isolate;
          box-shadow:0 12px 30px rgba(3,24,56,.24);
          transition:box-shadow .3s ease}
        .ab-fw-master b{font-weight:600;font-size:17px;color:#fff;letter-spacing:-.01em;
          position:relative;z-index:1}
        @keyframes ab-fw-gradient-drift{
          0%{background-position:0% 50%}
          50%{background-position:100% 50%}
          100%{background-position:0% 50%}
        }

        /* thin rotating gradient ring on the master bar — restrained, no glow/halo */
        @property --fw-angle{
          syntax:'<angle>';
          inherits:false;
          initial-value:0deg;
        }
        .ab-fw-master::before{
          content:'';
          position:absolute;inset:0;border-radius:12px;padding:1px;
          background:conic-gradient(from var(--fw-angle),
            transparent 0deg,
            rgba(140,180,230,.55) 40deg,
            transparent 90deg,
            transparent 220deg,
            rgba(59,110,165,.45) 280deg,
            transparent 330deg,
            transparent 360deg);
          -webkit-mask:linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0);
          -webkit-mask-composite:xor;
          mask-composite:exclude;
          animation:ab-fw-ring-rotate 8s linear infinite;
          pointer-events:none;
        }
        @keyframes ab-fw-ring-rotate{ to{ --fw-angle:360deg } }
        .ab-fw-master:hover{box-shadow:0 18px 36px rgba(3,24,56,.32)}

        @media(prefers-reduced-motion:reduce){
          .ab-fw-master{animation:none}
          .ab-fw-master::before{animation:none}
        }

        @media(max-width:820px){
          .ab-fw{padding:64px 0 0}
          .ab-fw-tops{grid-template-columns:repeat(2,1fr);gap:14px}
          .ab-fw-link{height:44px}
          .ab-fw-svg{display:none}
        }

        /* ══════════════════════════════════════════════════════════════════
           KEY FEATURES — animation reworked for a sleeker read. One entrance
           motion (rise + icon draw), one hover gesture (a signal hairline
           draws across the top edge, the card lifts on a soft sheen, the icon
           scales and takes the accent), and a quiet settle on click. The old
           ripple/pop/flash and the on-hover border-draw were three competing
           motions per card and have been removed. Layout, grid hairlines,
           --i stagger and breakpoints are unchanged.
           ══════════════════════════════════════════════════════════════════ */
        /* KF accents run on their own blue, not --signal (which is the orange
           accent in this theme). --kf-stroke is the resting card border; the
           icons stay dark blue (--g700) at all times. */
        .ab-kf{padding:96px 0 0;--kf-stroke:rgba(17,64,134,.4);--kf-accent:rgb(17,64,134)}
        .ab-kf-head{display:flex;align-items:flex-end;justify-content:space-between;
          gap:28px;flex-wrap:wrap}
        .ab-kf-head h2{margin-top:0;font-size:clamp(25px,3vw,40px);line-height:1.18;
          letter-spacing:-.015em;color:var(--ink)}
        .ab-kf-cta{display:inline-flex;align-items:center;gap:10px;flex:none;cursor:pointer;
          background:var(--g900);color:#fff;border:none;border-radius:10px;padding:14px 22px;
          font-family:var(--font-body);font-size:14.5px;font-weight:600;letter-spacing:-.01em;
          transition:background .25s ease,box-shadow .3s ease}
        .ab-kf-cta:hover{background:var(--g800);box-shadow:0 10px 26px rgba(3,24,56,.3)}
        .ab-kf-arw{transition:transform .3s var(--e-out)}
        .ab-kf-cta:hover .ab-kf-arw{transform:translateX(3px)}
        [dir="rtl"] .ab-kf-arw{transform:scaleX(-1)}
        [dir="rtl"] .ab-kf-cta:hover .ab-kf-arw{transform:scaleX(-1) translateX(3px)}

        /* one hairline between cells, none on the outer edges — the container
           border already draws those */
        .ab-kf-grid{margin-top:34px;display:grid;grid-template-columns:repeat(3,1fr);
          border:1px solid var(--kf-stroke);border-radius:16px;overflow:hidden}
        /* resting transitions stay clean (no lingering entrance delay), so
           hover fires instantly and identically on every card */
        .ab-kf-cell{padding:30px 30px 34px;
          border-top:1px solid var(--kf-stroke);border-inline-start:1px solid var(--kf-stroke);
          position:relative;isolation:isolate;cursor:pointer;-webkit-tap-highlight-color:transparent;
          background:#fff;opacity:0;
          transition:transform .42s var(--e-out),box-shadow .42s var(--e-out),
                     background .42s ease,border-color .42s ease}
        .ab-kf-cell > *{position:relative;z-index:1}
        .ab-kf-cell:nth-child(-n+3){border-top:none}
        .ab-kf-cell:nth-child(3n+1){border-inline-start:none}
        .ab-kf-cell:focus{outline:none}
        .ab-kf-cell:focus-visible{box-shadow:0 0 0 2px rgba(3,24,56,.35),var(--sh-m)}

        /* the single accent gesture — one blue hairline that draws across
           the top edge from the inline-start on hover/select */
        .ab-kf-cell::before{content:'';position:absolute;top:0;inset-inline:0;height:2px;
          background:linear-gradient(90deg,var(--kf-accent),
            color-mix(in srgb,var(--kf-accent) 18%,transparent));
          transform:scaleX(0);transform-origin:left;
          transition:transform .5s var(--e-out);z-index:3}
        [dir="rtl"] .ab-kf-cell::before{transform-origin:right}
        .ab-kf-cell:hover::before,
        .ab-kf-cell.is-selected::before{transform:scaleX(1)}

        .ab-kf-icwrap{position:relative;width:26px;height:26px}
        /* soft blue-tinted halo behind the icon, blooms with the lift */
        .ab-kf-icwrap::after{
          content:'';position:absolute;inset:-12px;border-radius:50%;
          background:radial-gradient(circle,
            color-mix(in srgb,var(--kf-accent) 16%,transparent),transparent 70%);
          opacity:0;transform:scale(.6);pointer-events:none;
          transition:opacity .45s ease,transform .45s var(--e-out)}
        .ab-kf-ic{width:100%;height:100%;color:var(--g700);
          transition:color .4s ease,transform .4s var(--e-out)}

        /* Hover and select run one identical motion: the card lifts on a soft
           sheen, the icon scales and takes the signal accent, the halo blooms.
           Select just persists that state with a fainter signal tint. Same
           -4px lift the section already used, so nothing new clips against the
           grid's overflow. */
        .ab-kf-cell:hover,
        .ab-kf-cell.is-selected{transform:translateY(-4px);box-shadow:var(--sh-m);
          background:linear-gradient(180deg,#fff 0%,var(--paper) 100%);z-index:2}
        .ab-kf-cell.is-selected{
          background:linear-gradient(180deg,#fff 0%,
            color-mix(in srgb,var(--kf-accent) 6%,#fff) 100%)}
        .ab-kf-cell:hover .ab-kf-ic,
        .ab-kf-cell.is-selected .ab-kf-ic{transform:scale(1.08)}
        .ab-kf-cell:hover .ab-kf-icwrap::after,
        .ab-kf-cell.is-selected .ab-kf-icwrap::after{opacity:1;transform:scale(1)}

        .ab-kf-cell b{display:block;margin-top:20px;font-weight:600;font-size:17px;
          letter-spacing:-.01em;color:var(--ink)}
        .ab-kf-cell p{margin-top:10px;font-size:15px;line-height:1.65;color:var(--ink-2)}

        /* ── entrance ──
           One motion: each card rises and fades in a per-column stagger, its
           icon strokes drawing in just behind, then inking from grey to navy.
           Run as keyframes with a backwards fill so the resting state stays
           clean and the hover transition never inherits the delay. Each card
           gets its own .in class the moment it scrolls into view (effect
           above); --i is its position within its own row (0/1/2), so both
           rows run the identical three-step rhythm. */
        @keyframes ab-kf-rise{
          from{opacity:0;transform:translateY(20px)}
          to{opacity:1;transform:translateY(0)}
        }
        .ab-kf-cell.in{opacity:1;
          animation:ab-kf-rise .62s var(--e-out) calc(var(--i,0) * .09s) backwards}

        .ab-kf-ic path,.ab-kf-ic circle,.ab-kf-ic rect{
          stroke-dasharray:100;stroke-dashoffset:100;
          transition:stroke-dashoffset .7s var(--e-out)}
        .ab-kf-cell.in .ab-kf-ic path,
        .ab-kf-cell.in .ab-kf-ic circle,
        .ab-kf-cell.in .ab-kf-ic rect{
          stroke-dashoffset:0;
          transition-delay:calc(var(--i,0) * .09s + .18s)}
        .ab-kf-cell.in .ab-kf-ic{
          animation:ab-kf-ink .5s ease calc(var(--i,0) * .09s + .62s) backwards}
        @keyframes ab-kf-ink{
          from{color:var(--line-2)}
          to{color:var(--g700)}
        }

        /* ── click ── a single quiet settle, no ripple or rotation. The lift
           is held at -4px through the settle so it reads as a press, not a
           jump. */
        @keyframes ab-kf-settle{
          0%{transform:translateY(-4px) scale(1)}
          42%{transform:translateY(-4px) scale(.986)}
          100%{transform:translateY(-4px) scale(1)}
        }
        .ab-kf-cell.kf-settle{animation:ab-kf-settle .26s var(--e-out)}

        @media(prefers-reduced-motion:reduce){
          .ab-kf-cell{opacity:1;animation:none !important}
          .ab-kf-ic path,.ab-kf-ic circle,.ab-kf-ic rect{transition:none;stroke-dashoffset:0}
          .ab-kf-ic{transition:none;color:var(--g700)}
          .ab-kf-cell::before{transition:transform .2s ease}
          .ab-kf-cell:hover,.ab-kf-cell.is-selected{transform:none}
          .ab-kf-cell.kf-settle{animation:none}
        }

        @media(max-width:900px){
          .ab-kf{padding:64px 0 0}
          .ab-kf-grid{grid-template-columns:repeat(2,1fr)}
          .ab-kf-cell:nth-child(-n+3){border-top:1px solid var(--kf-stroke)}
          .ab-kf-cell:nth-child(3n+1){border-inline-start:1px solid var(--kf-stroke)}
          .ab-kf-cell:nth-child(-n+2){border-top:none}
          .ab-kf-cell:nth-child(2n+1){border-inline-start:none}
        }
        @media(max-width:600px){
          .ab-kf-grid{grid-template-columns:1fr}
          .ab-kf-cell{padding:24px 22px 26px;border-inline-start:none !important}
          .ab-kf-cell:first-child{border-top:none}
          .ab-kf-cell:nth-child(n+2){border-top:1px solid var(--kf-stroke)}
          .ab-kf-cta{width:100%;justify-content:center}
        }

        /* ── the idea ── */
        .ab-idea{padding:96px 0 0;text-align:center}
        .ab-idea-k{font-family:var(--font-mono);font-size:11px;font-weight:500;
          letter-spacing:.18em;text-transform:uppercase;color:var(--ink-3)}
        .ab-idea h2{margin-top:18px;font-size:clamp(23px,2.7vw,34px);line-height:1.24;
          letter-spacing:-.015em;color:var(--ink)}
        .ab-idea h2 em{font-style:italic;color:var(--g600)}

        /* Five columns: tile · rail · core · rail · tile. The rail columns are
           real grid tracks, so each rail always spans exactly the gap between
           its tile and the core at any width. */
        .ab-idea-grid{margin-top:52px;display:grid;
          grid-template-columns:1fr 108px minmax(0,1.3fr) 108px 1fr;
          grid-template-rows:1fr 1fr;border:1px solid var(--line);text-align:start;
          /* the tiles rest at translateX(+-26px) until they dock, which pushes the
             left one past the viewport edge and widens the document; clip it so
             they slide in from behind the frame instead */
          overflow:hidden;
          background-image:linear-gradient(rgba(17,64,134,.05) 1px,transparent 1px),
                           linear-gradient(90deg,rgba(17,64,134,.05) 1px,transparent 1px);
          background-size:54px 54px}

        .ab-tile{background:var(--paper);border:1px solid var(--line);padding:26px 26px 30px;
          display:flex;flex-direction:column;justify-content:center;
          opacity:0;transition:opacity .5s ease,transform .6s var(--e-out)}
        .ab-tile.is-l{grid-column:1;transform:translateX(-26px)}
        .ab-tile.is-r{grid-column:5;transform:translateX(26px)}
        .ab-tile.r1{grid-row:1} .ab-tile.r2{grid-row:2}
        .ab-tile-n{font-family:var(--font-mono);font-size:10.5px;letter-spacing:.14em;
          color:var(--ink-3)}
        .ab-tile b{margin-top:12px;font-weight:600;font-size:16.5px;letter-spacing:-.01em;
          color:var(--ink)}
        .ab-tile p{margin-top:9px;font-size:14.5px;line-height:1.6;color:var(--ink-2)}

        .ab-rail{position:relative;display:grid;place-items:center}
        .ab-rail.is-l{grid-column:2} .ab-rail.is-r{grid-column:4}
        .ab-rail.r1{grid-row:1} .ab-rail.r2{grid-row:2}
        .ab-rail-line{width:100%;height:1px;background:var(--line-2);
          transform:scaleX(0);transition:transform .45s var(--e-out)}
        /* the rail draws from the tile's slot toward the core */
        .ab-rail.is-l .ab-rail-line{transform-origin:left}
        .ab-rail.is-r .ab-rail-line{transform-origin:right}
        .ab-rail-dock{position:absolute;width:7px;height:7px;border-radius:50%;
          background:var(--g600);opacity:0;transform:scale(.3)}
        .ab-rail.is-l .ab-rail-dock{left:-3.5px}
        .ab-rail.is-r .ab-rail-dock{right:-3.5px}

        /* dock along the rail: rail draws, tile slides in along it, dock flashes */
        .ab-idea-grid.in .ab-rail-line{transform:scaleX(1);
          transition-delay:calc(var(--i,0) * .16s)}
        .ab-idea-grid.in .ab-tile{opacity:1;transform:translateX(0);
          transition-delay:calc(var(--i,0) * .16s + .34s)}
        .ab-idea-grid.in .ab-rail-dock{animation:ab-dock .55s var(--e-back)
          calc(var(--i,0) * .16s + .72s) forwards}
        @keyframes ab-dock{
          0%{opacity:0;transform:scale(.3);box-shadow:0 0 0 0 rgba(17,64,134,.35)}
          45%{opacity:1;transform:scale(1.5);box-shadow:0 0 0 7px rgba(17,64,134,0)}
          100%{opacity:1;transform:scale(1);box-shadow:0 0 0 0 rgba(17,64,134,0)}
        }

        .ab-core{grid-column:3;grid-row:1 / span 2;padding:44px 38px;text-align:center;
          display:flex;flex-direction:column;align-items:center;justify-content:center}
        .ab-core-k{font-family:var(--font-mono);font-size:10.5px;font-weight:500;
          letter-spacing:.18em;text-transform:uppercase;color:var(--ink-3)}
        .ab-core h3{margin-top:16px;font-size:clamp(24px,2.5vw,34px);line-height:1.2;
          letter-spacing:-.015em;color:var(--ink)}
        .ab-core p{margin-top:16px;max-width:42ch;font-size:15px;line-height:1.65;
          color:var(--ink-2)}
        .ab-core-cta{margin-top:26px;display:inline-flex;align-items:center;gap:10px;
          background:var(--g800);color:#fff;border-radius:10px;padding:13px 22px;
          font-size:14.5px;font-weight:600;letter-spacing:-.01em;
          transition:background .25s ease,box-shadow .3s ease}
        .ab-core-cta:hover{background:var(--g900);box-shadow:0 10px 26px rgba(3,24,56,.3)}

        @media(prefers-reduced-motion:reduce){
          .ab-tile{opacity:1;transform:none;transition:none}
          .ab-rail-line{transform:scaleX(1);transition:none}
          .ab-rail-dock{opacity:1;transform:scale(1);animation:none}
        }
        @media(max-width:900px){
          .ab-idea{padding:64px 0 0}
          /* the rails describe a left/right relationship that stacking removes */
          .ab-idea-grid{grid-template-columns:1fr;grid-template-rows:none;margin-top:36px}
          .ab-tile,.ab-core{grid-column:1 !important}
          .ab-tile.is-l,.ab-tile.is-r{transform:translateY(18px)}
          .ab-idea-grid.in .ab-tile{transform:translateY(0)}
          .ab-tile.r1,.ab-tile.r2{grid-row:auto}
          .ab-core{grid-row:auto;order:-1;padding:32px 24px}
          .ab-rail{display:none}
        }
      `}</style>

      <SiteHeader lang={lang} active="about" />

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
        <section className="ab-fw" id="crosswalk">
          <div className="wrap">
            <h2>{tr('fw_t', lang)}</h2>

            {/* Five boxes now instead of four — the last one is a summary
                tile ("50+ More Frameworks") rather than a counted framework,
                so it renders the fw_more copy line instead of a count. Each
                one carries a slow rotating gradient ring (CSS, keyed off
                nth-child so the row doesn't pulse in sync) and lifts on hover. */}
            <div className="ab-fw-tops">
              {FW.map((f) => (
                <div className="ab-fw-box" key={f.n}>
                  <b>{f.n}</b>
                  {'more' in f
                    ? <span>{tr('fw_more', lang)}</span>
                    : <span>{f.c} {tr('fw_req', lang)}</span>}
                </div>
              ))}
            </div>

            {/* Connector is a single SVG that draws itself in three staggered
                waves once the section scrolls into view. The stagger runs in
                reverse of the visual order — the stem into the master bar
                fires first (--i:0), then the two inward merges (--i:1), then
                the box drops last (--i:2) — so the draw reads as originating
                at the master bar and climbing up to the five boxes, rather
                than raining down onto it. Same #fwLink id, so the existing
                IntersectionObserver above still triggers the .in class. */}
            <div className="ab-fw-link" id="fwLink" aria-hidden="true">
              <svg viewBox="0 0 1000 150" preserveAspectRatio="none" className="ab-fw-svg">
                <path className="ab-fw-seg" style={{ ['--i' as string]: 2 }} d="M100,0 L100,40" />
                <path className="ab-fw-seg" style={{ ['--i' as string]: 2 }} d="M300,0 L300,40" />
                <path className="ab-fw-seg" style={{ ['--i' as string]: 2 }} d="M500,0 L500,40" />
                <path className="ab-fw-seg" style={{ ['--i' as string]: 2 }} d="M700,0 L700,40" />
                <path className="ab-fw-seg" style={{ ['--i' as string]: 2 }} d="M900,0 L900,40" />

                <path className="ab-fw-seg" style={{ ['--i' as string]: 1 }} d="M100,40 L100,55 L300,55 L300,40" />
                <path className="ab-fw-seg" style={{ ['--i' as string]: 1 }} d="M700,40 L700,55 L900,55 L900,40" />
                <path className="ab-fw-seg" style={{ ['--i' as string]: 1 }} d="M200,55 L200,75" />
                <path className="ab-fw-seg" style={{ ['--i' as string]: 1 }} d="M800,55 L800,75" />
                <path className="ab-fw-seg" style={{ ['--i' as string]: 1 }} d="M500,40 L500,75" />

                <path className="ab-fw-seg" style={{ ['--i' as string]: 0 }} d="M200,75 L200,95 L500,95 L500,75" />
                <path className="ab-fw-seg" style={{ ['--i' as string]: 0 }} d="M800,75 L800,95 L500,95 L500,75" />
                <path className="ab-fw-seg" style={{ ['--i' as string]: 0 }} d="M500,95 L500,150" />
              </svg>
            </div>

            {/* master bar: slow gradient drift behind the label plus a thin
                rotating conic-gradient ring along the border */}
            <div className="ab-fw-master">
              <b>{tr('fw_m', lang)}</b>
            </div>
          </div>
        </section>

        {/* ── key features ── */}
        <section className="ab-kf">
          <div className="wrap">
            <div className="ab-kf-head">
              <div>
                <h2>{tr('kf_t', lang)}</h2>
              </div>
              {/* Inert for now — no destination decided. It looks like a
                  control, so it should be wired or removed before launch. */}
              <button className="ab-kf-cta" type="button">
                <span>{tr('kf_cta', lang)}</span>
                <span className="ab-kf-arw" aria-hidden="true">→</span>
              </button>
            </div>

            {/* Each cell: an icon that draws in (stroke-dasharray) once that
                specific card scrolls into view, a signal hairline that draws
                across the top edge on hover/select, and a soft lift. --i is
                the card's position within its own row (i % 3), so every row
                runs the same three-step stagger instead of the bottom row
                inheriting extra delay from the top row's count. Click handling
                (settle + single-select) is wired imperatively in the effect
                above. */}
            <div className="ab-kf-grid">
              {KF.map((f, i) => (
                <div className="ab-kf-cell" key={f.t} style={{ ['--i' as string]: i % 3 }}>
                  <div className="ab-kf-icwrap">
                    <svg className="ab-kf-ic" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                         strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      {f.ic}
                    </svg>
                  </div>
                  <b>{tr(f.t, lang)}</b>
                  <p>{tr(f.d, lang)}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── the idea · four tiles docking onto a core ── */}
        <section className="ab-idea">
          <div className="wrap">
            <span className="ab-idea-k">{tr('id_k', lang)}</span>
            <h2>{tr('id_t1', lang)}<em>{tr('id_t2', lang)}</em></h2>

            <div className="ab-idea-grid" id="ideaGrid">
              {TILES.map((t, i) => (
                <div className={`ab-tile is-${t.side} r${t.row}`} key={t.n}
                     style={{ ['--i' as string]: i }}>
                  <span className="ab-tile-n">{t.n}</span>
                  <b>{tr(t.t, lang)}</b>
                  <p>{tr(t.d, lang)}</p>
                </div>
              ))}

              {/* the rails each tile docks along */}
              {TILES.map((t, i) => (
                <div className={`ab-rail is-${t.side} r${t.row}`} key={'r' + t.n}
                     style={{ ['--i' as string]: i }} aria-hidden="true">
                  <span className="ab-rail-line" />
                  <span className="ab-rail-dock" />
                </div>
              ))}

              <div className="ab-core">
                <span className="ab-core-k">{tr('id_ck', lang)}</span>
                <h3>{tr('id_ct', lang)}</h3>
                <p>{tr('id_cd', lang)}</p>
                {/* points at the crosswalk diagram above — the section that
                    literally shows how the pieces fit together */}
                <a className="ab-core-cta" href="#crosswalk">
                  <span>{tr('id_cta', lang)}</span>
                  <span className="ab-kf-arw" aria-hidden="true">→</span>
                </a>
              </div>
            </div>
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
