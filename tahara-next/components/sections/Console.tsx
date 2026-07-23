'use client';

import { useState, useRef, useEffect, useLayoutEffect } from 'react';

/* Console content is deliberately left untranslated in both languages —
   it reads as a screenshot of a running product, not marketing copy. This
   matches the vanilla site exactly: none of these strings were ever tagged
   for translation there either. */
const TILES: [string, number, string, boolean, string][] = [
  ['Systems in scope', 412, '+18 this week', false, 'M0 22 14 20 28 17 42 15 56 11 70 10 84 6 100 3'],
  ['Agents monitored', 96,  '14 with tool access', false, 'M0 20 14 21 28 16 42 18 56 12 70 13 84 8 100 7'],
  ['Policies enforced', 38, '6 pending approval', false, 'M0 18 14 18 28 14 42 14 56 10 70 10 84 7 100 7'],
  ['Blocked · 24h', 1204, 'Injections up 9%', true, 'M0 16 14 19 28 9 42 20 56 7 70 17 84 5 100 11']
];

const SIDE_ICONS: [string, JSX.Element][] = [
  ['Overview', <><rect x="2" y="2" width="5" height="5" rx="1"/><rect x="9" y="2" width="5" height="5" rx="1"/><rect x="2" y="9" width="5" height="5" rx="1"/><rect x="9" y="9" width="5" height="5" rx="1"/></>],
  ['Inventory', <><path d="M2 4.5 8 2l6 2.5-6 2.5z"/><path d="M2 8l6 2.5L14 8"/><path d="M2 11.5 8 14l6-2.5"/></>],
  ['Agents', <><circle cx="8" cy="5" r="2.4"/><path d="M3 13.5c0-2.5 2.2-4 5-4s5 1.5 5 4"/></>],
  ['Policies', <path d="M8 1.8 13.5 4v4.2c0 3.2-2.3 5.4-5.5 6-3.2-.6-5.5-2.8-5.5-6V4z"/>],
  ['Findings', <><circle cx="7" cy="7" r="4.5"/><path d="M10.5 10.5 14 14"/></>],
  ['Evidence', <><path d="M3.5 2h6L12.5 5v9h-9z"/><path d="M5.5 8.5h5M5.5 11h3"/></>]
];

const FEED: [string, string, string][] = [
  ['<b>claims-triage-agent</b> → customer_pii.address · out of scope','chip-block','Blocked'],
  ['<b>support-copilot</b> · injection pattern matched','chip-block','Blocked'],
  ['<b>finance-summariser</b> · 3 account numbers removed','chip-pass','Redacted'],
  ['<b>mistral-small</b> seen in eu-west-1 · no owner','chip-log','Registered'],
  ['<b>hr-assistant</b> · system prompt leak attempt','chip-block','Blocked'],
  ['<b>vendor-bot</b> → contracts.pdf · within scope','chip-pass','Allowed'],
  ['<b>eval-runner</b> · new model version detected','chip-log','Registered'],
  ['<b>sql-copilot</b> · unbounded DELETE rejected','chip-block','Blocked']
];

const clamp = (v: number, a: number, b: number) => (v < a ? a : v > b ? b : v);
const useIsoLayout = typeof window !== 'undefined' ? useLayoutEffect : useEffect;

