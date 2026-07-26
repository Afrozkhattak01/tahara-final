import { NextResponse } from 'next/server';
import { z } from 'zod';

const DemoRequest = z.object({
  name: z.string().trim().min(1, 'Name is required').max(200),
  email: z.string().trim().email('A valid work email is required').max(320),
  company: z.string().trim().max(200).optional().default(''),
  message: z.string().trim().max(4000).optional().default('')
});

// In-memory, per-instance rate limit — resets on deploy/restart. Fine as a
// first line of defence against casual abuse; swap for a real store (Redis,
// Upstash, etc.) before this handles meaningful production traffic, since
// this map won't be shared across serverless instances.
const hits = new Map<string, number[]>();
const WINDOW_MS = 60_000;
const MAX_PER_WINDOW = 5;

function rateLimited(ip: string): boolean {
  const now = Date.now();
  const recent = (hits.get(ip) || []).filter(t => now - t < WINDOW_MS);
  recent.push(now);
  hits.set(ip, recent);
  return recent.length > MAX_PER_WINDOW;
}

export async function POST(req: Request) {
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown';
  if (rateLimited(ip)) {
    return NextResponse.json({ error: 'Too many requests. Please try again shortly.' }, { status: 429 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid request body.' }, { status: 400 });
  }

  const parsed = DemoRequest.safeParse(body);
  if (!parsed.success) {
    const firstIssue = parsed.error.issues[0];
    return NextResponse.json({ error: firstIssue?.message || 'Invalid submission.' }, { status: 400 });
  }

  // Wire this to your actual CRM/email/Slack destination. Left as a
  // structured log for now — swap the console.log below for a real
  // integration before launch. Deliberately not sent to a third-party form
  // service by default, so the choice of where lead data lands stays with
  // whoever deploys this, not baked in silently.
  console.log('[demo request]', { ip, ...parsed.data, at: new Date().toISOString() });

  return NextResponse.json({ ok: true });
}
