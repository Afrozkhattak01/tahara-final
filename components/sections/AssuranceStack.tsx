'use client';

import { useRef, useEffect, useState } from 'react';
import { useLanguage } from '../LanguageProvider';
import { Split } from '../ui/Split';
import { useReducedMotion } from '../hooks';
import { buildStackGeometryTyped, type Shape } from '../visuals/stackGeometry';

const clamp = (v: number, a: number, b: number) => (v < a ? a : v > b ? b : v);

function ShapeEl({ s }: { s: Shape }) {
  if (s.t === 'polygon') return <polygon points={s.points} fill={s.fill} stroke={s.stroke} strokeWidth={s.sw} opacity={s.op} />;
  if (s.t === 'ellipse') return <ellipse cx={s.cx} cy={s.cy} rx={s.rx} ry={s.ry} fill={s.fill} stroke={s.stroke} strokeWidth={s.sw} opacity={s.op} />;
  if (s.t === 'line') return <line x1={s.x1} y1={s.y1} x2={s.x2} y2={s.y2} stroke={s.stroke} strokeWidth={s.sw} strokeDasharray={s.dash} opacity={s.op} />;
  return <path d={s.d} fill={s.fill} stroke={s.stroke} strokeWidth={s.sw} strokeLinecap={s.cap as any} strokeLinejoin={s.join as any} opacity={s.op} />;
}

const STACK_ROWS: [layer: number, no: string][] = [
  [4, '05'], [3, '04'], [2, '03'], [1, '02'], [0, '01']
];

