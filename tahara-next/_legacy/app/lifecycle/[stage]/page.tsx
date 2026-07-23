import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';

const STAGES: Record<string, { title: string; bullets: string[] }> = {
  assess: {
    title: 'Risk assessment and treatment',
    bullets: ['Risk tiering for models and agents', 'Bias, robustness and privacy tests', 'Treatment plan with named owners']
  },
  govern: {
    title: 'Governance system',
    bullets: ['Policy set aligned to ISO/IEC 42001', 'Approvals with evidence attached', 'A register that stays current']
  },
  test: {
    title: 'Adversarial testing',
    bullets: ['Jailbreak sets mapped to OWASP LLM Top 10', 'Tool-chain and agent abuse cases', 'Retest on every material change']
  },
  monitor: {
    title: 'Continuous monitoring',
    bullets: ['Drift, refusal and grounding failures', 'Policy hits and overrides', 'Alerts routed into your SOC']
  }
};

export function generateStaticParams() {
  return Object.keys(STAGES).map(stage => ({ stage }));
}

export function generateMetadata({ params }: { params: { stage: string } }): Metadata {
  const s = STAGES[params.stage];
  return { title: `${s?.title ?? 'Lifecycle'} — Tahara AI`, description: s?.title };
}

export default function StagePage({ params }: { params: { stage: string } }) {
  const s = STAGES[params.stage];
  if (!s) notFound();

  return (
    <div className="wrap band">
      <p className="label" style={{ marginBottom: 12 }}>
        <Link href="/">Tahara AI</Link> / Lifecycle
      </p>
      <h1 style={{ marginBottom: 20 }}>{s.title}</h1>
      <ul style={{ display: 'grid', gap: 10, marginBottom: 32 }}>
        {s.bullets.map(b => (
          <li key={b} style={{ display: 'flex', gap: 10, fontSize: 15, color: 'var(--ink-2)' }}>
            <span style={{ color: 'var(--g600)' }}>—</span>{b}
          </li>
        ))}
      </ul>
      <Link href="/#lifecycle" className="more">← Back to the overview</Link>
    </div>
  );
}
