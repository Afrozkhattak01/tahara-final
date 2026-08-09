# Tahara AI — Website

Marketing website for **Tahara AI**, an AI assurance platform. Built with
**Next.js 14 (App Router) + React 18 + TypeScript**. Navy theme.

- **Live:** https://tahara-final1.vercel.app
- **GitHub:** https://github.com/Afrozkhattak01/tahara-final (auto-deploys `main`)
- **Vercel project:** `tahara-final1` (framework pinned to Next.js via `vercel.json`)

---

## GitHub / Git remotes

- **Primary repo (push):** https://github.com/Afrozkhattak01/tahara-final — remote `afroz`
- **Upstream / source repo:** https://github.com/zaynab-cyber/Tahara_core — remote `origin`
- **Default branch:** `main`
- **Auto-deploys to:** Vercel project `tahara-final1` on push to `main`

---

## 🟢 START HERE (handoff for the next session)

**What this is:** a mostly-finished landing page (`/`) plus one real React page
(`/platform/governance`). The landing page is deliberately **NOT React** — it's a
hand-built HTML + vanilla-JS design served through a thin React wrapper. Everything
new/other is standard React/Next.

**Immediate open items / next steps:**

1. **Build the Governance sub-pages** — the Governance page CTAs link to
   `/platform/governance/master` and `/platform/governance/specific`, which **don't
   exist yet → they 404.** Build these as normal React pages.
2. **Connector logos** — the "Sits next to the stack you already run" marquee uses
   monochrome Simple Icons glyphs. The user wants **real full-color brand logos**
   and will likely add them. (A drop-in `public/logos/` approach was prototyped
   then reverted; see "Connector marquee" below.)
3. **Translate new sections** — the dashboard, the "One record of truth" cards, and
   the surface-check modal are **English-only** (no Arabic yet). Everything else
   is EN/AR via the engine dictionary.
4. **Finish the cookie consent work** — the **banner UI exists and is live on every
   page**, but nothing behind it does. No consent is recorded, and the cal.com embed
   still loads before anyone answers. See **"Cookie consent"** below for the exact
   remaining steps.
5. **Push pending work** — lots of edits were made locally; run `git status` and
   `git push` to deploy (auto-deploys) if anything is uncommitted.
6. **Optional cleanup** — delete the dead `_legacy/ content/ lib/ styles/` folders
   (unused; already excluded from tsconfig). ⚠️ **`components/` is no longer safe to
   delete** — `CookieBanner.tsx` lives there and the root layout imports it.

**How to run:** `cd` to repo root → `npm run dev` (edit) OR `npm run build && npm
start` (real speed). ⚠️ Run **one at a time** — dev + build share `.next` and
corrupt it (fix: delete `.next`, restart).

**Golden rule:** don't rewrite the landing page into React unless explicitly asked.
Edit it in place. New features = standard React in their own route group.

---

## Languages / stack

If asked "what's it built with": **"A Next.js (React) app in TypeScript; the
landing page is HTML + CSS + vanilla JavaScript."**

| Layer                 | Tech                                                                                                         |
| --------------------- | ------------------------------------------------------------------------------------------------------------ |
| Framework / lib       | Next.js 14 (App Router), React 18                                                                            |
| App shell / new pages | TypeScript (`.tsx` / `.jsx`)                                                                                 |
| Landing markup        | HTML (`app/(marketing)/tahara-body.html`)                                                                    |
| Landing engine        | Vanilla JavaScript (`public/tahara-engine.js`, ~2000 lines)                                                  |
| Styling               | CSS (`landing.css`, `governance.css`) + one CSS Module (`CookieBanner.module.css`)                           |
| Fonts                 | Google Fonts — Libre Caslon Text (display), Archivo (body), IBM Plex Mono (data), IBM Plex Sans Arabic (RTL) |
| Icons                 | simpleicons.org CDN (connector marquee)                                                                      |
| Third party           | cal.com embed (`app.cal.com/embed/embed.js`, loaded from the root layout)                                    |

