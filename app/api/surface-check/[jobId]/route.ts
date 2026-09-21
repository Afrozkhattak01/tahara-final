import { NextRequest, NextResponse } from 'next/server';

// Read at request time, not module scope: a module-level throw would fail the
// build rather than the request. No literal fallbacks — these defaults used to
// be the real backend host and the admin password, which would have been
// published to GitHub the moment this folder was committed.
function arieConfig() {
  const ARIE_API = process.env.ARIE_API_URL;
  const ARIE_USER = process.env.ARIE_USER;
  const ARIE_PASS = process.env.ARIE_PASS;
  if (!ARIE_API || !ARIE_USER || !ARIE_PASS) {
    throw new Error(
      'ARIE not configured: set ARIE_API_URL, ARIE_USER and ARIE_PASS ' +
      '(.env.local for dev, Vercel environment variables for deployments)'
    );
  }
  return { ARIE_API, ARIE_USER, ARIE_PASS };
}

async function getToken(): Promise<string> {
  const { ARIE_API, ARIE_USER, ARIE_PASS } = arieConfig();
  const res = await fetch(`${ARIE_API}/auth/token`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username: ARIE_USER, password: ARIE_PASS }),
  });
  if (!res.ok) throw new Error('ARIE auth failed');
  const data = await res.json();
  return data.access_token;
}

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ jobId: string }> }
) {
  try {
    const { jobId } = await params;
    const { ARIE_API } = arieConfig();
    const token = await getToken();
    const headers = { 'Authorization': `Bearer ${token}` };

    const scanRes = await fetch(`${ARIE_API}/scans/${jobId}`, { headers });
    if (!scanRes.ok) {
      return NextResponse.json({ error: { code: 'scan_not_found' } }, { status: 404 });
    }
    const scan = await scanRes.json();

    if (scan.status === 'failed') {
      return NextResponse.json({
        scanId: scan.id,
        status: 'failed',
        startedAt: scan.started_at,
      });
    }

    const elapsed = scan.started_at
      ? Date.now() - new Date(scan.started_at).getTime()
      : 0;

    const findingsRes = await fetch(`${ARIE_API}/scans/${jobId}/findings`, { headers });
    let findings: any[] = [];
    if (findingsRes.ok) {
      const data = await findingsRes.json();
      if (Array.isArray(data)) findings = data;
    }

    const types = new Set(findings.map((f: any) => f.finding_type));
    const hasCVEs = types.has('cve') || types.has('cve_summary');
    const hasAI = types.has('ai_analysis');
    const techInconclusive = types.has('technology_inconclusive') && !types.has('technology');

    // Ready when:
    // 1. CVE findings exist (best case — full results), OR
    // 2. Tech was inconclusive + AI finished (CVEs won't come), OR
    // 3. Scan running > 3 minutes (fallback — show whatever we have)
    const ready = hasCVEs
      || (techInconclusive && hasAI && findings.length >= 5)
      || elapsed > 300_000;

    if (findings.length > 0 && ready) {
      return NextResponse.json({
        scanId: scan.id,
        status: 'completed',
        startedAt: scan.started_at,
        completedAt: scan.completed_at,
        findings,
        reportUrl: `${ARIE_API}/scans/${jobId}/report-detailed`,
      });
    }

    return NextResponse.json({
      scanId: scan.id,
      status: 'running',
      startedAt: scan.started_at,
      findingsCount: findings.length,
    });
  } catch (e: any) {
    return NextResponse.json({ error: { code: 'server_error', detail: e.message } }, { status: 500 });
  }
}
