'use client';

import { useLanguage } from '../LanguageProvider';
import { Split } from '../ui/Split';
import { useReveal } from '../hooks';

const STRIP_KEYS = ['strip.tenancy', 'strip.nomodel', 'strip.reportweek'];

export function ClosingCta() {
  const { t } = useLanguage();
  const { ref, inView } = useReveal<HTMLDivElement>();

  return (
    <section className="band-tight">
      <div className={'close-cta' + (inView ? ' in' : '')} ref={ref}>
        <span className="floor" aria-hidden="true" />
        <span className="cta-halo" aria-hidden="true" />
        <span className="cta-dia" aria-hidden="true" />
        <Split parts={[{ text: t('cta.title') }]} />
        <p>{t('cta.body')}</p>
        <div className="row">
          <button className="btn btn-pale">{t('cta.demo')} <span className="arw" aria-hidden="true">→</span></button>
          <button className="btn btn-clear">{t('cta.talkeng')}</button>
        </div>
        <div className="cta-strip">
          {STRIP_KEYS.map((key, i) => (
            <span key={key} style={{ ['--i' as any]: i }}>
              <svg viewBox="0 0 16 16" aria-hidden="true"><path d="M3.4 8.4 6.6 11.6 12.8 4.8" /></svg>{t(key)}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
