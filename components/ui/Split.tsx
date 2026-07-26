'use client';

import React from 'react';
import { useReveal } from '../hooks';

interface Part {
  text: string;
  className?: string;
}

/** Splits text into word-masked spans that lift in on scroll, matching the
    vanilla site's runtime word-splitter. `parts` lets one word (e.g. the
    hero's "prove it") carry an accent class while the rest stays plain. */
export function Split({
  parts,
  as: Tag = 'h2',
  className = '',
  style,
}: {
  parts: Part[];
  as?: 'h1' | 'h2' | 'h3' | 'h4';
  className?: string;
  style?: React.CSSProperties;
}) {
  const { ref, inView } = useReveal<HTMLElement>();
  let i = 0;

  return React.createElement(
    Tag,
    { ref, className: ('split ' + className).trim() + (inView ? ' in' : ''), style },
    parts.map((part, p) => {
      const words = part.text.split(/\s+/).filter(Boolean);
      return words.map((word, w) => {
        const idx = i++;
        return (
          <React.Fragment key={p + '-' + w}>
            <span className={('w ' + (part.className || '')).trim()}>
              <span className="wi" style={{ ['--wi' as any]: idx }}>
                {word}
              </span>
            </span>{' '}
          </React.Fragment>
        );
      });
    })
  );
}
