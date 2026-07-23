'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import { useLanguage } from '../LanguageProvider';
import { PLATFORM_MENU, PLATFORM_MENU_AR } from '@/content/platform';

const NAV_KEYS: [href: string, key: string][] = [
  ['#lifecycle', 'nav.lifecycle'],
  ['#stack', 'nav.architecture'],
  ['#resources', 'nav.resources'],
  ['#faq', 'nav.faq'],
];

export function LangSwitch() {
  const { lang, toggle } = useLanguage();
  return (
    <button className="lang-switch" id="langSwitch" aria-label="Switch language" onClick={toggle}>
      <span className={'ls-opt' + (lang === 'en' ? ' on' : '')} data-lang="en">EN</span>
      <span className={'ls-opt' + (lang === 'ar' ? ' on' : '')} data-lang="ar">عربي</span>
    </button>
  );
}

export function Header({
  headerRef,
  progRef,
  magnetic,
}: {
  headerRef: React.RefObject<HTMLElement>;
  progRef: React.RefObject<HTMLSpanElement>;
  magnetic: Record<string, any>;
}) {
  const { t, lang } = useLanguage();
  const [navOpen, setNavOpen] = useState(false);
  const [mega, setMega] = useState(false);
  const [lit, setLit] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);
  const btnRef = useRef<HTMLAnchorElement>(null);
  const openedAt = useRef(0);
  const hideT = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  const hoverable = typeof window !== 'undefined' && matchMedia('(hover:hover) and (pointer:fine)').matches;
  const menu = lang === 'ar' ? PLATFORM_MENU_AR : PLATFORM_MENU;

  const fit = useCallback(() => {
    const p = panelRef.current, h = headerRef.current;
    if (!p || !h) return;
    p.style.maxHeight = Math.max(220, window.innerHeight - h.getBoundingClientRect().bottom - 18) + 'px';
  }, [headerRef]);

  const set = useCallback(
    (v: boolean) => {
      if (v) {
        fit();
        openedAt.current = window.scrollY || 0;
        if (window.innerWidth <= 860) setNavOpen(false);
      }
      setMega(v);
    },
    [fit]
  );

  useEffect(() => {
    if (!mega) { setLit(false); return; }
    let r1 = 0, r2 = 0;
    const light = () => setLit(true);
    r1 = requestAnimationFrame(() => { r2 = requestAnimationFrame(light); });
    const tmo = setTimeout(light, 120);
    return () => { cancelAnimationFrame(r1); cancelAnimationFrame(r2); clearTimeout(tmo); };
  }, [mega]);

  useEffect(() => {
    if (!mega) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') { set(false); btnRef.current?.focus(); }
    };
    const onDoc = (e: MouseEvent) => {
      const p = panelRef.current, btn = btnRef.current;
      if (p && !p.contains(e.target as Node) && btn && !btn.contains(e.target as Node)) set(false);
    };
    const onScroll = () => { if (Math.abs((window.scrollY || 0) - openedAt.current) > 60) set(false); };
    document.addEventListener('keydown', onKey);
    document.addEventListener('click', onDoc);
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', fit);
    return () => {
      document.removeEventListener('keydown', onKey);
      document.removeEventListener('click', onDoc);
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', fit);
    };
  }, [mega, set, fit]);

  useEffect(() => () => clearTimeout(hideT.current), []);

  const show = () => { clearTimeout(hideT.current); if (window.innerWidth > 860) set(true); };
  const hide = () => { clearTimeout(hideT.current); hideT.current = setTimeout(() => set(false), 220); };
  const hold = () => clearTimeout(hideT.current);

  return (
    <>
      <header id="siteHeader" ref={headerRef as any} onMouseLeave={hoverable ? hide : undefined}>
        <nav>
          <a href="#top" className="brand"><span className="brand-mark" aria-hidden="true" />Tahara AI</a>
          <div className={'nav-links' + (navOpen ? ' open' : '')}>
            <a href="#platform" ref={btnRef} className="on has-mega" role="button"
               aria-haspopup="true" aria-expanded={mega} aria-controls="mega"
               onClick={(e) => { e.preventDefault(); set(!mega); }}
               onMouseEnter={hoverable ? show : undefined}
               onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); set(!mega); } }}>
              {t('nav.platform')}
              <svg className="chev" viewBox="0 0 10 10" fill="none" stroke="currentColor" strokeWidth={1.6} aria-hidden="true">
                <path d="M1.6 3.4 5 6.8l3.4-3.4" />
              </svg>
            </a>
            {NAV_KEYS.map(([href, key]) => (
              <a key={href} href={href} onClick={() => setNavOpen(false)}>{t(key)}</a>
            ))}
          </div>
          <div className="nav-right">
            <LangSwitch />
            <a href="#faq" style={{ color: 'var(--ink-2)' }}>{t('nav.signin')}</a>
            <button className="btn btn-solid" {...magnetic}><span>{t('cta.demo')}</span></button>
            <button className="nav-toggle" aria-label="Open menu" aria-expanded={navOpen}
                    onClick={() => { set(false); setNavOpen((o) => !o); }}>
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth={1.6}>
                <path d="M2 5h14M2 9h14M2 13h14" />
              </svg>
            </button>
          </div>
          <span className="prog" ref={progRef} aria-hidden="true" />
        </nav>

        <div id="mega" ref={panelRef} role="region" aria-label="Platform menu"
             className={'mega' + (mega ? ' open' : '') + (lit ? ' lit' : '')}
             onMouseEnter={hoverable ? hold : undefined}
             onMouseLeave={hoverable ? hide : undefined}>
          <div className="mega-card">
            <div className="mega-inner">
              {menu.map(([heading, items], c) => (
                <div className="mega-col" key={heading} style={{ ['--c' as any]: c }}>
                  <div className="mega-h">{heading}</div>
                  {items.map(([mono, title, desc, soon, splitBefore]) => (
                    <a className={'mega-item' + (splitBefore ? ' split' : '')} key={heading + title} href="#platform" onClick={() => set(false)}>
                      <span className="mt">{mono}</span>
                      <span>
                        <b>{title}{soon && <i className="soon">{t('mega.comingsoon')}</i>}</b>
                        <span className="d">{desc}</span>
                      </span>
                    </a>
                  ))}
                </div>
              ))}
              <div className="mega-demo">
                <span className="demo-ic" aria-hidden="true">◆</span>
                <span className="demo-k">{t('mega.demo.k')}</span>
                <h4>{t('mega.demo.title')}</h4>
                <p>{t('mega.demo.desc')}</p>
                <a href="#faq" className="demo-btn" onClick={() => set(false)}>{t('cta.demo')}</a>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className={'mega-scrim' + (mega ? ' on' : '')} aria-hidden="true" onClick={() => set(false)} />
    </>
  );
}