---

## Architecture — the "two worlds"

**World 1 — the landing page (`/`), intentionally NOT React components.**
A large hand-tuned design driven by a ~2000-line vanilla-JS engine (canvas 3D
background, scroll/assembly animations, rotating hero, EN/AR toggle, mega-menus,
drawer, modals, the animated dashboard). Kept intact and served through React:

- `app/(marketing)/page.tsx` — Server Component; reads `tahara-body.html` at build
  and passes it to the runtime (so markup is in the initial HTML; `/` is **static**).
- `app/(marketing)/TaharaRuntime.tsx` — Client Component; injects the markup, then
  loads `public/tahara-engine.js` **once**.
- `app/(marketing)/landing.css` — all landing styles, scoped to the `(marketing)`
  route group (Next loads route CSS per-segment → never leaks to other pages).

**World 2 — everything else: standard React/Next.js.**
`app/platform/governance/page.jsx` is the working template. New pages go in their
own route group with their own CSS/components.

**Why they never collide:** root layout (`app/layout.tsx`) is minimal — `<html>`/
`<body>` + default metadata, **no global CSS**. The landing CSS + engine load only
on `/`. New pages never import `landing.css` or `tahara-engine.js`.

---

## Project structure (repo root — the app was flattened here)

```
app/
  layout.tsx                    minimal ROOT layout (html/body, NO global CSS)
                                — also mounts <CookieBanner /> + the cal.com loader
  (marketing)/                  route group — "()" adds no URL, serves at "/"
    layout.tsx                  loads landing CSS + fonts + metadata (scoped)
    page.tsx                    Server Component — reads tahara-body.html
    TaharaRuntime.tsx           Client Component — injects markup, boots engine
    tahara-body.html            ← landing page MARKUP (moved here from public/)
    landing.css                 ← landing STYLES
  platform/
    governance/
      page.jsx                  → /platform/governance (real React page)
      governance.css            scoped styles

components/
  CookieBanner.tsx              ← LIVE — cookie banner, imported by the ROOT layout
  CookieBanner.module.css       ← its scoped styles (a CSS Module, not global CSS)
  everything else here          DEAD (Header.tsx, sections/, LanguageProvider, …)

public/
  tahara-engine.js              ← landing ENGINE (must stay here; loaded as /tahara-engine.js)

next.config.mjs                 Next config (images.remotePatterns: cdn.simpleicons.org)
vercel.json                     pins framework=nextjs (fixes Vercel serving-as-static bug)
tsconfig.json                   excludes _legacy/components/content/lib/styles

_legacy/ content/ lib/ styles/ scripts/   DEAD — unused by the live app, excluded
                                from tsconfig, safe to delete
```

> ⚠️ **`components/` used to be dead and is not any more.** Before the cookie banner,
> `app/` imported nothing from it. Deleting the folder now breaks the build. Only
> `CookieBanner.tsx` + `CookieBanner.module.css` are live; the rest is still dead.
>
> Note `components/` is still in **tsconfig's `exclude` list**. The banner is
> type-checked anyway, because `tsc` follows the import from `app/layout.tsx` — but
> nothing else in that folder is. If more live components move here, drop
> `"components"` from `exclude` (expect errors from the dead files) or move the
> banner into `app/`.

> The three landing files work together: **markup** (`tahara-body.html`) +
> **engine** (`tahara-engine.js`) + **styles** (`landing.css`).

---

## Current state — what the landing page contains (top to bottom)

- **Ribbon:** navy "FREE" badge + "Run an AI surface check on your endpoint →".
  Clicking it opens the **surface-check modal** ("See what your AI exposes", input
  - illustrative "Run check").
