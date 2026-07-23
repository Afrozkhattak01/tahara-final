'use client';

import { useLanguage } from '../LanguageProvider';
import { STANDARDS } from '@/content/misc';
import { ProofBar } from './ProofBar';

function track(key: number) {
  return (
    <div className="mq-track" key={key}>
      {STANDARDS.map(s => (
        <span className="mq-item" key={s}><i />{s}</span>
      ))}
    </div>
  );
}

export function Marquee() {
  const { t } = useLanguage();
  return (
    <section className="strip">
      <ProofBar />
      <p className="label">{t('standards.label')}</p>
      <div className="marquee" aria-hidden="true">
        {track(0)}
        {track(1)}
      </div>
    </section>
  );
}
