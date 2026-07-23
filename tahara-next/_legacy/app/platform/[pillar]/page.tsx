import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { PLATFORM_MENU } from '@/content/platform';

function slugify(heading: string) {
  return heading.toLowerCase().replace(/\+/g, 'and').replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

export function generateStaticParams() {
  return PLATFORM_MENU.map(([heading]) => ({ pillar: slugify(heading) }));
}

export function generateMetadata({ params }: { params: { pillar: string } }): Metadata {
  const col = PLATFORM_MENU.find(([heading]) => slugify(heading) === params.pillar);
  const heading = col?.[0] ?? 'Platform';
  return {
    title: `${heading} — Tahara AI`,
    description: `${heading} capabilities in the Tahara AI platform.`
  };
}

export default function PillarPage({ params }: { params: { pillar: string } }) {
  const col = PLATFORM_MENU.find(([heading]) => slugify(heading) === params.pillar);
  if (!col) notFound();
  const [heading, items] = col;

  return (
    <div className="wrap band">
      <p className="label" style={{ marginBottom: 12 }}>
        <Link href="/">Tahara AI</Link> / Platform
      </p>
      <h1 style={{ marginBottom: 28 }}>{heading}</h1>

      <div className="recs" style={{ gridTemplateColumns: '1fr', gap: 16 }}>
        {items.map(([mono, title, desc, soon]) => (
          <article className="rec r in" key={title} style={{ position: 'relative' }}>
            <div className="rec-tag"><span className="lv" /><b>{mono}</b></div>
            <h3>{title}{soon && <span className="soon" style={{ marginLeft: 8 }}>Coming soon</span>}</h3>
            <p>{desc}</p>
          </article>
        ))}
      </div>

      <p style={{ marginTop: 40 }}>
        <Link href="/#platform" className="more">← Back to the overview</Link>
      </p>
    </div>
  );
}