- **Header/nav:** brand, Platform (mega-menu), Lifecycle, Architecture, **Resources
  (compact dropdown)**, FAQ, EN/AR toggle, Sign in, Request a demo.
  - Platform mega-menu "Applicability engine" → `/platform/governance`.
  - Menu items carry an optional **6th tuple element = destination URL**.
  - Platform & Resources dropdowns are **mutually exclusive** (one open at a time).
- **Hero:** "Know what your AI did, and **[rotating navy phrase]**" cycling
  `govern it. → test it. → prove it. → defend it.` (blur cross-fade). Sub-line
  "Discovery, live enforcement and audit-ready evidence." Buttons: "Explore
  platform", "See how it works". Font: **Plus Jakarta Sans**.
- **Assurance dashboard** (replaced the old console): **4 tabs** — Discover /
  Govern / Adversarial / Guardrails — data-driven from a `MODULES` array in the
  engine. Animates on view + each tab click (count-up numbers, sparkline draw, bar
  fill). Wider/rectangular card.
- **Standards marquee:** "Mapped to the standards your board reads" (icon marquee).
- **Platform section** "One record of truth.": **3 cards** — SCAN (numbers count
  up), RUNTIME POLICY (tokens pop in + "Policy enforced"), AUDIT TRAIL (search types
  out → Sealed rows slide in). Equal-height.
- **Lifecycle** "Cover the whole life of a model.": **4 equal-height cards**
  (Assess ✓ / Govern / Test / Monitor), 2 bullets each, timeline on top.
- **Architecture stack:** pinned scroll-driven 3D isometric stack; text reveals
  with a **typewriter as each layer assembles**; after assembly, **hover a layer →
  only its text shows** (plain uppercase text, no box).
- **Connectors** "Sits next to the stack you already run." + "Browse connectors →".
- Frameworks, FAQ, closing CTA, footer.

**Governance page** (`/platform/governance`): standard React; "What are you being
held to?" with two assessment-route cards (master vs. specific). Own scoped CSS +
tokens. CTAs → `/master` and `/specific` (not built yet).

---

## Editing the landing page

| To change…                                                         | Edit…                              |
| ------------------------------------------------------------------ | ---------------------------------- |
| Text / markup / structure                                          | `app/(marketing)/tahara-body.html` |
| Translated text (EN/AR), menu data, rotating words, dashboard data | `public/tahara-engine.js`          |
| Colors / fonts / spacing / layout                                  | `app/(marketing)/landing.css`      |

**⚠️ i18n gotcha:** elements with `data-i18n="key"` get their text from a dictionary
in `tahara-engine.js` at load — editing the HTML alone is overwritten. Change the
`en:` / `ar:` value in the dictionary. Elements without `data-i18n` edit in the HTML.

**Key spots in `tahara-engine.js`:** the i18n dictionary (`I18N`), `PLATFORM_MENU` /
`PLATFORM_MENU_AR` (mega-menu; 6th tuple element = href), `MARQUEE_ROW_*` /
`MARQUEE_SLUG` (connectors), the dashboard `MODULES` array + render/animate IIFE,
the hero rotating-word IIFE, the surface-modal IIFE, the platform count-up IIFE.

**After editing `tahara-body.html` or `landing.css` → rebuild** (they're read at
build time). `tahara-engine.js` is served static, but for the prod server you
rebuild anyway.

---

## Cookie consent

**Status: front end only. The banner is live; nothing behind it is.**

### What exists

| File                                 | What it is                                                                                                                                                                  |
| ------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `components/CookieBanner.tsx`        | The banner. Client Component, mounted from the **root** layout so it appears on every route — landing, `/resources`, `/platform/governance`.                                |
| `components/CookieBanner.module.css` | Scoped styles. A **CSS Module** on purpose: the root layout imports no global CSS, and the module keeps the banner from leaking into the landing reset or `governance.css`. |

Design notes worth keeping if it gets rewritten:

- Palette values are **restated** in the module, not read from `landing.css` custom
  properties — those only exist inside the `(marketing)` route group, so the banner
  would render unstyled on `/platform/governance` if it depended on them.
