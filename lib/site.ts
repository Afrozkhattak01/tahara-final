// Single source of truth for the production origin.
//
// Used by app/layout.tsx (metadataBase), app/robots.ts and app/sitemap.ts so
// the three can never disagree. Resolution order:
//   1. NEXT_PUBLIC_SITE_URL  — set this in Vercel once a custom domain exists.
//   2. VERCEL_PROJECT_PRODUCTION_URL — injected by Vercel, always the stable
//      production hostname (not the per-deploy preview URL).
//   3. The current Vercel project URL, for local/preview builds.
const FALLBACK = 'https://tahara-final1.vercel.app';

function resolve(): string {
  const explicit = process.env.NEXT_PUBLIC_SITE_URL;
  if (explicit) return explicit.replace(/\/+$/, '');

  const production = process.env.VERCEL_PROJECT_PRODUCTION_URL;
  if (production) return `https://${production}`;

  return FALLBACK;
}

export const SITE_URL = resolve();
