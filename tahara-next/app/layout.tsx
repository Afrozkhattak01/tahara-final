import type { Metadata } from 'next';

// Root layout — deliberately minimal. It owns only <html>/<body> and shared
// defaults. It imports NO global stylesheet, so the landing page's CSS reset
// cannot leak into other sections of the site. Each route group brings its own
// styling: the landing page via app/(marketing)/landing.css, future app pages
// via their own stylesheets/components.
export const metadata: Metadata = {
  title: { default: 'Tahara AI', template: '%s · Tahara AI' },
  description: 'Tahara AI'
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
