'use client';

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { I18N, ARABIC_FONT_HREF, STORE_KEY, type Lang } from '@/content/i18n';

interface Ctx {
  lang: Lang;
  dir: 'ltr' | 'rtl';
  toggle: () => void;
  /** translate a flat dictionary key */
  t: (key: string) => string;
  /** same, for the rare strings that wrap part of the text in a styled span
      (e.g. the hero headline's accent word) — content is fully our own,
      never user input, so this is a deliberate and safe use of raw HTML */
  tHtml: (key: string) => string;
}

const LanguageContext = createContext<Ctx | null>(null);

const FONT_ID = 'tahara-ar-font';

function ensureArabicFont() {
  if (typeof document === 'undefined') return;
  if (document.getElementById(FONT_ID)) return;
  const link = document.createElement('link');
  link.id = FONT_ID;
  link.rel = 'stylesheet';
  link.href = ARABIC_FONT_HREF;
  document.head.appendChild(link);
}

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLang] = useState<Lang>('en');

  // read the saved preference once, on mount, after hydration
  useEffect(() => {
    let saved: Lang = 'en';
    try {
      saved = (localStorage.getItem(STORE_KEY) as Lang) || 'en';
    } catch (_) {}
    if (saved === 'ar') setLang('ar');
  }, []);

  useEffect(() => {
    document.documentElement.setAttribute('lang', lang);
    document.documentElement.setAttribute('dir', lang === 'ar' ? 'rtl' : 'ltr');
    if (lang === 'ar') ensureArabicFont();
    try {
      localStorage.setItem(STORE_KEY, lang);
    } catch (_) {}
  }, [lang]);

  const toggle = useCallback(() => setLang((l) => (l === 'en' ? 'ar' : 'en')), []);

  const t = useCallback(
    (key: string) => {
      const entry = I18N[key];
      if (!entry) return key; // visible in dev if a key is missing, rather than silently blank
      return entry[lang] || entry.en;
    },
    [lang]
  );

  return (
    <LanguageContext.Provider value={{ lang, dir: lang === 'ar' ? 'rtl' : 'ltr', toggle, t, tHtml: t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error('useLanguage must be used inside <LanguageProvider>');
  return ctx;
}
