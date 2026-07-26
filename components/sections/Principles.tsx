'use client';

import { useLanguage } from '../LanguageProvider';
import { Split } from '../ui/Split';
import { useReveal } from '../hooks';

const COLS = ['col1', 'col2', 'col3'] as const;

export function Principles() {
  const { t } = useLanguage();
  const head = useReveal<HTMLDivElement>();
  const scale = useReveal<HTMLDivElement>();
  const wrap = useReveal<HTMLDivElement>();

  return (
    <section className="band">
      <div className="head" ref={head.ref}>
        <Split parts={[{ text: t('principles.title') }]} />
      </div>
      <div className={'scale-wrap' + (wrap.inView ? ' in' : '')} ref={wrap.ref}>
        <div className={'scale' + (scale.inView ? ' in' : '')} ref={scale.ref}>
          <div className="scale-rule" />
          <div className="notches" aria-hidden="true">
            {[0, 1, 2].map(i => <span className="notch" key={i} style={{ ['--i' as any]: i }}><i /></span>)}
          </div>
        </div>
        <div className="cols">
          {COLS.map((col, i) => (
            <div className="col" key={col} style={{ ['--i' as any]: i }}>
              <span className="n"><span>{String(i + 1).padStart(2, '0')}</span></span>
              <Split as="h3" parts={[{ text: t(`principles.${col}.title`) }]} />
              <p className="r-fade" style={{ ['--i' as any]: 4 + i }}>{t(`principles.${col}.body`)}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
