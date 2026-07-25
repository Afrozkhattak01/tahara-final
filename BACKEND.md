# Tahara AI — Backend Integration Guide

Handoff document for the backend developer. Written against commit `e72b433`.

- **Live:** https://tahara-final1.vercel.app
- **Repo:** https://github.com/Afrozkhattak01/tahara-final (auto-deploys `main`)
- **Stack:** Next.js 14 (App Router), React 18, TypeScript. Hosted on Vercel.

---

## 1. Read this first — current state

**There is no backend today. Not a partial one — none.**

- No `app/api/` directory exists.
- There are **zero** `fetch`, `XMLHttpRequest` or any other network calls in the entire
  frontend, other than static asset loads (Google Fonts, `cdn.simpleicons.org` logos).
- No database, no auth, no session, no email, no environment variables beyond a
  Vercel-issued `VERCEL_OIDC_TOKEN` in `.env.local`.
- Every form on the site calls `preventDefault()` and stops. Every number shown is a
  hardcoded constant in a JavaScript array.

So this is a **greenfield backend**, not an integration into something existing. Nothing
you build has to accommodate a legacy contract. Nothing will break if you change shape
early.

`zod@3.23.8` is already in `dependencies` and currently unused — it was added in
anticipation of request validation. Use it or remove it.

---

## 2. Architecture you're joining — the one thing that will surprise you

This repo has **two very different worlds**, and mixing them will cause problems.

### World 1 — the landing page (`/`) is NOT React

The homepage is a hand-built HTML file driven by a ~2,600-line vanilla JavaScript engine.
It is deliberately not componentised. Three files work together:

| File | Role |
| --- | --- |
| `app/(marketing)/tahara-body.html` | the markup |
| `public/tahara-engine.js` | the engine — all behaviour, all content data, i18n |
| `app/(marketing)/landing.css` | all styling |

`app/(marketing)/page.tsx` reads the HTML file at **build time** with `fs.readFileSync`
and passes it to a client component, which injects it and then loads the engine once.

**Consequences for you:**

- You cannot add a React hook, state, or a `fetch` inside the landing page the normal way.
  Client-side calls from the homepage must be written in **plain JavaScript inside
  `public/tahara-engine.js`**.
- The homepage is **statically prerendered**. If it ever becomes dynamic (SSR), the
  `fs.readFileSync` needs rethinking — files in `public/` are not bundled into serverless
  functions.
- Do **not** rewrite the landing page into React. That's a standing project rule. It is
  animation-heavy and working; a rewrite would be a large regression risk for no gain.

### World 2 — everything else is standard Next.js

`app/platform/governance/page.jsx` is the working template. New pages, API routes, and
anything you build are **normal React/Next.js** with no restrictions. Root layout
(`app/layout.tsx`) is deliberately minimal and loads no global CSS, so the two worlds
never collide.

**Put all API routes in `app/api/*/route.ts`.** These are standard Next.js Route Handlers
and are entirely unaffected by the landing-page architecture.

---

## 3. What needs a backend — ordered by priority

Everything below is currently non-functional UI. Each entry says exactly where the
frontend hook lives.

### 3.1 Create account — **not wired**

- **UI:** `app/(marketing)/tahara-body.html:38-69`, form id `acctForm`
- **Current behaviour:** `public/tahara-engine.js` attaches `submit → preventDefault()`.
  Nothing is sent. The modal even says *"Demo interface. No account is created and
  nothing is sent."*
- **Fields present:** Full name, Organisation, Work email, Password, terms checkbox.
- **Note:** there is a password-strength meter, but it is **visual only** — it checks
  length ≥ 10, one digit, one symbol, purely to animate a bar. It is not validation and
  must not be trusted as such.

Suggested contract:

```
POST /api/auth/signup
  { name, organisation, email, password, acceptedTerms }
  → 201 { userId }                       account created, verification email sent
  → 400 { error, field? }                validation failure
  → 409 { error: 'email_exists' }
```

The copy promises *"Use your work address — we verify the domain"*, so free-mail domain
rejection is an expected rule, not an optional extra.

### 3.2 Sign in — **not wired**

