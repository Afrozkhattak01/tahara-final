# Tahara AI — Website

Marketing website for **Tahara AI**, an AI assurance platform.
**Next.js 14 (App Router) + React 18 + TypeScript.** Navy theme, EN/AR bilingual.

- **Live:** https://tahara-final1.vercel.app
- **Repo:** https://github.com/Afrozkhattak01/tahara-final — auto-deploys `main`
- **Vercel project:** `tahara-final1` (framework pinned via `vercel.json`)

> **New here? Read these three sections in order:**
> [Run it](#1-run-it) → [The pages](#2-the-pages) → [The two worlds](#4-architecture--the-two-worlds).
> The third one is the mental model that makes the rest of the repo make sense.
> Everything after section 6 is reference material — skim it, don't read it.

---

## 1. Run it

```bash
npm install
npm run dev                 # http://localhost:3000  — editing (slower dev build)
npm run build && npm start  # http://localhost:3000  — real production speed
npm run typecheck           # tsc --noEmit; covers everything shipped
```

⚠️ **Run dev OR build/start, never both.** They share `.next` and corrupt each
other (blank pages, 500s, `Cannot find module ./NNN.js`). Fix: stop all node
processes, `rm -rf .next`, start one.

> "It feels slow" is almost always `npm run dev`. Judge real speed with
> `build && start` — that's what Vercel serves.

**Deploy:** `git push` to `main`. Vercel builds and ships it. (`npx vercel --prod`
for a manual deploy.)

⚠️ **`npm run lint` is not configured** — it drops into an interactive ESLint
setup wizard. Nobody has set it up yet. Use `npm run typecheck` for now.

---

## 2. The pages

Every route that exists today. **Five pages, one of them templated.**

| URL | Source file | What it is | Render |
| --- | --- | --- | --- |
| `/` | `app/(marketing)/page.tsx` → `tahara-body.html` | **The landing page.** Hand-built HTML + a ~2000-line vanilla-JS engine. Not React components — see [§4](#4-architecture--the-two-worlds). | Static |
| `/about` | `app/(marketing)/about/page.tsx` | About us. Real React. ⚠️ **Copy is deliberate placeholder** — see below. | Static |
| `/governance` | `app/(marketing)/governance/page.tsx` | **Hero only (128 lines).** `PageHero` + footer, nothing else yet — its own comment says "Sections go below `<main>` as they are decided." The smallest complete page; copy it to start a new one. | Static |
| `/resources` | `app/(marketing)/resources/page.tsx` | **The blog index** — cards, search box, category pills. | Static |
| `/resources/<slug>` | `app/(marketing)/resources/[slug]/page.tsx` | A blog article. **3 posts** today, all from `posts.ts`. | Dynamic |
| `/robots.txt` | `app/robots.ts` | Generated. | Static |
| `/sitemap.xml` | `app/sitemap.ts` | Generated; auto-includes every post in `posts.ts`. | Static |

Build output for reference (page JS / first-load JS):

```
/                    3.99 kB / 91.5 kB      /resources           7.41 kB / 118 kB
/about              15 kB    / 104 kB       /resources/[slug]    5.17 kB / 116 kB
/governance          3.56 kB / 92.8 kB
```

### ⚠️ Things that are not what they look like

- **`/about` ships placeholder copy.** Its header comment says it plainly: every
  string is filler and *says nothing true about the company*. It was written to be
  obviously fake rather than plausible, so invented founding dates or headcounts
  don't ship as fact. **Replace both the `en` and `ar` side of each string before
  anyone treats this page as real.**
- **The dashboard on `/` is a marketing illustration.** Every number is a hardcoded
  constant in `tahara-engine.js`. It is not a data view.
- **There is no backend.** No `app/api/`, no fetch calls, no database, no auth. Every
  form calls `preventDefault()` and stops. See `BACKEND.md` for the full handover spec.
- **`/governance` is a stub.** It renders a hero and a footer and stops. The older
  version of this page (two assessment-route cards, master vs. specific) was retired
  along with `/platform/*`; nothing links to `/master` or `/specific` any more.

---

## 3. Folder structure

```
app/
  layout.tsx              ROOT layout. <html>/<body>, metadataBase, NO global CSS.
                          Mounts <CookieBanner /> + the cal.com embed loader.
  robots.ts               → /robots.txt
  sitemap.ts              → /sitemap.xml  (reads posts.ts — no second list to update)

  (marketing)/            Route group. "()" adds nothing to the URL.
    layout.tsx            Loads landing.css + Google Fonts + OG/Twitter metadata.
                          Scoped to this group, so landing CSS never leaks elsewhere.
    page.tsx              → /          Server Component; reads tahara-body.html
    TaharaRuntime.tsx     Client Component; injects that markup, boots the engine
    tahara-body.html      ← LANDING PAGE MARKUP  (46 KB of hand-built HTML)
    landing.css           ← LANDING STYLES (171 KB) — also the token source for
                            every other page in this group
    AmbientBg.tsx         Shared gradient/grid background so React pages don't sit
                          on bare white next to the landing page's wash

    about/page.tsx        → /about
    governance/page.tsx   → /governance
    resources/
      page.tsx            → /resources          (index: cards, search, pills)
      posts.ts            ← ALL BLOG CONTENT — the POSTS array
      [slug]/page.tsx     → /resources/<slug>   (article + its own <style>)

components/               ALL LIVE. Every file here is imported by app/.
  SiteHeader.tsx          Shared nav + Platform mega-menu shell. Used by all four
                          React pages. (The landing page has its own header inside
                          tahara-body.html — this one does not touch it.)
  PageHero.tsx            Hero block used by /about and /governance
  CookieBanner.tsx        Cookie banner, mounted from the ROOT layout → every page
  CookieBanner.module.css Its scoped styles (CSS Module, deliberately not global)
  ReportPdf.tsx           Renders nothing; publishes window.TaharaReportPDF so the
                          vanilla engine's "Download report" button works

lib/
  site.ts                 SITE_URL — the single source of truth for the origin.
                          Feeds metadataBase, robots.ts and sitemap.ts so they can
                          never disagree. Set NEXT_PUBLIC_SITE_URL on a real domain.

public/                   Served at the URL root.
  tahara-engine.js        ← THE LANDING ENGINE (198 KB). Must stay in public/.
  tahara-mega.js          Fills + drives the Platform mega-menu on the React pages
  dash/*.png              Dashboard screenshots
  figures/*.svg           Blog chart figures, referenced from posts.ts
  logos/*.svg             6 brand logos for the connector marquee
  favicon*, og-image.png, site.webmanifest, apple-touch-icon.png

_legacy/                  DEAD CODE. Excluded from tsconfig. Ignore it entirely.
  react-rewrite/          An abandoned React port of the landing page (components/,
                          content/, styles/). Kept for reference only — NOTHING in
                          the live app imports any of it.
  app/                    Retired routes (contact, trust, lifecycle, platform/…)
  assets/                 Retired artwork
  scripts/                Retired tooling

next.config.mjs           images.remotePatterns → cdn.simpleicons.org
vercel.json               Pins framework=nextjs (fixes Vercel serving-as-static)
tsconfig.json             Excludes only _legacy/ — everything shipped is typechecked
BACKEND.md                Handover spec for whoever builds the API
```

> **`_legacy/react-rewrite/` is a trap for the unwary.** It contains a tidy-looking
> `components/sections/`, `content/` and `styles/` tree that *looks* like the site.
> It isn't. Editing anything in there changes nothing. If a file isn't under `app/`,
> `components/`, `lib/` or `public/`, it is not running.

---

## 4. Architecture — the two worlds

This is the one thing to understand before touching anything.

### World 1 — the landing page (`/`), deliberately **not** React

A large hand-tuned design driven by a ~2000-line vanilla-JS engine: canvas 3D
background, scroll/assembly animations, rotating hero, EN/AR toggle, mega-menus,
drawer, modals, the animated dashboard. It was kept intact and wrapped in React
rather than rewritten.

Three files work together:

| File | Role |
| --- | --- |
| `app/(marketing)/tahara-body.html` | **Markup** |
| `public/tahara-engine.js` | **Behaviour + all its text** |
| `app/(marketing)/landing.css` | **Styles** |

`page.tsx` reads the HTML at build time and hands it to `TaharaRuntime.tsx`, which
injects it and loads the engine once. Because the read happens at build time, `/`
stays statically prerendered.

### World 2 — everything else: ordinary React/Next.js

`/about`, `/governance`, `/resources` and `/resources/<slug>` are normal
TypeScript React pages. They live in the same `(marketing)` route group so they
inherit `landing.css`'s design tokens and fonts, and they share `SiteHeader`,
`PageHero` and `AmbientBg`.

### Why the two never collide

The **root layout imports no global CSS.** It owns only `<html>`/`<body>`, the
metadata defaults and the cookie banner. `landing.css` is imported by the
`(marketing)` layout, and Next loads route CSS per segment — so a future `(app)`
or `(dashboard)` route group gets none of it. The engine loads only on `/`.

**Golden rule:** don't rewrite the landing page into React unless explicitly asked.
Edit it in place. New features are standard React in their own route group.

---

## 5. How do I…?

| Task | Where to go |
| --- | --- |
| **Add a blog post** | Add one object to `POSTS` in `app/(marketing)/resources/posts.ts`. The card, the article page at `/resources/<slug>`, and the sitemap entry all appear automatically. No other file. |
| **Change landing page text** | If the element has `data-i18n="key"` → edit the `I18N` dictionary in `public/tahara-engine.js`. Otherwise → edit `tahara-body.html`. **See the gotcha below.** |
| **Change landing colors / layout** | `app/(marketing)/landing.css` |
| **Change the nav or mega-menu on React pages** | `components/SiteHeader.tsx` (one place, all four pages) |
| **Change the nav on the landing page** | `tahara-body.html` — the landing page has its own separate header |
| **Change mega-menu *columns*** | `public/tahara-mega.js` (React pages) / `PLATFORM_MENU` in `tahara-engine.js` (landing) |
| **Add a new page** | New folder under `app/(marketing)/` with a `page.tsx`. Start by copying `governance/page.tsx` — it's the smallest complete example. Add it to `app/sitemap.ts`. |
| **Add a page that must NOT inherit landing styles** | New route group, e.g. `app/(app)/`, with its own `layout.tsx` and stylesheet |
| **Change the site domain** | Set `NEXT_PUBLIC_SITE_URL` in Vercel. `lib/site.ts` feeds metadata, robots and sitemap from it. |

### ⚠️ The i18n gotcha

Elements with `data-i18n="key"` have their text **overwritten by the engine on
load**. Editing the HTML alone does nothing visible. Change the `en:` / `ar:` value
in the `I18N` dictionary in `tahara-engine.js` instead. Elements *without*
`data-i18n` are edited in the HTML.

**Key spots in `tahara-engine.js`:** the `I18N` dictionary · `PLATFORM_MENU` /
`PLATFORM_MENU_AR` (6th tuple element = href) · `MARQUEE_ROW_*` / `MARQUEE_SLUG`
(connectors) · the `MODULES` array + render/animate IIFE (dashboard) · the hero
rotating-word IIFE · the surface-modal IIFE · the platform count-up IIFE.

After editing `tahara-body.html` or `landing.css`, **rebuild** — they're read at
build time.

### How language works (two systems, one key)

The landing engine and the React pages both read/write the **same
`localStorage` key, `tahara-lang`**, and both set `lang`/`dir` on `<html>`. Each
React page owns its own `lang` state and syncs via a `storage` listener, so the
toggle on `/` carries across to `/about` and back. `CookieBanner` reads `<html>`'s `dir`/`lang`
first and falls back to `tahara-lang`, re-reading on a `MutationObserver` — so it
follows whichever system is driving without needing to know which.

---

## 6. Known gaps & caveats

**Content**
1. **`/about` is placeholder copy** — every string is filler (see §2).
2. **Blog posts are English only.** `POSTS` has no per-language field at all. The
   chrome around them translates; the articles don't.
3. **New landing sections are English-only** — dashboard, "One record of truth"
   cards, surface-check modal. Everything else is EN/AR.
4. **Blog figures can't be translated** — text is baked into the SVGs as positioned
   `<text>` nodes. Article and card CSS force `direction: ltr` on figures under RTL.

**Unbuilt**
5. **`/governance` has no body content** — hero and footer only, by design, pending
   a decision on what goes below it.
6. **`/privacy` 404s** — the cookie banner's policy link points at it.
7. **No backend at all.** See `BACKEND.md`.

**Technical debt**
8. **The `<footer>` is still copy-pasted into all four React pages.** The header was
   extracted into `SiteHeader.tsx`; the footer is the same job, not yet done.
9. **`npm run lint` is unconfigured** (interactive wizard on first run).
10. **~19 `/logos/*.svg` requests 404 on every page load.** The engine tries
    `/logos/<slug>.svg` first and falls back to the simpleicons CDN. `MARQUEE_SLUG`
    has 25 entries; `public/logos/` has 6 files. Nothing looks broken — the fallback
    works — but the failed requests are wasted and noisy in the dev log.
11. **Connector marquee uses monochrome glyphs**, not real full-color brand logos.
12. **`public/logo.png` is 532 KB** and loads on every page. Worth compressing.
13. **`fs.readFileSync` in `page.tsx`** is fine only because `/` is statically
    prerendered. If that page ever went dynamic, the file read needs rethinking —
    files outside the bundle aren't available to serverless functions.
14. **cal.com loads before consent** — see §7.
15. **Dev cache fragility** — never run dev and build at once (see §1).

---

## 7. Cookie consent — front end only

**The banner is live on every page. Nothing behind it is.**

`components/CookieBanner.tsx` + `CookieBanner.module.css`. Mounted from the **root**
layout so it reaches every route.

### Design decisions worth keeping if it's rewritten

- Palette values are **restated** in the module rather than read from `landing.css`
  custom properties — those exist only inside the `(marketing)` group, so the banner
  would render unstyled on any future page outside it.
- **EN/AR is automatic**: reads `<html>`'s `dir`/`lang`, falls back to the
  `tahara-lang` key, and re-reads on a `MutationObserver` over those attributes.
  Positioned with `inset-inline-start` so it flips corners under RTL.
- **`z-index: 118`** — deliberately *below* the surface/account modals (121–131), so
  an open dialog covers it rather than the card floating over its scrim.
- **Accept and reject are equal size, same row.** An easier accept than reject is the
  single most common way a consent banner is found non-compliant.
- Appears after **1.2s** so it doesn't land during the landing page's intro run.

### What does not exist

1. **No consent is recorded.** Both buttons do the same thing: dismiss and set
   `tahara-cookie-banner-dismissed` in localStorage. Named that way on purpose so
   nobody mistakes it for a consent record. Nothing reads it to decide anything.
2. **cal.com is not gated.** `app/layout.tsx` injects `app.cal.com/embed/embed.js`
   into `<head>` on every page, on load, before the visitor answers. It is the only
   third-party script on the site and the entire reason the banner exists.
3. **The policy link 404s** (`/privacy`).
4. **No way to change your mind** — no "Cookie settings" link anywhere.
5. Banner strings are **inline in the component**; the Arabic has not been reviewed
   by a native speaker.

### Procedure to finish it

**Step 0 — scope.** The non-essential list is exactly one item: the cal.com embed.
No analytics, no ads, no pixels. `tahara-lang` is a user-set preference (functional,
stays exempt) — document it, don't gate it.

**Step 1 — real cookie.** Replace the localStorage flag with `tahara-consent`.
Version the value (`v1:…`) so you can re-ask when the cookie set changes.
`Max-Age` ~6 months, `SameSite=Lax`, `Secure`, `Path=/`, and **not `HttpOnly`** —
client JS has to read it to decide whether to load a script. That flag is the one
people get wrong.

**Step 2 — gate client-side, not server-side.** `/` is statically prerendered
(`○ /` in the build output). Calling `cookies()` in `app/layout.tsx` makes the whole
tree dynamic and gives up CDN delivery. Read the cookie in a Client Component and
keep the static render.

**Step 3 — cal.com.** Move the inline script out of `app/layout.tsx`.
⚠️ **cal.com *is* the demo booking** — `data-cal-link` lives in exactly three places:
`tahara-body.html`, `components/SiteHeader.tsx` and `components/PageHero.tsx`. Gate it
naively and every "Request a demo" button silently dies for anyone who rejects.

Recommended instead: **load `embed.js` on first click of a demo button.** A widget the
visitor explicitly asked for is generally treated as necessary for a service they
requested, so it needs no consent — *and* the script stops shipping to visitors who
never book. The catch: `embed.js` auto-binds `data-cal-link` at load, so click-to-load
means intercepting the click, loading the script, then opening the modal yourself.
That's the only fiddly part of this job.

**Step 4 — withdrawal.** A "Cookie settings" link in the footer that reopens the
banner. Withdrawing has to be as easy as consenting.

**Step 5 — policy page.** `/privacy` (or `/cookies`), listing each cookie: name,
purpose, duration, who sets it.

**Step 6 — optional consent log.** `app/api/consent/route.ts` recording timestamp +
version + choices, if you want the evidence trail the product itself is about. Note
that logging IP/user-agent is personal data with its own basis and retention questions.

> Engineering guidance, not legal advice — confirm specifics for your markets with
> someone qualified.

---

## 8. The blog — `/resources`

**There is one blog and it lives at `/resources`.** Not `/blog`. It sits inside the
`(marketing)` route group, so it inherits the landing page's tokens and fonts.
Three posts, all English.

**To add a post:** add one object to `POSTS` in `posts.ts`. Nothing else. That file's
own header comment documents every field.

### Content is typed blocks, not markdown

`content` is a `Block[]` rendered in order:

```ts
{ type: 'p',  text: '…' }                                paragraph
{ type: 'h2', text: '…' }                                subheading
{ type: 'list', items: ['…', '…'] }                      bulleted list
{ type: 'figure', src: '/figures/x.svg', caption: '…' }  chart
```

Paragraphs and list items take a plain string, or an `Inline[]` for runs needing
emphasis or a link: `{ b: 'bold' }`, `{ i: 'italic' }`, `{ t: 'label', href: '…' }`.

⚠️ **`category` must be `'craft' | 'governance' | 'news'`** — it drives the filter
pills. A new value needs the pill list updated too, or the post becomes unreachable
by filter.

### Figures

Standalone SVGs in `public/figures/`, rendered as a plain `<img>` (not `next/image`,
which doesn't optimise SVG anyway). They are deliberately self-contained — fonts and
hex values are baked in, so a token change can't break them. The trade-off:
**restyling one means editing the SVG.**

The source artwork arrived in a green/sage palette and was remapped to navy —
roughly 50 hardcoded hexes per figure:

| Source | → Site | | Source | → Site | |
| --- | --- | --- | --- | --- | --- |
| `#EFF4F2` | `#edf3fb` | canvas | `#A9C0B0` | `#afc8e3` | |
| `#FFFFFF` | `#f9fbfd` | panel | `#8AAEC6` | `#558bbd` | |
| `#16332F` | `#03152f` | ink | `#4E7A5E` | `#114086` | |
| `#6E8683` | `#103f86` | muted | `#4A7391` | `#558bbd` | |
| `#D3E0DA` | `#c6d7ed` | hairline | | | |

Fonts inside the SVGs: Inter → Archivo, SF Mono → IBM Plex Mono.

### Card thumbnails

Each card's banner repeats the post title over the gradient, matching the article
page's `.post-banner`. It is `aria-hidden` — the real heading is the `<h4>` below, so
screen readers hear the title once, not twice. Title is `-webkit-line-clamp: 4`; a
longer headline clips rather than stretching one card taller than its neighbours.

### Post provenance

- Post 03 ("The Calendar Moved. The Work Didn't.") was written to fill a gap — the
  index copy said "Three pieces" while only two existed.
- The source files' `/book` CTA doesn't exist; articles use the real cal.com booking.
- Post 01's source `<meta description>` was corrupt (it spliced in a sentence from
  post 02). The standfirst was correct and is what `excerpt` uses.
- **Post 02 has no figures** where the other two have three each. It reads thinner.

---

## 9. Connector marquee — context for next time

The marquee (`window.TaharaMarquee2` in `tahara-engine.js`, function `chip()`) builds
each icon from `MARQUEE_SLUG` via **cdn.simpleicons.org** (single-color, tinted) with
a geometric-glyph fallback. Real full-color logos are wanted. A working approach was
verified then reverted: map each brand to a colored-logo slug and either load from a
colored-logo CDN, or serve local files from `public/logos/<slug>.svg` with the glyph
as fallback. Keep the `.mchip` / `.mlogo` CSS (single centered image, scales on hover).

---

## 10. Golden rules

1. **The landing page stays isolated.** Edit `tahara-body.html` / `tahara-engine.js` /
   `landing.css` in place. **Don't** rewrite it into React unless asked.
2. **New features are standard React** in their own route group, with their own styles.
3. **Never import** `landing.css` or `tahara-engine.js` into other pages.
4. **Never move** `tahara-engine.js` out of `public/` — it loads as `/tahara-engine.js`.
5. **`components/` is entirely live.** Every file in it is imported by `app/`. Nothing
   there is safe to delete.
6. **`_legacy/` is entirely dead.** Nothing imports it. Don't edit it expecting a change.
7. **The blog is `/resources`, and a new post is one object in `POSTS`.** Don't build a
   second blog somewhere else.
8. **Run dev OR build/start — not both.**
9. Push to `main` → the site deploys itself.

---

## Stack reference

If asked what it's built with: *"A Next.js (React) app in TypeScript; the landing
page is HTML + CSS + vanilla JavaScript."*

| Layer | Tech |
| --- | --- |
| Framework | Next.js 14 (App Router), React 18 |
| Language | TypeScript (strict, `noUncheckedIndexedAccess`) |
| Landing markup | HTML — `app/(marketing)/tahara-body.html` |
| Landing engine | Vanilla JS — `public/tahara-engine.js` (~2000 lines) |
| Blog content | Typed `POSTS` array — no CMS, no markdown |
| Styling | `landing.css` (tokens + landing) + one inline `<style>` block each in `/about`, `/resources`, `/resources/<slug>` + one CSS Module (`CookieBanner`) |
| Fonts | Google Fonts — Libre Caslon Text (display), Archivo (body), IBM Plex Mono (data), IBM Plex Sans Arabic (RTL) |
| Icons | simpleicons.org CDN (connector marquee) |
| PDF | `jspdf` + `html2canvas`, dynamically imported on click only |
| Third party | cal.com embed, loaded from the root layout |
| Deploy | Vercel, auto on push to `main` |

### Git remotes

- **Primary (push):** https://github.com/Afrozkhattak01/tahara-final — remote `afroz`
- **Upstream:** https://github.com/zaynab-cyber/Tahara_core — remote `origin`
- **Default branch:** `main`

> **Repo history note:** the app was flattened to the repo root (it used to be nested
> in a `tahara-next/` subfolder) so Vercel's Root Directory can be `./`.
