'use client';

import { useState } from 'react';
import { useLanguage } from '../LanguageProvider';
import { Split } from '../ui/Split';
import { MARQUEE_ROW_1, MARQUEE_ROW_2, MARQUEE_GLYPH, MARQUEE_SLUG, GLYPH } from '@/content/connectors';

const DEFAULT_HEX = '6a8a6a';
const HOVER_HEX = '1a3c2a';
const cdnUrl = (slug: string, hex: string) => `https://cdn.simpleicons.org/${slug}/${hex}`;

// Exactly 2x, not 3x: the CSS loop animates translateX(0) → translateX(-50%),
// which only lands seamlessly when the track holds precisely two copies of
// the content. Three copies would make the animation stop a third of the
// way into the third copy and visibly skip on every loop.
function buildTrack(names: string[]) {
  return names.concat(names);
}

function Chip({ name }: { name: string }) {
  const glyph = MARQUEE_GLYPH[name] || 'hex';
  const slug = MARQUEE_SLUG[name];
  const [broken, setBroken] = useState(false);

  return (
    <div className="mchip" tabIndex={0} role="img" aria-label={name}>
      {slug && !broken ? (
        <>
          <img className="mlogo base" alt={name} decoding="async"
               src={cdnUrl(slug, DEFAULT_HEX)} onError={() => setBroken(true)} />
          <img className="mlogo hover" alt="" aria-hidden="true" decoding="async" src={cdnUrl(slug, HOVER_HEX)} />
        </>
      ) : (
        <svg viewBox="0 0 24 24" aria-hidden="true" dangerouslySetInnerHTML={{ __html: (GLYPH[glyph] || GLYPH.hex)! }} />
      )}
      <span className="tip">{name}</span>
    </div>
  );
}

export function Connectors() {
  const { t } = useLanguage();

  return (
    <section className="band-tight connect2">
      <div className="marq-wrap">
        <div className="marq-row dir-l">
          <div className="marq-track">
            {buildTrack(MARQUEE_ROW_1).map((name, i) => <Chip key={name + i} name={name} />)}
          </div>
        </div>
        <div className="marq-row dir-r">
          <div className="marq-track">
            {buildTrack(MARQUEE_ROW_2).map((name, i) => <Chip key={name + i} name={name} />)}
          </div>
        </div>
      </div>

      <div className="connect2-hub">
        <div className="hub-mark" aria-hidden="true">
          <span className="dia" /><b>Tahara AI</b><i>{t('mark.assurance')}</i>
        </div>
        <Split as="h2" parts={[{ text: t('connect.title') }]} />
        <p className="sub">{t('connect.sub')}</p>
        <button className="btn btn-solid">{t('cta.browse')} <span className="arw" aria-hidden="true">→</span></button>
      </div>
    </section>
  );
}
