# Tahara AI — Landing Page (Next.js + React)

The Tahara AI marketing landing page, running as a **Next.js (React + TypeScript)**
application. The page itself is a hand-crafted design — its markup, styling, and
~1900-line animation engine (the `<canvas>` 3D lattice, scroll effects, animated
counters, EN/AR language toggle, mega-menu and drawer) are served intact through
a React component, so the rendered result is identical to the original design.

---

## Tech stack

| Layer | Technology |
| --- | --- |
| Framework | Next.js 14 (App Router) |
| UI library | React 18 |
| Language | TypeScript (`.tsx`) for the app shell |
| Page content | HTML (`public/tahara-body.html`) |
| Styling | CSS (`app/globals.css`) |
| Animations / interactivity | Vanilla JavaScript (`public/tahara-engine.js`) |
| Fonts | Google Fonts (Inter Tight, Inter, JetBrains Mono) via `<link>` |
| Icons | simpleicons.org CDN (with local fallback) |

---

## Run it

```bash
npm install          # first time only — installs dependencies

# During development (live reload; intentionally slower):
npm run dev          # http://localhost:3000

# To see real performance / before deploying (fast, optimized):
npm run build        # produce the optimized production build
npm start            # serve the production build — http://localhost:3000
```

> **Important — "it feels slow" is almost always `npm run dev`.**
> Dev mode ships an unminified React *development* build and recompiles on the
> fly, so animations can stutter. That build is **never deployed**. Always judge
> speed (and demo the site) with `npm run build && npm start`, which is exactly
> what a real deployment runs. A deployed site will be as smooth as `npm start`,
> or smoother (hosts add a CDN + compression).

> **Run from the correct folder.** The project lives in the *inner*
> `tahara-next/tahara-next` directory (the one containing `package.json`).
> Running `npm run dev` one level up gives a `Could not read package.json` error.

---

## Project structure

```
app/
  layout.tsx                   minimal ROOT layout: <html>/<body> + default metadata,
                               NO global CSS (so landing styles can't leak to other pages)

  (marketing)/                 route group for marketing pages — the "()" adds no URL,
                               so the landing page still serves at "/"
    layout.tsx                 loads the landing CSS, fonts + metadata (scoped to this group)
    page.tsx                   Server Component — reads the markup, renders it (server-side)
    TaharaRuntime.tsx          Client Component — injects the markup, boots the engine once
    landing.css                all landing styling (loads only on marketing routes)

public/
  tahara-body.html             the landing markup (hero, nav, console, sections, footer…)
  tahara-engine.js             the animation/interaction engine + inline content data

_legacy/                       the previous component-based version, moved aside
                               (not built, kept for reference — safe to delete)
```

### How the landing page is wired
1. `app/(marketing)/page.tsx` (runs on the server) reads `public/tahara-body.html`
   and passes it to `TaharaRuntime`. Because this happens on the server, the markup
   is in the initial HTML — good for SEO and with no blank flash before load.
2. `app/(marketing)/TaharaRuntime.tsx` (runs in the browser) renders that markup and
   then loads `public/tahara-engine.js` **once**, after the markup exists, so the
   engine finds every element it needs.
3. `app/(marketing)/landing.css` styles the landing page and loads **only** on
   marketing routes; `app/(marketing)/layout.tsx` adds the font `<link>`s and the
   landing metadata; the root `app/layout.tsx` provides the shared `<html>` shell.

### Why the route group + scoped CSS
The landing CSS contains an aggressive global reset (`* { margin:0 }`, `body {…}`,
`:root` variables). If it were imported globally it would bleed into every future
page. Keeping it inside the `(marketing)` group means Next.js loads it **per-route**
— it reaches the browser only on marketing pages, never on `/about`, `/pricing`,
`/dashboard`, etc. Build your new sections in their own route group (e.g.
`app/(app)/…`) with their own styles/components; never import `landing.css` or
`tahara-engine.js` there.

---

## Editing content

| To change… | Edit… | Notes |
| --- | --- | --- |
| Visible text, headings, buttons | `public/tahara-body.html` | but see the i18n note below |
| Translated text (EN / AR) | `public/tahara-engine.js` | for any element with a `data-i18n` attribute |
| Nav / footer / mega-menu / FAQ / marquee | `public/tahara-engine.js` | edit the data arrays (`PLATFORM_MENU`, `FOOTER_LINKS`, `MARQUEE_ROW_1`, …) |
| Colors, fonts, spacing | `app/globals.css` | the CSS variables under `:root` at the top (`--bg`, `--ink`, greens, radii…) |
| Logo / images / video | put the file in `public/`, reference it in the markup | e.g. `<img src="/logo.png">`, `<video src="/clip.mp4">` |
| Links / make something clickable | `public/tahara-body.html` | set `href="/about"` (or `#section`) on the element |
| Page title / favicon / theme color | `app/layout.tsx` | the `metadata` and `viewport` exports |

> **⚠️ i18n gotcha.** Many elements carry a `data-i18n="some.key"` attribute. For
> those, the engine sets the text **from a dictionary** in `tahara-engine.js` when
> the page loads — so editing the text in the HTML alone will be *overwritten*.
> To change that text, edit the matching entry in the engine's translation
> dictionary (the `en:` value, and `ar:` if you also want the Arabic version).
> Elements **without** `data-i18n` can be edited directly in the HTML.

---

## Growing this into a full website

This is currently a single landing page, but it's a full Next.js app, so it
scales into a complete site:

- **New pages** — add a folder under `app/` with a `page.tsx`
  (e.g. `app/about/page.tsx` → served at `/about`). These are normal React pages
  and can be linked from the landing page.
- **Backend / data** — Next.js supports API routes (`app/api/.../route.ts`) and
  server-side data fetching, so forms, logins, and database-driven content fit
  naturally. A backend affects *data* speed only — it does **not** slow the
  page's animations, which run in the visitor's browser.
- **Reusable components** — new pages can be built as idiomatic React components.
  The landing page can also be split into components later, section by section,
  if frequent content edits or backend-driven content make that worthwhile.

---

## Deployment

Any host that runs a Next.js production build works (Vercel, Netlify, a Node
server, a container, etc.). The deployed site runs the optimized production
build — the same thing `npm start` serves locally — so expect production-level
smoothness, not the `npm run dev` experience.

```bash
npm run build
npm start        # or the host's equivalent start command
```

---

## Verified

- `npm run build` — clean; homepage prerendered as static content.
- Production server (`npm start`) — `GET /` returns **200** with the hero and
  console markup present in the server-rendered HTML; `/tahara-engine.js` serves
  **200**. The design renders identically to the original single-file HTML.
