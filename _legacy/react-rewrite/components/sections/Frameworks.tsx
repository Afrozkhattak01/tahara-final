'use client';

import { useState } from 'react';
import { useLanguage } from '../LanguageProvider';
import { Split } from '../ui/Split';
import { useReveal } from '../hooks';
import { FRAMEWORK_DETAIL, FRAMEWORK_DETAIL_AR } from '@/content/frameworks';
import { Drawer } from './Drawer';

const FRAMEWORKS: [kind: string, name: string][] = [
  ['Management', 'ISO/IEC 42001'], ['Security', 'ISO/IEC 27001'], ['Risk', 'NIST AI RMF'],
  ['Regulation', 'EU AI Act'], ['Application', 'OWASP LLM Top 10'], ['Adversary', 'MITRE ATLAS']
];

const GUIDES = ['card1', 'card2', 'card3'] as const;
const GUIDE_EXT = ['PDF', 'XLSX', 'DOCX'];

export function Frameworks() {
  const { t, lang } = useLanguage();
  const [open, setOpen] = useState<string | null>(null);
  const head = useReveal<HTMLDivElement>();
  const frames = useReveal<HTMLDivElement>();
  const res = useReveal<HTMLDivElement>();

  const source = lang === 'ar' ? FRAMEWORK_DETAIL_AR : FRAMEWORK_DETAIL;
  const raw = open ? source[open] : null;
  const detail = raw ? { kind: raw[0], lede: raw[1], bullets: raw[2] } : null;

  return (
    <section className="band" id="resources">
      <div className="head" ref={head.ref}>
        <span className="eyebrow r-fade"><i />{t('eyebrow.alignment')}</span>
        <Split parts={[{ text: t('frameworks.title') }]} style={{ marginTop: 16 }} />
        <p className="lede r">{t('frameworks.lede')}</p>
      </div>

      <div className={'frames' + (frames.inView ? ' in' : '')} ref={frames.ref}>
        {FRAMEWORKS.map(([kind, name], i) => (
          <div className="seal" key={name} style={{ ['--i' as any]: i }} role="button" tabIndex={0}
               aria-label={`${name} — open mapping detail`}
               onClick={() => setOpen(name)}
               onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setOpen(name); } }}>
            <div className="seal-ring">
              <svg viewBox="0 0 46 46">
                <circle className="bg" cx="23" cy="23" r="20" />
                <circle className="fg" cx="23" cy="23" r="20" />
              </svg>
              <span className="ck"><svg viewBox="0 0 18 18"><path d="M4 9.4 7.3 12.7 14 5.6" /></svg></span>
            </div>
            <div className="k">{kind}</div>
            <div className="v">{name}</div>
          </div>
        ))}
      </div>

      <p className="label r" style={{ marginBottom: 16 }}>{t('guides.label')}</p>
      <div className="res" ref={res.ref}>
        {GUIDES.map((card, i) => (
          <div className={'res-card r' + (res.inView ? ' in' : '')} key={card} style={{ ['--i' as any]: i }}>
            <div className="kind">
              <span className="label">{t(`guides.${card}.kind`)}</span>
              <span className="mono" style={{ fontSize: 11, color: 'var(--ink-3)' }}>{GUIDE_EXT[i]}</span>
            </div>
            <h4>{t(`guides.${card}.title`)}</h4>
            <div className="res-seal">{t('guides.seal')}</div>
          </div>
        ))}
      </div>

      <Drawer name={open} detail={detail} onClose={() => setOpen(null)}
              downloadLabel={t('drawer.download')} mapLabel={t('drawer.maplabel')} />
    </section>
  );
}