export function AssuranceStack() {
  const { t } = useLanguage();
  const reduce = useReducedMotion();
  const geometry = useState(() => buildStackGeometryTyped())[0];

  const trackRef = useRef<HTMLDivElement>(null);
  const pinRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const markRef = useRef<HTMLDivElement>(null);
  const wordRef = useRef<HTMLDivElement>(null);
  const railRef = useRef<HTMLSpanElement>(null);
  const pctRef = useRef<HTMLSpanElement>(null);
  const layerRefs = useRef<(SVGGElement | null)[]>([]);
  const itemRefs = useRef<(HTMLDivElement | null)[]>([]);
  const ringRefs = useRef<(SVGCircleElement | null)[]>([]);
  const hoverLock = useRef<number | null>(null);

  useEffect(() => {
    ringRefs.current.forEach(c => {
      if (!c) return;
      try { c.style.setProperty('--rl', String(Math.ceil(c.getTotalLength()))); }
      catch { c.style.setProperty('--rl', '880'); }
    });
  }, []);

  useEffect(() => {
    const track = trackRef.current, pin = pinRef.current, svg = svgRef.current;
    const mark = markRef.current, word = wordRef.current, stage = stageRef.current;
    if (!track || !pin || !svg) return;

    if (reduce) {
      pin.style.setProperty('--m', '0');
      pin.style.setProperty('--sp', '1');
      layerRefs.current.forEach(l => l?.style.setProperty('--e', '1'));
      itemRefs.current.forEach(it => it?.style.setProperty('--seen', '1'));
      mark?.classList.add('on');
      return;
    }

    const live = { e: [0, 0, 0, 0, 0], m: 0, pp: 0 };
    const want = { e: [0, 0, 0, 0, 0], m: 0, pp: 0, p: 0, staticMark: false };
    const EASE_POS = 0.115, EASE_M = 0.105, EASE_UI = 0.18;
    let kPos = EASE_POS, kM = EASE_M, kUI = EASE_UI, lastT = 0;
    let raf = 0, alive = false, flashed = false;

    const smooth = (t: number) => t * t * t * (t * (t * 6 - 15) + 10);
    const entry = (p: number, i: number) => smooth(clamp((p - i * 0.092) / 0.215, 0, 1));

    const highlight = (idx: number) => {
      const k = hoverLock.current !== null ? hoverLock.current : idx;
      itemRefs.current.forEach((it, n) => it?.classList.toggle('on', STACK_ROWS[n]![0] === k));
      layerRefs.current.forEach((l, n) => l?.classList.toggle('hot', n === k));
      svg.classList.toggle('dim', k >= 0);
    };

    const readTargets = () => {
      const vh = window.innerHeight;
      let p: number;
      if (window.innerWidth > 1000) {
        const r = track.getBoundingClientRect();
        p = clamp(-r.top / Math.max(1, track.offsetHeight - vh), 0, 1);
        want.m = smooth(clamp((p - 0.84) / 0.16, 0, 1));
      } else {
        const r = svg.getBoundingClientRect();
        p = clamp((vh * 0.92 - r.top) / (vh * 0.62), 0, 1);
        want.m = 0;
      }
      for (let i = 0; i < 5; i++) want.e[i] = entry(p, i);
      want.pp = p; want.p = p;
      want.staticMark = window.innerWidth <= 1000 && p > 0.5;
    };

    const paint = () => {
      let settled = true, allIn = true;
      for (let i = 0; i < 5; i++) {
        const d = want.e[i]! - live.e[i]!;
        if (Math.abs(d) < 0.0006) live.e[i] = want.e[i]!;
        else { live.e[i] = live.e[i]! + d * kPos; settled = false; }
        layerRefs.current[i]?.style.setProperty('--e', live.e[i]!.toFixed(4));
        if (live.e[i]! < 0.995) allIn = false;
      }
      itemRefs.current.forEach((it, n) => it?.style.setProperty('--seen', live.e[STACK_ROWS[n]![0]]!.toFixed(3)));
      pin.style.setProperty('--sp', live.e[0]!.toFixed(3));

      const dm = want.m - live.m;
      if (Math.abs(dm) < 0.0006) live.m = want.m; else { live.m += dm * kM; settled = false; }
      pin.style.setProperty('--m', live.m.toFixed(4));
      mark?.classList.toggle('on', live.m > 0.2 || want.staticMark);
      word?.classList.toggle('shine', live.m > 0.55 || want.staticMark);

      const dp = want.pp - live.pp;
      if (Math.abs(dp) < 0.0008) live.pp = want.pp; else { live.pp += dp * kUI; settled = false; }
      railRef.current?.style.setProperty('--pp', live.pp.toFixed(4));
      if (pctRef.current) pctRef.current.textContent = String(Math.round(live.pp * 100)).padStart(2, '0') + '%';

      stage?.classList.toggle('assembled', allIn && live.m < 0.02);
      if (allIn && !flashed) {
        flashed = true;
        svg.classList.add('assembled');
        setTimeout(() => svg.classList.remove('assembled'), 1200);
      }
      if (!allIn) flashed = false;

      const pb = clamp((want.p - 0.6) / 0.2, 0, 1);
      highlight(live.m > 0.02 ? -1 : pb <= 0 ? -1 : Math.min(4, Math.floor(pb * 5)));
      return settled;
    };

    const loop = (now: number) => {
      const dt = lastT ? Math.min(120, now - lastT) : 16.67;
      lastT = now;
      const f = dt / 16.67;
      kPos = 1 - Math.pow(1 - EASE_POS, f);
      kM = 1 - Math.pow(1 - EASE_M, f);
      kUI = 1 - Math.pow(1 - EASE_UI, f);
      readTargets();
      const settled = paint();
      if (!alive && settled) { raf = 0; lastT = 0; return; }
      raf = requestAnimationFrame(loop);
    };
    const wake = () => { if (!raf) { lastT = 0; raf = requestAnimationFrame(loop); } };

    const io = new IntersectionObserver(es => { alive = !!es[0]?.isIntersecting; if (alive) wake(); },
      { rootMargin: '120% 0px 120% 0px' });
    io.observe(track);

    const onScroll = () => wake();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    wake();

    // pointer tilt, damped, hover-only
    let tx = 0, ty = 0, wx = 0, wy = 0, traf = 0;
    const tiltable = stage && matchMedia('(hover:hover) and (pointer:fine)').matches;
    const tilt = () => {
      tx += (wx - tx) * 0.12;
      ty += (wy - ty) * 0.12;
      svg.style.setProperty('--tx', tx.toFixed(2) + 'deg');
      svg.style.setProperty('--ty', ty.toFixed(2) + 'deg');
      traf = Math.abs(wx - tx) > 0.02 || Math.abs(wy - ty) > 0.02 ? requestAnimationFrame(tilt) : 0;
    };
    const onMove = (e: PointerEvent) => {
      const r = stage!.getBoundingClientRect();
      wy = ((e.clientX - r.left) / r.width - 0.5) * 20;
      wx = (0.5 - (e.clientY - r.top) / r.height) * 20;
      if (!traf) traf = requestAnimationFrame(tilt);
    };
    const onOut = () => { wx = 0; wy = 0; if (!traf) traf = requestAnimationFrame(tilt); };
    if (tiltable) { stage!.addEventListener('pointermove', onMove); stage!.addEventListener('pointerleave', onOut); }

    const enter = (i: number) => () => { hoverLock.current = i; highlight(i); };
    const leave = () => { hoverLock.current = null; wake(); };
    const bound: [HTMLElement | SVGGElement, () => void][] = [];
    itemRefs.current.forEach((it, n) => { if (!it) return; const e = enter(STACK_ROWS[n]![0]); it.addEventListener('mouseenter', e); it.addEventListener('mouseleave', leave); bound.push([it, e]); });
    layerRefs.current.forEach((l, n) => { if (!l) return; const e = enter(n); l.addEventListener('mouseenter', e); l.addEventListener('mouseleave', leave); bound.push([l, e]); });

    return () => {
      io.disconnect();
      cancelAnimationFrame(raf);
      cancelAnimationFrame(traf);
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
      if (tiltable) { stage!.removeEventListener('pointermove', onMove); stage!.removeEventListener('pointerleave', onOut); }
      bound.forEach(([el, e]) => { el.removeEventListener('mouseenter', e); el.removeEventListener('mouseleave', leave); });
    };
  }, [reduce]);

  // "Tahara AI" is the brand name and stays literal/untranslated in both
  // languages, per the i18n scope notes — it is not pulled through t().
  const markLetters = [...'Tahara AI'];

  return (
    <section className="stack-sec" id="stack">
      <div className="wrap">
        <div className="stack-intro">
          <span className="eyebrow r-fade"><i />{t('eyebrow.architecture')}</span>
          <Split parts={[{ text: t('stack.title') }]} style={{ marginTop: 16 }} />
          <p className="lede r">{t('stack.lede')}</p>
        </div>
      </div>

      <div className="stack-track" ref={trackRef}>
        <div className="stack-pin" ref={pinRef}>
          <div className="wrap">
            <div className="pin-head">
              <span className="label">{t('stack.assembling')}</span>
              <span className="pin-rail" ref={railRef} aria-hidden="true"><i /></span>
              <span className="label" ref={pctRef}>00%</span>
            </div>

            <div className="stack-grid">
              <div className="stack-stage" ref={stageRef}>
                <span className="beam" aria-hidden="true" />
                <svg id="stackSvg" className="tilt" ref={svgRef} viewBox="0 0 600 820" role="img"
                     aria-label="Five instrumented layers assembling into one stack">
                  <ellipse className="shadow" cx="250" cy="746" rx="170" ry="21" fill="rgba(15,44,31,.07)" />
                  {geometry.map(L => (
                    <g key={L.i} className="layer" data-layer={L.i} style={L.style as any}
                       ref={el => { layerRefs.current[L.i] = el; }}>
                      <polygon className="slab-side" points={L.sideL} />
                      <polygon className="slab-side2" points={L.sideR} />
                      <polygon className="slab-top" points={L.top} />
                      <g className="slab-grid">
                        {L.grid.map((g, n) => <line key={n} x1={g[0]} y1={g[1]} x2={g[2]} y2={g[3]} />)}
                      </g>
                      {L.shapes.map((s, n) => <ShapeEl key={n} s={s} />)}
                      <line className="lead" x1={L.lead[0]} y1={L.lead[1]} x2={L.lead[2]} y2={L.lead[3]} />
                      <text className="lead-tx" x={L.label[0]} y={L.label[1]}>{L.label[2]}</text>
                    </g>
                  ))}
                </svg>

                <div className="stack-mark" ref={markRef} aria-hidden="true">
                  <div className="mark-in">
                    <span className="mark-glow" />
                    <svg className="mark-ring" viewBox="0 0 300 300">
                      <circle className="outer" cx="150" cy="150" r="140" ref={el => { ringRefs.current[0] = el; }} />
                      <circle className="dash" cx="150" cy="150" r="118" ref={el => { ringRefs.current[1] = el; }} />
                    </svg>
                    <span className="orbit"><i /></span>
                    <span className="orbit slow"><i /></span>
                    <span className="mark-dia" />
                    <div className="mark-word" ref={wordRef}>
                      {markLetters.map((ch, i) => (
                        <span className="ml" key={i} style={{ ['--li' as any]: i }}>
                          {ch === ' ' ? '\u00A0' : ch}
                        </span>
                      ))}
                    </div>
                    <div className="mark-sub">{t('mark.assurance')}</div>
                  </div>
                </div>
              </div>

              <div className="stack-list">
                {STACK_ROWS.map(([layer, no], n) => (
                  <div className="stack-item" key={no} data-layer={layer} ref={el => { itemRefs.current[n] = el; }}>
                    <span className="n">{no}</span>
                    <div><h4>{t(`stack.item${layer + 1}.title`)}</h4><p>{t(`stack.item${layer + 1}.desc`)}</p></div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