- **UI:** `tahara-body.html:72-99`, form id `signinForm`
- Same story: submit is swallowed.
- The modal offers **Microsoft** and **Okta** SSO buttons. These are **decorative** — no
  OAuth flow exists behind either. If SSO is in scope, that's a full build, not a hookup.
- There is a "Keep me signed in" checkbox and a "Forgot password" link, neither functional.

```
POST /api/auth/signin        { email, password, remember } → session cookie
POST /api/auth/forgot        { email } → 202
GET  /api/auth/session       → current user or 401
POST /api/auth/signout
```

**No session mechanism exists.** Pick one (recommend httpOnly cookie set by a Route
Handler) — nothing in the frontend constrains the choice.

### 3.3 Surface check — **not wired at all, not even a stub**

- **UI:** `tahara-body.html:20-35`. Opened from the top ribbon.
- The **"Run check" button has no click handler whatsoever.** The modal opens, the input
  accepts text, the button does nothing. This is the most visible gap: the ribbon
  advertises *"FREE — Run an AI surface check on your endpoint"* on every page load.
- Input is a URL fragment; the `https://` prefix is displayed as static text beside the
  field, so the submitted value will not include a scheme.

```
POST /api/surface-check   { endpoint }
  → 202 { jobId }                        scanning is asynchronous
GET  /api/surface-check/:jobId
  → { status: 'pending'|'done'|'failed', findings[] }
```

This one endpoint takes a **user-supplied URL and makes a request to it**. Treat it as
hostile input: it is a textbook SSRF vector. Block private/link-local ranges, cloud
metadata endpoints (`169.254.169.254`), redirects to internal hosts, and non-HTTP
schemes. Rate-limit by IP — it is unauthenticated and public.

### 3.4 Request a demo / Ask our team — **not wired**

Buttons appear in several places: nav, hero area, mega-menu demo panel, FAQ footer,
closing CTA. None have handlers.

```
POST /api/contact   { type: 'demo'|'question', name, email, company, message }
```

Needs an email/CRM destination. None is configured.

### 3.5 Assurance dashboard — hardcoded demo data

- **Data:** `public/tahara-engine.js`, the `MODULES` array (line 2304), with a parallel
  `MODULES_AR` Arabic overlay directly beneath it.
- All four tabs (Discover / Govern / Adversarial / Guardrails) render from static
  constants — every metric, sparkline and bar is fabricated for display.
- This is a **marketing illustration**. Decide explicitly whether it should ever show real
  tenant data. If yes it needs auth first, and the engine's render function must be
  rewritten to consume an API response instead of a literal.
- If you do wire it: the Arabic overlay supplies **text only**, and numbers come from the
  English array by design so the two languages cannot drift. Keep that property.

### 3.6 Pages that don't exist

- `/platform/governance/master` and `/platform/governance/specific` — the governance page
  links to both (`app/platform/governance/page.jsx:47`). **Both 404 today.**
- All **22 platform mega-menu items** are intentionally inert — they point at `#platform`
  and carry no destination. The menu data structure already supports an optional href as
  the 4th tuple element (`PLATFORM_MENU` in the engine), so adding real routes later is a
  data change, not a code change.
- `/platform/governance` itself is live but currently **unreachable from the nav**.

---

## 4. Conventions to follow

### Bilingual — this matters for API design

The site is fully EN/AR with `dir="rtl"` switching. **Anything your API returns that a
user will read must be localised**, or the Arabic page will show English strings.

Two options — pick one and be consistent:

1. **Return keys, not sentences.** API returns `{ error: 'email_exists' }`; the frontend
   maps it to a message in the `I18N` dictionary in `tahara-engine.js`. **Recommended** —
   it matches how every other string on the site already works.
2. Accept an `Accept-Language` header or `?lang=` param and return translated text.

Do **not** return raw English error strings for display. The current language is readable
at runtime via `window.TaharaI18N.current` (`'en'` or `'ar'`).

### Untranslatable terms

Brand and standard names stay in Latin script even in Arabic copy: `Tahara AI`,
`ISO/IEC 42001`, `EU AI Act`, `NIST AI RMF`, `OWASP LLM Top 10`, `MITRE ATLAS`, `AIUC-1`,
`SOC 2`, `GDPR`, `MCP`, and the `LLM01`–`LLM07` codes. Numbers use Western digits
(`412`, `8,412`) throughout, deliberately.

