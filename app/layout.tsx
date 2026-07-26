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
      <head>
        <script
          type="text/javascript"
          dangerouslySetInnerHTML={{
            __html: `
(function (C, A, L) { let p = function (a, ar) { a.q.push(ar); }; let d = C.document; C.Cal = C.Cal || function () { let cal = C.Cal; let ar = arguments; if (!cal.loaded) { cal.ns = {}; cal.q = cal.q || []; d.head.appendChild(d.createElement("script")).src = A; cal.loaded = true; } if (ar[0] === L) { const api = function () { p(api, arguments); }; const namespace = ar[1]; api.q = api.q || []; if(typeof namespace === "string"){cal.ns[namespace] = cal.ns[namespace] || api;p(cal.ns[namespace], ar);p(cal, ["initNamespace", namespace]);} else p(cal, ar); return; } p(cal, ar); }; })(window, "https://app.cal.com/embed/embed.js", "init");
Cal("init", { origin: "https://cal.eu" });
            `.trim()
          }}
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
