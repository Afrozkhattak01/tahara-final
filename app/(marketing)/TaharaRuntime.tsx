'use client';

import { useEffect } from 'react';

/**
 * Renders the ported page markup and boots the vanilla engine.
 *
 * The original site is driven by a single ~1900-line imperative script that
 * owns the DOM (mega-menu injection, drawer, animated counters, the canvas
 * 3D scene, EN/AR i18n, the scroll engine). We keep that engine intact and
 * let it run against the server-rendered markup — this reproduces the page
 * exactly rather than risking behavioural drift from a hooks rewrite.
 */
export default function TaharaRuntime({ html }: { html: string }) {
  useEffect(() => {
    // Load the engine exactly once, after the markup is in the DOM.
    // The id guard also stops React StrictMode's double-invoke (dev) from
    // attaching a second copy of the scroll/rAF listeners.
    if (document.getElementById('tahara-engine')) return;
    const s = document.createElement('script');
    s.id = 'tahara-engine';
    s.src = '/tahara-engine.js';
    s.defer = true;
    document.body.appendChild(s);
  }, []);

  return <div dangerouslySetInnerHTML={{ __html: html }} suppressHydrationWarning />;
}
