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

// Safety ceiling per mode, well beyond each mode's typical run (simple ~2 min,
// stealth ~8, aggressive ~25). A single 20-minute ceiling would have released
// aggressive scans as "partial" before they could normally finish.
const HARD_CEILING_MS: Record<string, number> = {
  simple: 10 * 60_000,
  stealth: 20 * 60_000,
  aggressive: 45 * 60_000,
};

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

    const elapsed = scan.started_at
      ? Date.now() - new Date(scan.started_at).getTime()
      : 0;

    const findingsRes = await fetch(`${ARIE_API}/scans/${jobId}/findings`, { headers });
    let findings: any[] = [];
    if (findingsRes.ok) {
      const data = await findingsRes.json();
      if (Array.isArray(data)) findings = data;
    }

    // Ready means the backend says the scan is over — nothing else. The backend
    // settles scan status itself once every task is done, failed or skipped,
    // including the per-host tasks subdomain discovery spawns mid-scan.
    //
    // This used to guess from the findings instead: "ready" as soon as any CVE
    // finding existed, or unconditionally after five minutes. The first fired
    // while AI analysis and other hosts were still running; the second fired
    // while CVE correlation was still waiting on fingerprinting, which is why the
    // report opened with 0 CVEs and 0 critical on scans that went on to find 19.
    const finished = scan.status === 'completed' || scan.status === 'failed';

    // Safety ceiling only, far beyond a normal stealth scan (~8 min, 27 tasks
    // at most observed), so a hung worker cannot hold the page forever. Results
    // released this way are flagged partial so the UI can say so.
    const ceiling = HARD_CEILING_MS[scan.scan_mode] ?? 20 * 60_000;
    const overdue = elapsed > ceiling;

    if (finished || overdue) {
      return NextResponse.json({
        scanId: scan.id,
        // A failed scan still returns whatever it found; the UI must not
        // substitute anything in place of real results.
        status: scan.status === 'failed' ? 'failed' : 'completed',
        partial: !finished,
        mode: scan.scan_mode,
        startedAt: scan.started_at,
        completedAt: scan.completed_at,
        findings,
        reportUrl: `${ARIE_API}/scans/${jobId}/report-detailed`,
      });
    }

    return NextResponse.json({
      scanId: scan.id,
      status: 'running',
      mode: scan.scan_mode,
      startedAt: scan.started_at,
      findingsCount: findings.length,
    });
  } catch (e: any) {
    return NextResponse.json({ error: { code: 'server_error', detail: e.message } }, { status: 500 });
  }
}
