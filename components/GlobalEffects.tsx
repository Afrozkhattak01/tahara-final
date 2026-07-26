'use client';

import { useEffect } from 'react';
import { useReducedMotion } from './hooks';

/** Magnetic lean on any .btn, and a click ripple on every button. Delegated
 *  on document rather than per-button hooks — matches the vanilla site's
 *  approach and avoids attaching a listener to every single button on the
 *  page individually. */
export function GlobalEffects() {
  const reduce = useReducedMotion();

  useEffect(() => {
    if (reduce) return;

    const onMove = (e: PointerEvent) => {
      const btn = (e.target as HTMLElement).closest('.btn') as HTMLElement | null;
      if (!btn) return;
      const r = btn.getBoundingClientRect();
      const dx = (e.clientX - r.left - r.width / 2) / r.width;
      const dy = (e.clientY - r.top - r.height / 2) / r.height;
      btn.style.transform = `translate(${(dx * 7).toFixed(2)}px, ${(dy * 5).toFixed(2)}px)`;
      btn.style.setProperty('--bx', e.clientX - r.left + 'px');
      btn.style.setProperty('--by', e.clientY - r.top + 'px');
    };
    const onLeave = (e: PointerEvent) => {
      const btn = (e.target as HTMLElement).closest?.('.btn') as HTMLElement | null;
      if (btn) btn.style.transform = '';
    };
    const onDown = (e: PointerEvent) => {
      const btn = (e.target as HTMLElement).closest('.btn') as HTMLElement | null;
      if (!btn) return;
      const r = btn.getBoundingClientRect();
      const size = Math.max(r.width, r.height) * 2.2;
      const el = document.createElement('span');
      el.className = 'ripple';
      el.style.width = el.style.height = size + 'px';
      el.style.left = e.clientX - r.left + 'px';
      el.style.top = e.clientY - r.top + 'px';
      btn.appendChild(el);
      setTimeout(() => el.remove(), 650);
    };

    if (matchMedia('(hover: hover)').matches) {
      document.addEventListener('pointermove', onMove);
      document.addEventListener('pointerout', onLeave);
    }
    document.addEventListener('pointerdown', onDown);

    return () => {
      document.removeEventListener('pointermove', onMove);
      document.removeEventListener('pointerout', onLeave);
      document.removeEventListener('pointerdown', onDown);
    };
  }, [reduce]);

  return null;
}
