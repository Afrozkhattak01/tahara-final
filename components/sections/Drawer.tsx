'use client';

import { useRef, useEffect } from 'react';

// Object shape, not the tuple type exported by content/frameworks.ts — the
// parent (Frameworks.tsx) converts the tuple to this shape before passing
// it down, since a plain object is easier to read at the call site than
// positional array access.
type DrawerDetail = { kind: string; lede: string; bullets: string[] };

export function Drawer({
  name,
  detail,
  onClose,
  downloadLabel,
  mapLabel
}: {
  name: string | null;
  detail: DrawerDetail | null;
  onClose: () => void;
  downloadLabel: string;
  mapLabel: string;
}) {
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!name) return;
    closeRef.current?.focus();
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [name, onClose]);

  const trap = (e: React.KeyboardEvent<HTMLElement>) => {
    if (e.key !== 'Tab') return;
    const focusables = [...e.currentTarget.querySelectorAll<HTMLElement>('button, a[href]')]
      .filter(el => el.offsetParent !== null);
    if (!focusables.length) return;
    const first = focusables[0]!, last = focusables[focusables.length - 1]!;
    if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
    else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
  };

  return (
    <>
      <div className={'drawer-scrim' + (name ? ' on' : '')} aria-hidden="true" onClick={onClose} />
      <aside className={'drawer' + (name ? ' open' : '')} role="dialog" aria-modal="true"
             aria-hidden={!name} aria-label={name || 'Framework detail'} onKeyDown={trap}>
        <div className="drawer-head">
          <div>
            <span className="k">{detail?.kind || ''}</span>
            <h3>{name || ''}</h3>
          </div>
          <button className="drawer-x" ref={closeRef} aria-label="Close" onClick={onClose}>
            <svg viewBox="0 0 14 14" fill="none"><path d="M2 2l10 10M12 2L2 12" /></svg>
          </button>
        </div>
        <div className="drawer-body">
          <p>{detail?.lede || ''}</p>
          <span className="label">{mapLabel}</span>
          <ul>
            {detail?.bullets.map((line: string, i: number) => (
              <li key={line} style={{ ['--i' as any]: i }}>
                <svg viewBox="0 0 16 16" aria-hidden="true"><path d="M3.4 8.4 6.6 11.6 12.8 4.8" /></svg>
                {line}
              </li>
            ))}
          </ul>
        </div>
        <div className="drawer-foot">
          <button className="btn btn-solid">{downloadLabel} <span className="arw" aria-hidden="true">→</span></button>
        </div>
      </aside>
    </>
  );
}
