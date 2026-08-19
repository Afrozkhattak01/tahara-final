'use client';

import { useState, useRef, useLayoutEffect, useCallback, useEffect } from 'react';
import { useLanguage } from '../LanguageProvider';
import { Split } from '../ui/Split';
import { useReveal } from '../hooks';
import { ANSWERS, ANSWERS_AR } from '@/content/faq';

const QUESTION_KEYS = ['faq.q1', 'faq.q2', 'faq.q3', 'faq.q4', 'faq.q5', 'faq.q6'];

function Helpful({ resetKey }: { resetKey: number }) {
  const { t } = useLanguage();
  const [done, setDone] = useState<'up' | 'down' | null>(null);

  useEffect(() => setDone(null), [resetKey]);

  return (
    <div className={'helpful' + (done ? ' done' : '')}>
      <span>{done ? t('faq.thanks') : t('faq.helpful')}</span>
      {(['up', 'down'] as const).map(v => (
        <button key={v} className={'vote' + (done === v ? ' hit' : '')}
                aria-label={v === 'up' ? 'Yes, helpful' : 'No, not helpful'}
                onClick={() => !done && setDone(v)}>
          {v === 'up'
            ? <svg viewBox="0 0 16 16"><path d="M5 14V7l3.4-5c.9 0 1.6.8 1.4 1.7L9.3 6h3.3c.9 0 1.6.9 1.4 1.8l-1 4.6c-.2.9-.9 1.6-1.8 1.6Z" /><path d="M5 7H2.6v7H5" /></svg>
            : <svg viewBox="0 0 16 16"><path d="M11 2v7l-3.4 5c-.9 0-1.6-.8-1.4-1.7L6.7 10H3.4c-.9 0-1.6-.9-1.4-1.8l1-4.6C3.2 2.7 3.9 2 4.8 2Z" /><path d="M11 9h2.4V2H11" /></svg>}
        </button>
      ))}
    </div>
  );
}

export function Faq() {
  const { t, lang } = useLanguage();
  const [active, setActive] = useState(0);
  const btnRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const [slide, setSlide] = useState({ top: 0, height: 0 });
  const head = useReveal<HTMLDivElement>();
  const idx = useReveal<HTMLDivElement>();
  const panel = useReveal<HTMLDivElement>();

  const answers = lang === 'ar' ? ANSWERS_AR : ANSWERS;

  const place = useCallback((i: number) => {
    const btn = btnRefs.current[i], box = idx.ref.current;
    if (!btn || !box) return;
    const r = btn.getBoundingClientRect(), pr = box.getBoundingClientRect();
    setSlide({ top: r.top - pr.top + 12, height: Math.max(0, r.height - 24) });
  }, [idx.ref]);

  useLayoutEffect(() => { place(active); }, [active, place]);
  useEffect(() => {
    const on = () => place(active);
    window.addEventListener('resize', on);
    return () => window.removeEventListener('resize', on);
  }, [active, place]);

  const onKey = (e: React.KeyboardEvent) => {
    if (e.key !== 'ArrowDown' && e.key !== 'ArrowUp') return;
    e.preventDefault();
    const n = (active + (e.key === 'ArrowDown' ? 1 : -1) + QUESTION_KEYS.length) % QUESTION_KEYS.length;
    setActive(n);
    btnRefs.current[n]?.focus();
  };

  return (
    <section className="band" id="faq">
      <div className="head" ref={head.ref}>
        <span className="eyebrow r-fade"><i />{t('eyebrow.answers')}</span>
        <Split parts={[{ text: t('faq.title') }]} style={{ marginTop: 16 }} />
      </div>

      <div className="faq-grid">
        <div className={'q-index r' + (idx.inView ? ' in' : '')} ref={idx.ref} role="tablist">
          <span className="q-slide" aria-hidden="true" style={{ top: slide.top + 'px', height: slide.height + 'px' }} />
          {QUESTION_KEYS.map((key, i) => (
            <button key={key} role="tab" ref={el => { btnRefs.current[i] = el; }}
                    className={'q-item' + (i === active ? ' on' : '')} aria-selected={i === active}
                    onClick={() => setActive(i)} onKeyDown={onKey}>
              <span className="k">{String(i + 1).padStart(2, '0')}</span>
              <span>{t(key)}{i < 2 && <span className="most">{t('faq.mostasked')}</span>}</span>
              <span className="cv arw">→</span>
            </button>
          ))}
        </div>

        <div className={'q-panel r' + (panel.inView ? ' in' : '')} style={{ ['--i' as any]: 1 }} ref={panel.ref}>
          <span className="mesh" aria-hidden="true" />
          <div className="q-head"><span className="label">{t('faq.answer')} · {String(active + 1).padStart(2, '0')}</span></div>
          <div className="q-a show" key={active}>
            {(answers[active] ?? []).map((line, j) => (
              <span className="ln" key={j}><i style={{ ['--li' as any]: j }}>{line}</i></span>
            ))}
          </div>
          <Helpful resetKey={active} />
          <div className="q-foot">
            <span>{t('faq.stillnot')}</span>
            <button className="btn btn-line">{t('cta.askteam')} <span className="arw" aria-hidden="true">→</span></button>
          </div>
        </div>
      </div>
    </section>
  );
}
