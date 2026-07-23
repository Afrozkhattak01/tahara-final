import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Resources — Tahara AI',
  description: 'Field guides, framework mappings and documentation from Tahara AI research.'
};

const GUIDES = [
  ['Playbook', 'PDF', 'Running an AI risk assessment'],
  ['96 controls', 'XLSX', 'Control set for agentic systems'],
  ['Template', 'DOCX', 'Evidence pack for ISO/IEC 42001']
];

export default function ResourcesPage() {
  return (
    <div className="wrap band">
      <p className="label" style={{ marginBottom: 12 }}><Link href="/">Tahara AI</Link> / Resources</p>
      <h1 style={{ marginBottom: 28 }}>Field guides from Tahara research</h1>

      <div className="res">
        {GUIDES.map(([kind, ext, title]) => (
          <div className="res-card in" key={title}>
            <div className="kind">
              <span className="label">{kind}</span>
              <span className="mono" style={{ fontSize: 11, color: 'var(--ink-3)' }}>{ext}</span>
            </div>
            <h4>{title}</h4>
            <div className="res-seal">Tahara Research</div>
          </div>
        ))}
      </div>

      <p style={{ marginTop: 40 }}>
        <Link href="/#resources" className="more">← Back to framework mappings</Link>
      </p>
    </div>
  );
}
