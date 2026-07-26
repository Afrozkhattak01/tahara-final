import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Trust centre — Tahara AI',
  description: "Tahara AI's own security and compliance posture, public."
};

export default function TrustPage() {
  return (
    <div className="wrap band">
      <p className="label" style={{ marginBottom: 12 }}><Link href="/">Tahara AI</Link> / Trust centre</p>
      <h1 style={{ marginBottom: 20 }}>Our own posture, public.</h1>
      <p className="lede" style={{ marginBottom: 24 }}>
        The same standards we help you meet — ISO/IEC 42001, ISO/IEC 27001, SOC 2 — applied to Tahara itself.
        Full report available on request.
      </p>
      <Link href="/contact" className="btn btn-solid">Request the report <span className="arw" aria-hidden="true">→</span></Link>
    </div>
  );
}
