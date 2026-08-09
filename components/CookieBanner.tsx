'use client';

import React, { useEffect, useState } from 'react';
import styles from './CookieBanner.module.css';

/* ════════════════════════════════════════════════════════════
   Cookie banner — FRONT END ONLY.

   What this does: shows the card, remembers that the visitor answered so it
   stops asking, and hides itself.

   What this does NOT do, and must before the site can claim consent:
     · write a real consent record (this stores a UI flag in localStorage, not
       a first-party cookie the server can read)
     · gate the cal.com embed in app/layout.tsx, which today loads on every
       page before the visitor has answered anything
     · link to a cookie policy that exists — POLICY_HREF is a dead route
   ════════════════════════════════════════════════════════════ */

/* Deliberately not named like a consent cookie. It records only that the card
   was dismissed, so re-reviewing the page doesn't nag — nothing reads it to
   decide whether a tracker may run. */
const UI_KEY = 'tahara-cookie-banner-dismissed';

/* The language toggle's key, shared with content/i18n.ts and tahara-engine.js */
const LANG_KEY = 'tahara-lang';

const POLICY_HREF = '/privacy';

const COPY = {
  en: {
    kicker: 'Cookies',
    title: 'We use a small number of cookies.',
    body: 'Some keep the site working. Others help us understand how it is used. You can change your answer at any time.',
    policy: 'Cookie policy',
    accept: 'Accept all',
    reject: 'Reject non-essential',
    label: 'Cookie consent'
  },
  ar: {
    kicker: 'ملفات الارتباط',
    title: 'نستخدم عددًا محدودًا من ملفات الارتباط.',
    body: 'بعضها يُبقي الموقع يعمل، وبعضها يساعدنا على فهم طريقة استخدامه. يمكنك تغيير إجابتك في أي وقت.',
    policy: 'سياسة ملفات الارتباط',
    accept: 'قبول الكل',
    reject: 'رفض غير الضروري',
    label: 'الموافقة على ملفات الارتباط'
  }
} as const;

type Lang = keyof typeof COPY;

export default function CookieBanner() {
  const [open, setOpen] = useState(false);
  const [lang, setLang] = useState<Lang>('en');

  useEffect(() => {
    let answered = false;
    try {
      answered = !!localStorage.getItem(UI_KEY);
    } catch (_) {
      /* private mode / storage blocked — show the card rather than swallow it */
    }
    if (answered) return;

    /* The landing page runs an intro sequence on load; appearing on top of it
       reads as an error dialog. A short hold lets the page settle first. */
    const timer = window.setTimeout(() => setOpen(true), 1200);
    return () => window.clearTimeout(timer);
  }, []);

  /* Language is owned by two different places depending on the route — the
     engine on the landing page, LanguageProvider on /resources. Both write
     dir/lang onto <html>, so watching the element covers every route without
     this component having to know which one is driving. */
  useEffect(() => {
    const read = () => {
      const el = document.documentElement;
      if (el.getAttribute('dir') === 'rtl' || el.getAttribute('lang') === 'ar') return 'ar';
      try {
        if (localStorage.getItem(LANG_KEY) === 'ar') return 'ar';
      } catch (_) {}
      return 'en';
    };

    setLang(read());

    const observer = new MutationObserver(() => setLang(read()));
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['dir', 'lang'] });
    return () => observer.disconnect();
  }, []);

  const dismiss = () => {
    try {
      localStorage.setItem(UI_KEY, '1');
    } catch (_) {}
    setOpen(false);
  };

  if (!open) return null;

  const t = COPY[lang];

  return (
    /* Non-modal: a consent card that trapped focus would lock a keyboard user
       out of the page behind it. role="dialog" without aria-modal announces it
       as a grouped prompt while leaving the rest of the page reachable. */
    <div
      className={styles.banner}
      role="dialog"
      aria-label={t.label}
      aria-describedby="cookie-banner-body"
    >
      <span className={styles.kicker}>
        <i className={styles.dot} aria-hidden="true" />
        {t.kicker}
      </span>

      <p className={styles.title}>{t.title}</p>

      <p className={styles.body} id="cookie-banner-body">
        {t.body}{' '}
        <a className={styles.link} href={POLICY_HREF}>
          {t.policy}
        </a>
      </p>

      <div className={styles.actions}>
        <button type="button" className={`${styles.btn} ${styles.accept}`} onClick={dismiss}>
          {t.accept}
        </button>
        <button type="button" className={`${styles.btn} ${styles.reject}`} onClick={dismiss}>
          {t.reject}
        </button>
      </div>
    </div>
  );
}
