import type { Metadata, Viewport } from 'next';
import './landing.css';

// Marketing layout — scopes the landing page's styling, fonts, and metadata to
// this route group only. Because Next.js loads a route's CSS per-segment, the
// landing reset in landing.css is sent to the browser ONLY for pages in this
// group, never for future /about, /pricing, /dashboard, etc.
export const metadata: Metadata = {
  // `absolute` opts out of the root layout's "%s · Tahara AI" title template.
  title: { absolute: 'Tahara AI — Know what your AI did, and prove it' },
  description:
    'Discovery, live enforcement and audit-ready evidence for every model, agent and prompt your organisation runs.',
  icons: {
    icon:
      "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32'%3E%3Crect width='32' height='32' rx='7' fill='%23eaf1e9'/%3E%3Crect x='8' y='8' width='16' height='16' rx='3' fill='%231f5238' transform='rotate(45 16 16)'/%3E%3C/svg%3E"
  }
};

export const viewport: Viewport = {
  themeColor: '#eaf1e9'
};

export default function MarketingLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      {/* Fonts referenced by landing.css by literal family names ('Inter Tight',
          'Inter', 'JetBrains Mono'). Next hoists these <link> tags into <head>;
          they load only on marketing routes. */}
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      <link rel="preconnect" href="https://cdn.simpleicons.org" />
      <link
        href="https://fonts.googleapis.com/css2?family=Inter+Tight:wght@500;600;700&family=Inter:wght@400;500;600&family=JetBrains+Mono:wght@400;500;600&family=Plus+Jakarta+Sans:wght@700;800&display=swap"
        rel="stylesheet"
      />
      {children}
    </>
  );
}
