'use client';

import { useRef, useState, useCallback, useEffect } from 'react';
import { useLanguage } from '../LanguageProvider';
import { Split } from '../ui/Split';
import { useReveal, useReducedMotion } from '../hooks';

const STAGES = ['assess', 'govern', 'test', 'monitor'] as const;

function Tick() {
  return (
    <svg className="tick" viewBox="0 0 16 16">
      <circle cx="8" cy="8" r="7" /><path d="M4.8 8.2 7 10.4l4.2-4.6" />
    </svg>
  );
}

export function Lifecycle() {
  const { t } = useLanguage();
  const reduce = useReducedMotion();
  const railRef = useRef<HTMLDivElement>(null);
  const rowRef = useRef<HTMLDivElement>(null);
  const dotRef = useRef<SVGCircleElement>(null);
  const stopRefs = useRef<(SVGCircleElement | null)[]>([]);
  const cardRefs = useRef<(HTMLElement | null)[]>([]);
  const [geo, setGeo] = useState<{ w: number; xs: number[]; x0: number; x1: number } | null>(null);
  const head = useReveal<HTMLDivElement>();

  const measure = useCallback(() => {
    const rail = railRef.current;
    if (!rail || !cardRefs.current.length) return;
    const b = rail.getBoundingClientRect();
    if (b.width < 10) return;
    const xs = cardRefs.current.filter(Boolean).map(c => {
      const r = c!.getBoundingClientRect();
      return Math.round(r.left - b.left + r.width / 2);
    });
    if (xs.length < 2) return;
    setGeo({ w: Math.round(b.width), xs, x0: xs[0]!, x1: xs[xs.length - 1]! });
  }, []);

  useEffect(() => {
    measure();
    const onResize = () => measure();
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, [measure]);

  // three exclusive states as the row travels through the viewport — only
  // one card is ever "live" at a time; this was a real bug in an earlier
  // pass where a passed card and the active card both read as highlighted
  // with nothing to tell them apart
  useEffect(() => {
    if (reduce || !geo) return;
    let raf = 0;
    const paint = () => {
      raf = 0;
      const rail = railRef.current, row = rowRef.current;
      if (!rail || !row) return;
      const vh = window.innerHeight;
      const r = row.getBoundingClientRect();
      const clamp = (v: number, a: number, b: number) => (v < a ? a : v > b ? b : v);
      const p = clamp((vh * 0.85 - r.top) / (r.height + vh * 0.7), 0, 1);
      rail.style.setProperty('--jp', p.toFixed(3));
      rail.style.setProperty('--jd', p > 0.02 && p < 0.995 ? '1' : '0');
      if (dotRef.current) dotRef.current.setAttribute('cx', (geo.x0 + (geo.x1 - geo.x0) * p).toFixed(1));
      const active = Math.min(3, Math.floor(p * 4));
      stopRefs.current.forEach((st, i) => st?.classList.toggle('lit', p > 0 && i <= active));
      cardRefs.current.forEach((c, i) => {
        if (!c) return;
        c.classList.toggle('live', p > 0 && i === active);
        c.classList.toggle('done', p > 0 && i < active);
        c.classList.toggle('dim', p > 0 && i > active);
      });
    };
    const onScroll = () => { if (!raf) raf = requestAnimationFrame(paint); };
    window.addEventListener('scroll', onScroll, { passive: true });
    paint();
    return () => { window.removeEventListener('scroll', onScroll); cancelAnimationFrame(raf); };
  }, [geo, reduce]);

  return (
    <section className="band" id="lifecycle">
      <div className="head-row" ref={head.ref}>
        <div>
          <span className="eyebrow r-fade"><i />{t('eyebrow.whatwedo')}</span>
          <Split parts={[{ text: t('lifecycle.title') }]} style={{ marginTop: 16 }} />
        </div>
        <p className="lede r">{t('lifecycle.lede')}</p>
      </div>

      <div className="journey" ref={railRef} aria-hidden="true">
        <svg viewBox={geo ? `0 0 ${geo.w} 34` : '0 0 1000 34'}>
          {geo && <>
            <line className="rail" x1={geo.x0} y1="17" x2={geo.x1} y2="17" />
            <line className="run" x1={geo.x0} y1="17" x2={geo.x1} y2="17"
                  style={{ ['--len' as any]: Math.max(1, geo.x1 - geo.x0) }} />
            {geo.xs.map((x, i) => (
              <circle key={i} className="stop" cx={x} cy="17" r="6.5" ref={el => { stopRefs.current[i] = el; }} />
            ))}
            <circle className="dot" cx={geo.x0} cy="17" r="4.5" ref={dotRef} />
          </>}
        </svg>
      </div>

      <div className="life" ref={rowRef}>
        {STAGES.map((stage, i) => (
          <article className="dossier" key={stage} style={{ ['--i' as any]: i }}
                    ref={el => { cardRefs.current[i] = el; }}>
            <span className="tab">
              <span className="no">{String(i + 1).padStart(2, '0')}</span> {t(`dossier.${stage}.stage`)}
              <svg className="tab-check" viewBox="0 0 16 16" aria-hidden="true"><path d="M3.4 8.4 6.6 11.6 12.8 4.8" /></svg>
            </span>
            <div className="dossier-body">
              <h3>{t(`dossier.${stage}.title`)}</h3>
              <div className="d-rule" />
              <ul>
                {[1, 2, 3].map(n => (
                  <li key={n} style={{ ['--j' as any]: n - 1 }}><Tick />{t(`dossier.${stage}.b${n}`)}</li>
                ))}
              </ul>
              <a className="more" href="#resources">{t(`dossier.${stage}.cta`)} <span className="arw">→</span></a>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