- **EN/AR automatic.** A `MutationObserver` watches `dir`/`lang` on `<html>`, which
  covers both language systems (the engine on `/`, `LanguageProvider` elsewhere)
  without the banner knowing which is driving. Positioned with `inset-inline-start`
  so it moves to the opposite corner under RTL.
- **`z-index: 118`** — deliberately _below_ the surface/account modals (121–131), so
  an open dialog covers it instead of the card floating over its scrim.
- **Accept and reject are equal size, same row.** An easier accept than reject is the
  most common way a consent banner is found non-compliant.
- Appears after a **1.2s delay** so it doesn't land on the landing page's intro run.

### What does NOT exist yet

1. **No consent is recorded.** Both buttons do the same thing — dismiss and set a
   localStorage flag, `tahara-cookie-banner-dismissed`. Named that way on purpose so
   nobody mistakes it for a consent record. Nothing reads it to decide anything.
2. **cal.com is not gated.** `app/layout.tsx` injects `app.cal.com/embed/embed.js`
   into `<head>` on **every page, on load**, before the visitor answers. This is the
   one third-party script on the site and the entire reason the banner exists.
3. **The policy link 404s.** It points at `/privacy`, which isn't built.
4. **No way to change your mind** — no "Cookie settings" link anywhere.
5. Banner strings are **inline in the component**, not in `content/i18n.ts` where the
   rest of the translations live. The Arabic has not been reviewed by a native speaker.

### Procedure to finish it

**Step 0 — scope.** The non-essential list is exactly one item: the cal.com embed.
No analytics, no ads, no pixels. `tahara-lang` is a user-set preference (functional,
stays exempt) — document it, don't gate it.

**Step 1 — real cookie.** Replace the localStorage flag with `tahara-consent`.
Version the value (`v1:…`) so you can re-ask when the cookie set changes.
`Max-Age` ~6 months, `SameSite=Lax`, `Secure`, `Path=/`, and **not `HttpOnly`** —
client JS has to read it to decide whether to load a script. That flag is the one
people get wrong.

**Step 2 — gate client-side, not server-side.** `/` is **statically prerendered**
(`○ /` in the build output). Calling `cookies()` in `app/layout.tsx` makes the whole
tree dynamic and gives up CDN delivery. Read the cookie in a Client Component instead
and keep the static render.

**Step 3 — cal.com.** Move the inline script out of `app/layout.tsx`.
⚠️ **cal.com _is_ the demo booking** — `data-cal-link` is on buttons in
`tahara-body.html`, the governance page and the resources pages. Gate it naively and
every "Request a demo" button silently dies for anyone who rejects.

Recommended instead: **load `embed.js` on first click of a demo button.** A widget the
visitor explicitly asked for is generally treated as necessary for a service they
requested, so it needs no consent — _and_ the script stops shipping to every visitor
who never books. The catch: `embed.js` auto-binds `data-cal-link` at load, so
click-to-load means intercepting the click, loading the script, then opening the modal
yourself. That's the only fiddly part of this job.

**Step 4 — withdrawal.** A "Cookie settings" link in the footer that reopens the
banner. Withdrawing has to be as easy as consenting.

**Step 5 — policy page.** `/privacy` (or `/cookies`), listing each cookie: name,
purpose, duration, who sets it.

**Step 6 — optional consent log.** A `app/api/consent/route.ts` recording timestamp +
version + choices, if you want the evidence trail the product itself is about. Note
that logging IP/user-agent is personal data with its own basis and retention questions.

> Engineering guidance, not legal advice — confirm the specifics for your markets with
> someone qualified.

---

## Known weaknesses / caveats

1. **Landing page is one big HTML file + a 2000-line engine** — granular edits are
   manual; there's no componentization. This was a deliberate trade-off (don't
   rewrite a working animation-heavy page). Migrate section-by-section only if
   frequent content changes justify it.
