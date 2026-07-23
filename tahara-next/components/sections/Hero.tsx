'use client';

import { useLanguage } from '../LanguageProvider';
import { useReveal } from '../hooks';
import { Console } from './Console';

/* The headline needs a nested <span class="accent"> around the emphasised
   phrase, and that phrase differs by language — so unlike other headings
   on the page it can't go through the word-by-word Split reveal (which
   requires knowing which words are plain vs accented ahead of time in a
   language-independent way). It gets a plain fade-in instead. This matches
   the vanilla site exactly: there, swapping languages replaces the whole
   innerHTML too, which destroys that heading's word-wrapper spans on every
   toggle — the fade-only treatment isn't a step down from what shipped
   before, it's the same behaviour, applied consistently from the start. */
function HeroTitle() {
  const { tHtml } = useLanguage();
  const { ref, inView } = useReveal<HTMLHeadingElement>();
  return (
    <h1
      ref={ref}
      className={'r' + (inView ? ' in' : '')}
      style={{ ['--i' as any]: 0 }}
      dangerouslySetInnerHTML={{ __html: tHtml('hero.title') }}
    />
  );
}

export function Hero({
  stageRef,
  consoleRef,
  reduce,
  magnetic,
}: {
  stageRef: React.RefObject<HTMLDivElement>;
  consoleRef: React.RefObject<HTMLDivElement>;
  reduce: boolean;
  magnetic: Record<string, any>;
}) {
  const { t } = useLanguage();
  return (
    <div className="wrap" id="top">
      <section className="hero">
        <div className="aura" aria-hidden="true" />
        <HeroTitle />
        <p className="lede r" style={{ ['--i' as any]: 6 }}>{t('hero.lede')}</p>
        <div className="hero-cta r" style={{ ['--i' as any]: 7 }}>
          <button className="btn btn-solid" {...magnetic}>
            <span>{t('cta.demo')}</span> <span className="arw" aria-hidden="true">→</span>
          </button>
          <button className="btn btn-line" {...magnetic}><span>{t('cta.seehow')}</span></button>
        </div>
        <p className="hero-note r" style={{ ['--i' as any]: 8 }}>{t('hero.note')}</p>
        <Console stageRef={stageRef} consoleRef={consoleRef} reduce={reduce} />
      </section>
    </div>
  );
}
