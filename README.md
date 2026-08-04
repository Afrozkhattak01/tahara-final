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
4. **Push pending work** — lots of edits were made locally; run `git status` and
   `git push` to deploy (auto-deploys) if anything is uncommitted.
5. **Optional cleanup** — delete the dead `_legacy/ components/ content/ lib/
   styles/` folders (unused; already excluded from tsconfig).

**How to run:** `cd` to repo root → `npm run dev` (edit) OR `npm run build && npm
start` (real speed). ⚠️ Run **one at a time** — dev + build share `.next` and
corrupt it (fix: delete `.next`, restart).

**Golden rule:** don't rewrite the landing page into React unless explicitly asked.
Edit it in place. New features = standard React in their own route group.

---

## Languages / stack

If asked "what's it built with": **"A Next.js (React) app in TypeScript; the
landing page is HTML + CSS + vanilla JavaScript."**

| Layer | Tech |
| --- | --- |
| Framework / lib | Next.js 14 (App Router), React 18 |
| App shell / new pages | TypeScript (`.tsx` / `.jsx`) |
| Landing markup | HTML (`app/(marketing)/tahara-body.html`) |
| Landing engine | Vanilla JavaScript (`public/tahara-engine.js`, ~2000 lines) |
| Styling | CSS (`landing.css`, `governance.css`) |
| Fonts | Google Fonts — Plus Jakarta Sans (hero), Inter Tight, Inter, JetBrains Mono |
| Icons | simpleicons.org CDN (connector marquee) |

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

public/
  tahara-engine.js              ← landing ENGINE (must stay here; loaded as /tahara-engine.js)

next.config.mjs                 Next config (images.remotePatterns: cdn.simpleicons.org)
vercel.json                     pins framework=nextjs (fixes Vercel serving-as-static bug)
tsconfig.json                   excludes _legacy/components/content/lib/styles

_legacy/ components/ content/ lib/ styles/ scripts/   DEAD — unused by the live app,
                                excluded from tsconfig, safe to delete
```

> The three landing files work together: **markup** (`tahara-body.html`) +
> **engine** (`tahara-engine.js`) + **styles** (`landing.css`).

---

## Current state — what the landing page contains (top to bottom)

- **Ribbon:** navy "FREE" badge + "Run an AI surface check on your endpoint →".
  Clicking it opens the **surface-check modal** ("See what your AI exposes", input
  + illustrative "Run check").
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

| To change… | Edit… |
| --- | --- |
| Text / markup / structure | `app/(marketing)/tahara-body.html` |
| Translated text (EN/AR), menu data, rotating words, dashboard data | `public/tahara-engine.js` |
| Colors / fonts / spacing / layout | `app/(marketing)/landing.css` |

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

---

## Roadmap / planned

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