2. **`fs.readFileSync` in `page.tsx`** reads the markup at **build time** — fine
   because `/` is statically prerendered. If the page ever became dynamic, the file
   read would need rethinking (public files aren't bundled into serverless funcs).
3. **New sections are English-only** (dashboard, platform cards, surface modal).
4. **Connector marquee** = monochrome glyphs, not real logos (see next steps).
5. **Governance sub-pages 404** (`/master`, `/specific` not built).
6. **Dead folders** (`_legacy/ components/ content/ lib/ styles/`) clutter the repo.
7. **Dev cache fragility:** running `npm run dev` and `npm run build` at the same
   time corrupts `.next` (blank/500 pages, "Cannot find module ./NNN.js"). Fix:
   stop servers, delete `.next`, restart **one** mode.
8. **Repo history:** the app was **flattened** to the repo root (it used to be
   nested in a `tahara-next/` subfolder) so Vercel's Root Directory can be `./`.
9. **cal.com loads pre-consent** — a third-party script fires on every page before
   the visitor answers the cookie banner. Awkward for a company whose own product
   sells "Cookie & consent — banner rules, tracker checks". See "Cookie consent".
10. **`components/` is half-dead** — one live file (the cookie banner) in a folder
    that is otherwise unused _and_ still listed in tsconfig's `exclude`.
11. **`/logos/*.svg` all 404** — the connector marquee requests ~19 local logo files
    (`anthropic`, `meta`, `okta`, `datadog`, …) that aren't in `public/`. Visible in
    the dev server log on every page load. Falls back to glyphs, so nothing looks
    broken, but the requests are wasted.

---

## Roadmap / planned

- **Finish cookie consent** — real cookie, gate/lazy-load cal.com, footer "Cookie
  settings" link, `/privacy` page. Steps written out under "Cookie consent".
- Build `/platform/governance/master` and `/platform/governance/specific` (React).
- Add real full-color connector logos.
- Arabic translations for the new sections (if wanted).
- Delete the dead folders.
- More pages (About, Pricing, Contact, Dashboard) as React in an `(app)` route group.
- Backend/API via `app/api/.../route.ts` when needed (doesn't affect animations).

---

## Run · edit · deploy

```bash
# run (from repo root) — ONE at a time
npm run dev                 # http://localhost:3000  (editing; slower dev build)
npm run build && npm start  # http://localhost:3000  (real/production speed)

# deploy
git add -A && git commit -m "..." && git push   # auto-deploys to Vercel
# or:  npx vercel --prod                          # manual deploy (CLI logged in as afrozkhattak01)
```

> "It feels slow" is almost always `npm run dev` (unminified dev build). Judge real
> speed with `build && start`, which is what Vercel serves.

---

## Connector marquee (logos) — context for next time

The marquee (`window.TaharaMarquee2` in `tahara-engine.js`, function `chip()`) builds
each icon from `MARQUEE_SLUG` via **cdn.simpleicons.org** (single-color, tinted) with
a geometric-glyph fallback. The user wants **real full-color logos**. A working
approach that was verified then reverted (per the user, to add later): map each
brand to a colored-logo slug and either (a) load from a colored-logo CDN, or (b)
serve local files from `public/logos/<slug>.svg` with the glyph as fallback. When
implementing, keep the `.mchip`/`.mlogo` CSS (single centered image scales on hover).

---

## Golden rules

1. **Landing page stays isolated** — edit `tahara-body.html` / `tahara-engine.js` /
   `landing.css` in place; **don't** rewrite it into React unless asked.
2. **New features = standard React/Next.js** in their own route group, own styles.
3. **Never import** `landing.css` or `tahara-engine.js` into other pages.
4. **Never move** `tahara-engine.js` out of `public/` (it's loaded as `/tahara-engine.js`).
5. Run **dev OR build/start** — not both. Push to `main` → site deploys itself.
6. **Don't delete `components/`** — it holds the live cookie banner now. The rest of
   its contents are still dead; the folder is not.
