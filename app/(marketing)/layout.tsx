import type { Metadata, Viewport } from 'next';
import './landing.css';

// Marketing layout — scopes the landing page's styling, fonts, and metadata to
// this route group only. Because Next.js loads a route's CSS per-segment, the
// landing reset in landing.css is sent to the browser ONLY for pages in this
// group, never for future /about, /pricing, /dashboard, etc.
const TITLE = 'Tahara AI · Know what your AI did, and prove it';
const DESCRIPTION =
  'Discovery, live enforcement and audit-ready evidence for every model, agent and prompt your organisation runs.';

export const metadata: Metadata = {
  // `absolute` opts out of the root layout's "%s · Tahara AI" title template.
  title: { absolute: TITLE },
  description: DESCRIPTION,
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: 'any' },
      { url: '/favicon-96x96.png', type: 'image/png', sizes: '96x96' }
    ],
    apple: '/apple-touch-icon.png'
  },
  manifest: '/site.webmanifest',
  // Without these, sharing a link on LinkedIn, WhatsApp or Slack renders a
  // blank card. og-image.png is the 1200x630 poster those unfurlers read.
  openGraph: {
    type: 'website',
    siteName: 'Tahara AI',
    title: TITLE,
    description: DESCRIPTION,
    images: [{ url: '/og-image.png', width: 1200, height: 630, alt: 'Tahara AI' }]
  },
  twitter: {
    card: 'summary_large_image',
    title: TITLE,
    description: DESCRIPTION,
    images: ['/og-image.png']
  }
};

export const viewport: Viewport = {
  // Light-only design — emits <meta name="color-scheme" content="light">, which
  // stops mobile browsers with forced dark mode from repainting the page.
  colorScheme: 'light',
  themeColor: '#eaf0f9'
};

export default function MarketingLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      {/* Fonts: Libre Caslon Text (display), Archivo (body), IBM Plex Mono (data).
          IBM Plex Sans Arabic is loaded for RTL/Arabic pages. Next hoists these
          <link> tags into <head>; they load only on marketing routes. */}
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      <link rel="preconnect" href="https://cdn.simpleicons.org" />
      <link
        href="https://fonts.googleapis.com/css2?family=Archivo:wght@400;500;600&family=IBM+Plex+Mono:wght@400;500&family=Libre+Caslon+Text:ital,wght@0,400;0,500;1,400&family=IBM+Plex+Sans+Arabic:wght@400;500;600;700&display=swap"
        rel="stylesheet"
      />
      {children}
    </>
  );
}