### Calling an API from the landing page

Write it in `public/tahara-engine.js` as a self-contained IIFE, matching the existing
style (see the surface-check and auth-modal blocks near the end of the file). Plain
`fetch`, no framework. From any **other** page, use normal React.

### Editing rules

| To change | Edit |
| --- | --- |
| Landing markup | `app/(marketing)/tahara-body.html` |
| Landing behaviour, content data, translations | `public/tahara-engine.js` |
| Landing styles | `app/(marketing)/landing.css` |
| Anything else | normal React in its own route group |

**i18n gotcha:** any element with `data-i18n="key"` has its text overwritten from the
`I18N` dictionary on load. Editing the HTML alone will be silently discarded — change the
dictionary entry instead.

---

## 5. Running it

```bash
npm install
npm run dev                   # http://localhost:3000 — editing
npm run build && npm start    # http://localhost:3000 — production speed
npm run typecheck             # tsc --noEmit
npm run lint
```

**Run only one at a time.** `dev` and `build` share `.next` and corrupt each other —
symptoms are blank pages, 500s, or `Cannot find module ./NNN.js`. Fix: stop everything,
delete `.next`, restart one mode.

**Two build-time gotchas that will waste your afternoon:**

1. `tahara-body.html` is read at **build time**. Editing it and refreshing `next start`
   changes nothing — you must rebuild.
2. Files added to `public/` (e.g. logos) are **snapshotted at build time** by
   `next start`. A new file 404s until you rebuild.

`public/tahara-engine.js` is served as a static asset, so in dev it updates on hard
refresh — but for a production server you rebuild anyway.

### Environment variables

There are none yet beyond Vercel's own. Add them in the Vercel dashboard and to
`.env.local` for local work. `.env*` is gitignored — **never commit secrets**. Note
`VERCEL_OIDC_TOKEN` in the existing `.env.local` is machine-generated; don't copy it
between machines.

---

## 6. Security notes specific to this codebase

- **`/api/surface-check` is the sharpest edge** — see §3.3. Unauthenticated, public,
  takes a URL, and fetches it.
- **Rate-limit every public endpoint.** All the forms above are unauthenticated and
  reachable from the homepage.
- The password meter is decorative. Enforce real policy server-side.
- The site's own marketing promise is *"Runs in your tenancy. Nothing leaves your
  boundary."* Bear that in mind before adding third-party trackers or analytics that
  would contradict it. Note the marquee already loads 18 logos from `cdn.simpleicons.org`
  at page view, which is a third-party request on every visit — flagged for awareness.
- `dangerouslySetInnerHTML` is used in `TaharaRuntime.tsx`, but only for a build-time
  local file with no user input. Keep it that way: **never** route API data through it.

---

## 7. Suggested first steps

1. Create `app/api/health/route.ts` returning `{ ok: true }` — confirms Route Handlers
   deploy correctly on this Vercel project before anything real depends on it.
2. Pick the session mechanism and build `/api/auth/*` (§3.1, §3.2).
3. Wire the two auth modal forms in `public/tahara-engine.js` — replace the
   `preventDefault()` no-op with a real `fetch`, and add error rendering that reads from
   the `I18N` dictionary.
4. Build `/api/contact` (§3.4) — lowest complexity, immediate business value.
5. Then decide, as a product question rather than a technical one, whether the assurance
   dashboard ever shows real data (§3.5).

---

## 8. Known gaps and rough edges

- `/platform/governance/master` and `/specific` 404.
- The Create account modal is only reachable from inside the Sign in modal — the direct
  trigger was removed.
- Two marquee brands (AI21, Cohere) have no logo and fall back to a geometric glyph.
- Dead folders in the repo root: `_legacy/ components/ content/ lib/ styles/ scripts/`.
  Unused by the live app, excluded from `tsconfig.json`, safe to delete.
- Some dictionary entries are orphaned after recent UI removals (`cta.talkeng`,
  `nav.signup`) — harmless, kept so the buttons can be restored with translations intact.
