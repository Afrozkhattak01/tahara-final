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

export async function POST(req: NextRequest) {
  try {
    const { endpoint } = await req.json();
    if (!endpoint || typeof endpoint !== 'string' || endpoint.length > 253) {
      return NextResponse.json({ error: { code: 'invalid_url' } }, { status: 400 });
    }

    const domain = endpoint.replace(/^https?:\/\//, '').split(/[/?#]/)[0];
    const { ARIE_API } = arieConfig();
    const token = await getToken();
    const headers = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    };

    const targetRes = await fetch(`${ARIE_API}/targets`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        name: domain,
        scope_definition: domain,
        authorized_by: 'surface-check@tahara.ai',
      }),
    });
    if (!targetRes.ok) {
      const err = await targetRes.text();
      return NextResponse.json({ error: { code: 'target_failed', detail: err } }, { status: 502 });
    }
    const target = await targetRes.json();

    const scanRes = await fetch(`${ARIE_API}/scans`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        target_id: target.id,
        budget_minutes: 120,
      }),
    });
    if (!scanRes.ok) {
      const err = await scanRes.text();
      return NextResponse.json({ error: { code: 'scan_failed', detail: err } }, { status: 502 });
    }
    const scan = await scanRes.json();

    return NextResponse.json({
      scanId: scan.id,
      targetId: target.id,
      statusUrl: `/api/surface-check/${scan.id}`,
    }, { status: 202 });
  } catch (e: any) {
    return NextResponse.json({ error: { code: 'server_error', detail: e.message } }, { status: 500 });
  }
}
