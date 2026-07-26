'use client';

import { useLanguage } from '../LanguageProvider';
import { Split } from '../ui/Split';
import { useReveal } from '../hooks';

const CORNERS = ['tl', 'tr', 'bl', 'br'] as const;
const BLIPS: [left: string, top: string, unk: boolean, delay: number][] = [
  ['32%', '28%', false, 0.4], ['70%', '40%', false, 0.6], ['56%', '74%', false, 0.8],
  ['24%', '62%', false, 1], ['80%', '70%', true, 1.2], ['18%', '44%', true, 1.4]
];
const PROBES: [ang: string, len: string, delay: number][] = [
  ['33.9deg', '81px', 0], ['190.6deg', '74px', 1.5], ['-26.5deg', '51px', 3]
];
const SPARKS: [dx: string, dy: string][] = [
  ['-22px', '-18px'], ['16px', '-24px'], ['26px', '6px'], ['-14px', '14px'], ['6px', '22px'], ['-28px', '-2px']
];

export function RecordPanels() {
  const { t } = useLanguage();
  const { ref, inView } = useReveal<HTMLDivElement>();
  const c0 = useReveal<HTMLElement>();
  const c1 = useReveal<HTMLElement>();
  const c2 = useReveal<HTMLElement>();
  const inCls = (v: boolean) => (v ? ' in' : '');

  return (
    <section className="band" id="platform">
      <div className="head">
        <span className="eyebrow r-fade"><i />{t('eyebrow.platform')}</span>
        <Split parts={[{ text: t('platform.title') }]} style={{ marginTop: 16 }} />
        <p className="lede r">{t('platform.lede')}</p>
      </div>

      <div className="recs" ref={ref}>
        <article className={'rec rec-tall r' + inCls(inView)} style={{ ['--i' as any]: 0 }} ref={c0.ref as any}>
          <span className="rec-mesh" aria-hidden="true" />
          {CORNERS.map(cn => <span key={cn} className={'cnr ' + cn} />)}
          <div className="rec-tag"><span className="lv" />REC-01 <b>· {t('rec.discovery.tag')}</b></div>
          <div className="rec-art">
            <div className="radar" aria-hidden="true">
              <div className="sweep" /><div className="r0" /><div className="r0 r1" /><div className="r0 r2" />
              {BLIPS.map(([l, top, unk, delay], i) => (
                <div key={i} className={'blip' + (unk ? ' unk' : '')}
                     style={{ left: l, top, animationDelay: delay + 's' }} />
              ))}
              {PROBES.map(([ang, len, delay], i) => (
                <span key={'p' + i} className="probe"
                      style={{ ['--ang' as any]: ang, ['--len' as any]: len, animationDelay: delay + 's' }} />
              ))}
              {PROBES.map(([, , delay], i) => {
                const hit = (BLIPS.filter(b => b[2])[i % 2] || BLIPS[BLIPS.length - 1])!;
                return (
                  <span key={'h' + i} className="hit"
                        style={{ left: hit[0], top: hit[1], animationDelay: delay + 's' }} />
                );
              })}
              <div className="core">{t('rec.discovery.scanning')}</div>
            </div>
            <span className="rt-badge"><i />{t('rec.discovery.redteam')}</span>
          </div>
          <div>
            <h3>{t('rec.discovery.title')}</h3>
            <p>{t('rec.discovery.desc')}</p>
            <div className="rt-note">
              <span className="k"><i />{t('rec.discovery.notek')}</span>
              <p>{t('rec.discovery.notebody')}</p>
            </div>
            <div className="rt-stats">
              <div className="rt-stat"><div className="k">{t('rec.discovery.stat1k')}</div><div className="v">2,318</div></div>
              <div className="rt-stat"><div className="k">{t('rec.discovery.stat2k')}</div><div className="v warn">14</div></div>
              <div className="rt-stat"><div className="k">{t('rec.discovery.stat3k')}</div><div className="v">{t('rec.discovery.stat3v')}</div></div>
            </div>
          </div>
        </article>

        <div className="rec-col">
          <article className={'rec r' + inCls(c1.inView)} style={{ ['--i' as any]: 1 }} ref={c1.ref as any}>
            <span className="rec-mesh" aria-hidden="true" />
            {CORNERS.map(cn => <span key={cn} className={'cnr ' + cn} />)}
            <div className="rec-tag"><span className="lv" />REC-02 <b>· {t('rec.runtime.tag')}</b></div>
            <div className="rec-art rec-art-sm">
              <svg className="gate" viewBox="0 0 300 136" aria-hidden="true">
                <path className="lane" d="M14 34h272M14 68h272M14 102h272" />
                <path className="wall" d="M148 16v104" />
                <rect className="pk g1" x="20" y="29" width="13" height="10" rx="2" />
                <rect className="pk g2" x="20" y="63" width="13" height="10" rx="2" />
                <rect className="pk-b g3" x="20" y="97" width="13" height="10" rx="2" />
                <circle cx="148" cy="102" r="13" fill="none" stroke="#a8681a" strokeWidth="1.6" />
                <path d="M143 97l10 10M153 97l-10 10" stroke="#a8681a" strokeWidth="1.8" strokeLinecap="round" />
                <text x="148" y="132" textAnchor="middle" fontFamily="JetBrains Mono, monospace"
                      fontSize="8" fill="#7c887f" letterSpacing="1.4">{t('rec.runtime.policy')}</text>
              </svg>
            </div>
            <h3>{t('rec.runtime.title')}</h3>
            <p>{t('rec.runtime.desc')}</p>
          </article>

          <article className={'rec r' + inCls(c2.inView)} style={{ ['--i' as any]: 2 }} ref={c2.ref as any}>
            <span className="rec-mesh" aria-hidden="true" />
            {CORNERS.map(cn => <span key={cn} className={'cnr ' + cn} />)}
            <div className="rec-tag"><span className="lv" />REC-03 <b>· {t('rec.evidence.tag')}</b></div>
            <div className="rec-art rec-art-sm">
              <div className="ledger" aria-hidden="true">
                {[['A-1042', '100%', t('rec.evidence.sealed')], ['A-1043', '100%', t('rec.evidence.sealed')],
                  ['A-1044', '62%', t('rec.evidence.writing')]].map(([id, w, state], i) => (
                  <div className="row" key={id} style={{ ['--i' as any]: i }}>
                    <span className="h">{id}</span>
                    <span className="bar"><i style={{ ['--w' as any]: w }} /></span>
                    <span className="ok">{state}</span>
                  </div>
                ))}
              </div>
              <span className="spark-burst" aria-hidden="true">
                {SPARKS.map(([dx, dy], i) => <i key={i} style={{ ['--dx' as any]: dx, ['--dy' as any]: dy }} />)}
              </span>
              <svg className="seal-stamp" viewBox="0 0 56 56" aria-hidden="true">
                <circle cx="28" cy="28" r="25" />
                <circle className="rim" cx="28" cy="28" r="20" />
                <path d="M28 20 34 28 28 36 22 28Z" />
                <text x="28" y="49" textAnchor="middle">{t('rec.evidence.sealedtag')}</text>
              </svg>
            </div>
            <h3>{t('rec.evidence.title')}</h3>
            <p>{t('rec.evidence.desc')}</p>
          </article>
        </div>
      </div>
    </section>
  );
}