export function Console({ stageRef, consoleRef, reduce }: { stageRef: React.RefObject<HTMLDivElement>; consoleRef: React.RefObject<HTMLDivElement>; reduce: boolean }){
  const [rows, setRows] = useState(() =>
    FEED.slice(0, 4).map((f, i) => ({ id: i, f, t: stampAt(i), fresh: false, leaving: false })));
  const cursor = useRef(4);
  const uid = useRef(4);
  const valueRefs = useRef<(HTMLDivElement | null)[]>([]);
  const sparkRefs = useRef<(SVGPathElement | null)[]>([]);
  const counted = useRef(false);

  /* sparkline dash lengths */
  useIsoLayout(() => {
    sparkRefs.current.forEach(p => {
      if (p) p.style.setProperty('--len', String(Math.ceil(p.getTotalLength())));
    });
  }, []);

  /* counters, fired once when the console lights up */
  useEffect(() => {
    const el = consoleRef.current;
    if (!el) return;
    if (reduce){
      valueRefs.current.forEach((n, k) => { if (n) n.textContent = TILES[k]![1].toLocaleString('en-US'); });
      return;
    }
    let raf = 0;
    const check = () => {
      if (!counted.current && el.classList.contains('lit')){
        counted.current = true;
        valueRefs.current.forEach((node, k) => {
          if (!node) return;
          const target = TILES[k]![1], t0 = performance.now() + k * 110, dur = 1250;
          const tick = (now: number) => {
            const p = clamp((now - t0) / dur, 0, 1);
            node.textContent = Math.round(target * (1 - Math.pow(1 - p, 4))).toLocaleString('en-US');
            if (p < 1) requestAnimationFrame(tick);
          };
          requestAnimationFrame(tick);
        });
        return;
      }
      raf = requestAnimationFrame(check);
    };
    raf = requestAnimationFrame(check);
    return () => cancelAnimationFrame(raf);
  }, [consoleRef, reduce]);

  /* live decision feed */
  useEffect(() => {
    if (reduce) return;
    const id = setInterval(() => {
      const el = consoleRef.current;
      if (document.hidden || !el || !el.classList.contains('lit')) return;
      const r = el.getBoundingClientRect();
      if (r.bottom < 0 || r.top > window.innerHeight) return;
      setRows(prev => {
        const next = prev.map((row, i) =>
          i === prev.length - 1 ? { ...row, leaving: true } : { ...row, fresh: false });
        const f = FEED[cursor.current++ % FEED.length]!;
        return [{ id: uid.current++, f, t: stampAt(uid.current), fresh: true, leaving: false }, ...next];
      });
      setTimeout(() => setRows(prev => prev.filter(r2 => !r2.leaving)), 460);
    }, 3400);
    return () => clearInterval(id);
  }, [consoleRef, reduce]);

  return (
    <div className="console-stage" ref={stageRef}>
      <div className="console" ref={consoleRef} role="img"
           aria-label="Tahara assurance console: AI inventory counts, enforcement totals and a live decision feed">
        <div className="console-bar">
          <span className="dot" /><span className="dot" /><span className="dot" />
          <span className="path">tahara / assurance console</span>
          <span className="live"><span className="pulse" />Enforcing</span>
        </div>
        <div className="console-body">
          <aside className="console-side">
            <div className="label">Workspace</div>
            {SIDE_ICONS.map(([name, icon], i) => (
              <a key={name} href="#platform" className={i === 0 ? 'on' : undefined}>
                <svg className="ic" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4">{icon}</svg>
                {name}
              </a>
            ))}
          </aside>

          <div className="console-main">
            <div className="tiles">
              {TILES.map(([k, , d, warn, path], i) => (
                <div className="tile" key={k} style={{ ['--i' as any]: i }}>
                  <div className="k">{k}</div>
                  <div className="v" ref={el => { valueRefs.current[i] = el; }}>0</div>
                  <div className={'d' + (warn ? ' warn' : '')}>{d}</div>
                  <svg className="spark" viewBox="0 0 100 26" preserveAspectRatio="none" aria-hidden="true">
                    <path ref={el => { sparkRefs.current[i] = el; }} d={path} fill="none"
                          stroke={warn ? '#a8681a' : '#2c6b47'} strokeWidth="1.6" />
                  </svg>
                </div>
              ))}
            </div>

            <div className="feed">
              <div className="feed-head">
                <span className="label">Decision feed</span>
                <span className="label" style={{ letterSpacing:'.1em' }}>Append-only</span>
              </div>
              <div className="feed-list">
                {rows.map(row => (
                  <div key={row.id}
                       className={'feed-row' + (row.fresh ? ' fresh' : '') + (row.leaving ? ' leaving' : '')}>
                    <span className="t">{row.t}</span>
                    <span className="m" dangerouslySetInnerHTML={{ __html: row.f[0] }} />
                    <span className={'chip ' + row.f[1]}>{row.f[2]}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function stampAt(n: number): string {
  const d = new Date();
  d.setHours(10, 42, 7, 0);
  d.setSeconds(d.getSeconds() + n * 19);
  return d.toTimeString().slice(0, 8);
}
