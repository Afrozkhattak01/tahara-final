# Tahara AI — Backend Handover & Integration Specification

**Document status:** authoritative handover for backend development
**Written against commit:** `12f606a`
**Frontend:** complete and deployed · **Backend:** does not exist yet
**Live:** https://tahara-final1.vercel.app · **Repo:** https://github.com/Afrozkhattak01/tahara-final

---

## Read this before anything else

Two facts shape every decision in this document.

**1. There is no backend. Not partial — none.**
No `app/api/` directory. **Zero** `fetch`, `XMLHttpRequest` or any other network call
exists in the entire frontend beyond static asset loads. No database, no auth, no session,
no email. Every form calls `preventDefault()` and stops. Every number on screen is a
hardcoded constant. This is a greenfield backend; nothing you build must accommodate a
legacy contract.

**2. This is a two-page marketing site, not an application.**
The shipped product is a landing page plus one governance page. There is **no application
UI** — no logged-in area, no user dashboard, no tables, no file uploads, no search,
no settings, no admin. The "assurance dashboard" on the homepage is a **marketing
illustration built from hardcoded arrays**, not a data view.

Sections 8–13 of this document (dashboards, search/filter/pagination, notifications,
roles, permissions) are therefore marked **NO FRONTEND SURFACE**. They are documented as
forward-looking requirements so you can plan the data model, but **do not build endpoints
for them yet** — nothing would call them. Building against a screen that does not exist
is the fastest way to waste a sprint here.

Throughout, every API is tagged:

| Tag | Meaning |
| --- | --- |
| **REQUIRED** | A real UI element exists and is currently dead. Building this makes it work. |
| **PROPOSED** | No UI exists yet. Build only when the corresponding screen is built. |

---

# 1. Project Overview

## 1.1 What the application does

Tahara AI is the marketing website for an AI governance and assurance platform. It sells
a product that discovers AI systems in an enterprise estate, maps them to regulatory
frameworks (EU AI Act, ISO/IEC 42001, NIST AI RMF, OWASP LLM Top 10, MITRE ATLAS, AIUC-1),
runs adversarial testing, and enforces runtime guardrails on prompts.

**The website markets that product. The website is not that product.** No governance,
scanning or enforcement logic exists in this repository.

Primary conversion goals, in order of prominence on the page:

1. **Request a demo** — appears in the nav, the mega-menu, the FAQ footer and the closing CTA
2. **Run an AI surface check** — promoted in the top ribbon on every page load
3. **Create an account** — reachable only from inside the Sign in modal (see §2.6)
4. **Sign in** — nav link and mobile drawer

## 1.2 Tech stack

| Layer | Technology |
| --- | --- |
| Framework | Next.js 14.2.15 (App Router) |
| UI library | React 18.3.1 |
| Language | TypeScript 5.5.4 (`.tsx`) and JavaScript (`.jsx`, `.js`) |
| Landing page runtime | Vanilla JavaScript, ~2,600 lines, no framework |
| Styling | Hand-written CSS, no Tailwind, no CSS-in-JS |
| Validation library | `zod@3.23.8` — **installed but entirely unused** |
| Hosting | Vercel, auto-deploys `main` |
| Fonts | Google Fonts (Inter Tight, Inter, JetBrains Mono, Plus Jakarta Sans, Newsreader, IBM Plex Sans Arabic) |
| Icons | `cdn.simpleicons.org` at runtime |
| Package manager | npm |

There is no state manager, no data-fetching library, no ORM, no test framework, no CI
pipeline beyond Vercel's build.

## 1.3 Folder structure relevant to backend integration

```
app/
  layout.tsx                     ROOT layout. Minimal: <html>/<body> + default metadata.
                                 Imports NO global CSS by design.
  api/                           ← DOES NOT EXIST. Create it. All Route Handlers go here.
  (marketing)/                   Route group. "()" adds no URL segment; serves at "/".
    layout.tsx                   Loads fonts + metadata, scoped to this group
    page.tsx                     Server Component. Reads tahara-body.html at BUILD TIME
    TaharaRuntime.tsx            Client Component. Injects markup, boots the engine
    tahara-body.html             ← LANDING MARKUP (not a template — a static HTML file)
    landing.css                  ← LANDING STYLES
  platform/
    governance/
      page.jsx                   → /platform/governance (standard React page)
      governance.css             scoped styles

public/
  tahara-engine.js               ← LANDING ENGINE. All behaviour, all content data, i18n.
                                   MUST stay in public/ — loaded as /tahara-engine.js
  logos/                         6 brand SVGs for the connector marquee

next.config.mjs                  images.remotePatterns → cdn.simpleicons.org
vercel.json                      pins framework=nextjs
tsconfig.json                    excludes _legacy, components, content, lib, styles

_legacy/ components/ content/ lib/ styles/ scripts/
                                 DEAD. Unused by the live app, excluded from tsconfig.
                                 Ignore entirely. Safe to delete.
```

**Where your work goes:** `app/api/**/route.ts` for every endpoint, plus edits to
`public/tahara-engine.js` to call them from the landing page. Nothing else needs touching.

## 1.4 The architectural constraint that will surprise you

This repository contains **two incompatible worlds**.

### World 1 — the landing page (`/`) is NOT React

The homepage is a hand-built HTML file driven by a vanilla JavaScript engine. It is
deliberately not componentised. Three files work together:

| File | Role |
| --- | --- |
| `app/(marketing)/tahara-body.html` | the markup |
| `public/tahara-engine.js` | the engine: behaviour, content data, i18n dictionary |
| `app/(marketing)/landing.css` | all styling |

`page.tsx` reads the HTML with `fs.readFileSync` **at build time** and passes it to a
client component, which injects it via `dangerouslySetInnerHTML` and then loads the engine
exactly once.

**Consequences you must internalise:**

- You **cannot** add a React hook, `useState`, or a `fetch` inside the landing page.
  Client-side calls from the homepage are written in **plain JavaScript inside
  `public/tahara-engine.js`**, in the same IIFE style as the existing code.
- The homepage is **statically prerendered**. If it ever becomes dynamic (SSR), the
  `fs.readFileSync` must be reworked — files in `public/` are not bundled into
  serverless functions.
- **Do not rewrite the landing page into React.** This is a standing project rule. It is
  animation-heavy, working, and a rewrite is a large regression risk for zero gain.

### World 2 — everything else is standard Next.js

`app/platform/governance/page.jsx` is the working template. New pages, API routes and
anything you build are **normal React/Next.js with no restrictions**. The root layout
loads no global CSS, so the two worlds cannot collide.

**API Route Handlers in `app/api/` are entirely unaffected by any of this.** They are
ordinary Next.js. The constraint applies only to *calling* them from the homepage.

---

# 2. Authentication

**Current state: no authentication of any kind exists.** No session, no token, no cookie,
no password hashing, no user record. The two modals are visual mockups. Both carry the
literal disclaimer *"Demo interface. No account is created and nothing is sent."*

## 2.1 Sign up — **REQUIRED**

**UI:** `app/(marketing)/tahara-body.html:38–69`, form `id="acctForm"`
**Trigger:** `[data-signup]` — see §2.6, this is currently **unreachable**
**Current behaviour:** `public/tahara-engine.js` binds `submit → preventDefault()`. Nothing is sent.

Fields present in the DOM, in order:

| Field | Type | `autocomplete` | Placeholder | Required? |
| --- | --- | --- | --- | --- |
| Full name | `text` | `name` | Amira Khan | not enforced |
| Organisation | `text` | `organization` | Acme Bank | not enforced |
| Work email | `email` | `email` | you@company.com | not enforced |
| Password | `password` | `new-password` | At least 10 characters | not enforced |
| Terms consent | `checkbox` | — | — | not enforced |

**Critical:** the `<form>` carries `novalidate`, which **disables native browser
validation entirely**. Combined with the no-op submit handler, there is currently **zero
validation of any kind** on this form. Every rule below must be enforced server-side, and
the matching client-side messaging must be added (§20).

## 2.2 Sign in — **REQUIRED**

**UI:** `tahara-body.html:72–99`, form `id="signinForm"`
**Trigger:** `[data-signin]` on the nav "Sign in" link
**Current behaviour:** identical no-op.

| Field | Type | `autocomplete` |
| --- | --- | --- |
| Work email | `email` | `email` |
| Password | `password` | `current-password` |
| Keep me signed in | `checkbox` | — |

Also present: a **"Forgot password"** link (`href="#"`, no handler) and two SSO buttons.

## 2.3 SSO — Microsoft and Okta

**The SSO buttons are decorative.** `tahara-body.html:94–95`. No OAuth flow, no client ID,
no redirect URI, no provider configuration exists anywhere in the repository.

If SSO is in scope this is a **full build**, not an integration: register OIDC applications
with both providers, implement the authorization-code flow with PKCE, handle callback
routes, map external identities onto local users, and decide account-linking rules when
an SSO email matches an existing password account. **Budget for it as its own workstream.**
If it is not in scope for v1, remove the two buttons rather than shipping dead controls.

## 2.4 Forgot password / Reset password — **REQUIRED (link exists, target does not)**

`tahara-body.html:88` renders the link. There is **no forgot-password screen, no reset
screen, and no email template**. Both pages must be built (World 2, standard React), plus
the two endpoints.

## 2.5 OTP / MFA — **NOT APPLICABLE**

No OTP input, no MFA enrolment, no authenticator UI, no recovery-code screen exists
anywhere in the frontend. Do not build it for v1. If the product requires MFA later it is
a new feature with new screens, not an integration of something already present.

## 2.6 Session & JWT requirements

**No session mechanism exists, so the choice is entirely yours.** Nothing in the frontend
constrains it.

**Recommendation: httpOnly, Secure, SameSite=Lax session cookie set by a Route Handler.**

Rationale specific to this codebase:

- The landing page is **statically prerendered**. A token in `localStorage` would require
  client-side JS to attach it to every request, in a codebase where the homepage cannot
  use React hooks. A cookie is sent automatically and needs no engine changes.
- An httpOnly cookie is not readable by JavaScript, which matters on a page that uses
  `dangerouslySetInnerHTML` (see §17.6).
- Same-origin deployment (§18) means no cross-site cookie complications.

If you use JWTs, keep them in the httpOnly cookie rather than in `localStorage`.

**"Keep me signed in"** maps to session lifetime: unchecked → session cookie; checked →
`Max-Age` of 30 days. The checkbox exists in the DOM but is currently read by nothing.

## 2.7 Protected routes

**There are no protected routes today.** Both existing pages are public and statically
prerendered.

When an authenticated area is built, protect it with `middleware.ts` at the repository
root matching only the authenticated segment — for example `/app/:path*` or `/dashboard/:path*`.

**Do not put the marketing routes behind middleware.** `/` is static; adding middleware to
it would force dynamic rendering, break the build-time `fs.readFileSync` in `page.tsx`,
and destroy the page's performance characteristics.

---

# 3. API Specification

Conventions used by every endpoint below:

- **Base path:** `/api` (same origin — see §18)
- **Content type:** `application/json` for requests and responses
- **Auth:** session cookie, sent automatically by the browser
- **Errors:** consistent envelope, machine-readable `code`, never a display-ready sentence (§17.1)

### Standard error envelope

```json
{
  "error": {
    "code": "validation_failed",
    "field": "email",
    "requestId": "req_01HZX9K2M4"
  }
}
```

`code` is a stable snake_case key the frontend maps to localised copy. `field` is present
only for field-level validation errors. `requestId` should be logged server-side and is
useful in support tickets.

### Standard HTTP status usage

| Status | Meaning |
| --- | --- |
| 200 | Success with a body |
| 201 | Resource created |
| 202 | Accepted, processing asynchronously |
| 400 | Validation failure |
| 401 | Not authenticated |
| 403 | Authenticated but not permitted |
| 404 | Not found |
| 409 | Conflict (duplicate email) |
| 422 | Semantically invalid (unresolvable domain) |
| 429 | Rate limited |
| 500 | Server error |

---

## 3.1 `POST /api/auth/signup` — **REQUIRED**

**Purpose:** create an account from the Create account modal.

**Headers**

```
Content-Type: application/json
```

**Request body**

| Field | Type | Required | Rules |
| --- | --- | --- | --- |
| `name` | string | yes | 2–100 chars, trimmed |
| `organisation` | string | yes | 2–120 chars, trimmed |
| `email` | string | yes | RFC 5322, ≤254 chars, lowercased, **business domain only** |
| `password` | string | yes | ≥10 chars, ≥1 digit, ≥1 symbol, ≤200 chars |
| `acceptedTerms` | boolean | yes | must be exactly `true` |
| `locale` | string | no | `"en"` or `"ar"`, defaults `"en"` |

**Note on `email`:** the form hint reads *"Use your work address. We verify the domain."*
That is a product promise — reject free-mail domains (gmail, yahoo, outlook, hotmail,
proton, icloud, plus disposable-mail lists) with `code: "personal_email_rejected"`.

**Note on `locale`:** capture it at signup so transactional email can be sent in the user's
language. `window.TaharaI18N.current` gives `"en"` or `"ar"` at call time.

**Example request**

```bash
curl -X POST https://tahara-final1.vercel.app/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Amira Khan",
    "organisation": "Acme Bank",
    "email": "amira.khan@acmebank.com",
    "password": "Str0ng!Passphrase",
    "acceptedTerms": true,
    "locale": "en"
  }'
```

**201 Created**

```json
{
  "userId": "usr_01HZX9K2M4P7QW",
  "email": "amira.khan@acmebank.com",
  "verificationRequired": true
}
```

Do **not** create a session here. Require email verification first.

**Error responses**

```json
// 400 — password too weak
{ "error": { "code": "password_too_weak", "field": "password" } }

// 400 — terms not accepted
{ "error": { "code": "terms_not_accepted", "field": "acceptedTerms" } }

// 400 — free-mail domain
{ "error": { "code": "personal_email_rejected", "field": "email" } }

// 409 — already registered
{ "error": { "code": "email_exists", "field": "email" } }

// 422 — domain has no MX record
{ "error": { "code": "domain_unverifiable", "field": "email" } }

// 429
{ "error": { "code": "rate_limited", "retryAfter": 60 } }
```

**Security:** always return 409 in the same time envelope as a success to avoid
account enumeration via timing. Argon2id or bcrypt (cost ≥12) for hashing. Never log the
password field.

---

## 3.2 `POST /api/auth/signin` — **REQUIRED**

**Purpose:** authenticate and establish a session.

**Request body**

| Field | Type | Required | Rules |
| --- | --- | --- | --- |
| `email` | string | yes | valid email |
| `password` | string | yes | non-empty |
| `remember` | boolean | no | defaults `false` — maps to "Keep me signed in" |

**Example request**

```bash
curl -X POST https://tahara-final1.vercel.app/api/auth/signin \
  -H "Content-Type: application/json" \
  -c cookies.txt \
  -d '{ "email": "amira.khan@acmebank.com", "password": "Str0ng!Passphrase", "remember": true }'
```

**200 OK**

```
Set-Cookie: tahara_session=<opaque>; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=2592000
```

```json
{
  "user": {
    "id": "usr_01HZX9K2M4P7QW",
    "name": "Amira Khan",
    "email": "amira.khan@acmebank.com",
    "organisationId": "org_01HZX9K5T2",
    "role": "member",
    "locale": "en"
  }
}
```

**Error responses**

```json
// 401 — wrong email OR wrong password. Identical response for both, deliberately.
{ "error": { "code": "invalid_credentials" } }

// 403 — email not yet verified
{ "error": { "code": "email_unverified" } }

// 423 — locked after repeated failures
{ "error": { "code": "account_locked", "retryAfter": 900 } }

// 429
{ "error": { "code": "rate_limited", "retryAfter": 60 } }
```

**Validation:** never reveal whether the email exists. Rate limit per IP **and** per email
(recommend 5 attempts per 15 minutes per email, 20 per hour per IP).

---

## 3.3 `POST /api/auth/signout` — **REQUIRED**

Invalidates the server-side session and clears the cookie.

**Request body:** none. **200 OK:** `{ "ok": true }` with `Set-Cookie: tahara_session=; Max-Age=0`.

Idempotent — calling it without a session still returns 200.

---

## 3.4 `GET /api/auth/session` — **REQUIRED**

**Purpose:** let the frontend discover whether the visitor is signed in, so the nav can
swap "Sign in" for the user's name.

**200 OK** — same `user` object as §3.2.
**401** — `{ "error": { "code": "not_authenticated" } }`

**Caching:** must send `Cache-Control: no-store`. This endpoint must never be cached by
Vercel's edge or the browser.

---

## 3.5 `POST /api/auth/forgot-password` — **REQUIRED**

**Request body:** `{ "email": "string", "locale": "en" | "ar" }`

**202 Accepted** — `{ "ok": true }`

**Return 202 whether or not the account exists.** Never confirm existence. Send the email
only when it does. Token: cryptographically random, ≥32 bytes, single-use, 60-minute
expiry, stored hashed.

Rate limit hard: 3 requests per email per hour.

---

## 3.6 `POST /api/auth/reset-password` — **REQUIRED**

**Request body**

| Field | Type | Required | Rules |
| --- | --- | --- | --- |
| `token` | string | yes | from the emailed link |
| `password` | string | yes | same policy as signup |

**200 OK** — `{ "ok": true }`

**Errors:** `token_invalid`, `token_expired`, `token_used`, `password_too_weak`.

**On success:** invalidate the token, invalidate **all existing sessions** for that user,
and send a confirmation email.

---

## 3.7 `POST /api/surface-check` — **REQUIRED** ⚠️ highest-risk endpoint

**Purpose:** the ribbon promises *"FREE — Run an AI surface check on your endpoint"* on
**every page load**. It opens a modal where a visitor types a URL and presses "Run check".

**Current state: the "Run check" button has no click handler whatsoever.** Not a stub —
nothing. The modal opens, the field accepts text, the button does nothing. This is the
most visible broken promise on the site.

**UI:** `tahara-body.html:20–35`. The `https://` prefix is **static text beside the field**,
so the submitted value will not include a scheme — prepend it server-side.

**Request body**

| Field | Type | Required | Rules |
| --- | --- | --- | --- |
| `endpoint` | string | yes | hostname + optional path, ≤2048 chars |
| `email` | string | no | if you decide to gate results behind an email |
| `locale` | string | no | `"en"` / `"ar"` |

**Example request**

```bash
curl -X POST https://tahara-final1.vercel.app/api/surface-check \
  -H "Content-Type: application/json" \
  -d '{ "endpoint": "acmebank.com/chat", "locale": "en" }'
```

**202 Accepted** — scanning is asynchronous; do not block the request.

```json
{ "jobId": "job_01HZX9M8N3", "statusUrl": "/api/surface-check/job_01HZX9M8N3" }
```

### `GET /api/surface-check/:jobId`

```json
{
  "jobId": "job_01HZX9M8N3",
  "status": "done",
  "endpoint": "https://acmebank.com/chat",
  "completedAt": "2026-07-25T18:42:11Z",
  "findings": [
    { "id": "f_1", "severity": "high",   "code": "model_disclosed",  "surface": "response_headers" },
    { "id": "f_2", "severity": "medium", "code": "prompt_leakage",   "surface": "error_message" }
  ]
}
```

`status` ∈ `pending` | `running` | `done` | `failed`.
`severity` ∈ `low` | `medium` | `high` | `critical`.
`code` is a stable key — the frontend maps it to localised copy (§17.1).

**Errors:** `invalid_url`, `private_address_blocked`, `scheme_not_allowed`,
`host_unresolvable`, `rate_limited`, `scan_failed`.

### ⚠️ SSRF — read this before writing a line of it

**This endpoint accepts a user-supplied URL and makes a server-side request to it.** It is
a textbook Server-Side Request Forgery vector, it is **unauthenticated**, and it is
**linked from every page**. Treat the input as hostile.

Mandatory controls:

1. **Allow only `http` and `https`.** Reject `file:`, `gopher:`, `ftp:`, `data:`, `dict:`.
2. **Resolve DNS first, then validate the resolved IP** — not the hostname. Block:
   - `127.0.0.0/8`, `::1` (loopback)
   - `10.0.0.0/8`, `172.16.0.0/12`, `192.168.0.0/16` (private)
   - `169.254.0.0/16` — **especially `169.254.169.254`, the cloud metadata endpoint**
   - `0.0.0.0/8`, `100.64.0.0/10`, `fc00::/7`, `fe80::/10`
3. **Guard against DNS rebinding:** resolve once, then connect to the resolved IP with the
   `Host` header pinned. Do not let a second resolution occur between check and connect.
4. **Do not follow redirects automatically.** Follow manually, re-validating the target IP
   at every hop, maximum 3 hops.
5. **Timeouts and caps:** ≤5s connect, ≤10s total, ≤2MB response body.
6. **Run it in an isolated egress context** with no access to internal services or cloud
   credentials. A separate worker with a locked-down security group is strongly preferred
   over running it in the same function as your auth code.
7. **Rate limit aggressively:** 3 scans per IP per hour, plus a global circuit breaker.
   Without this you are operating a free, anonymous port scanner on your own infrastructure.

---

## 3.8 `POST /api/contact` — **REQUIRED**

**Purpose:** backs every "Request a demo", "Ask our team" and "Talk to an engineer" button.
None currently have handlers.

**Occurrences in the UI:** nav (desktop + mobile), mega-menu guided-demo panel, FAQ footer
("Ask our team"), closing CTA, and the governance page ("Request a demo", "Start assessment").

**There is no contact form UI yet.** These are bare buttons. A form must be built (§20.3)
before this endpoint has a consumer.

**Request body**

| Field | Type | Required | Rules |
| --- | --- | --- | --- |
| `type` | enum | yes | `demo` \| `question` \| `engineer` |
| `name` | string | yes | 2–100 |
| `email` | string | yes | business domain |
| `organisation` | string | no | ≤120 |
| `message` | string | no | ≤2000 |
| `locale` | string | no | `en` \| `ar` |
| `source` | string | no | which CTA was clicked, for attribution |

**202 Accepted** — `{ "ok": true, "reference": "msg_01HZX9P4R7" }`

**Errors:** `validation_failed`, `spam_rejected`, `rate_limited`.

**Anti-spam:** honeypot field plus a timing check (reject submissions faster than ~2s).
Avoid CAPTCHA if possible — it contradicts the site's tone.

---

## 3.9 `POST /api/faq/feedback` — **PROPOSED**

The FAQ has a working "Was this helpful? Yes / No" control that currently only animates
and shows "Thanks, noted." — nothing is recorded.

**Request body:** `{ "questionKey": "faq.q8", "helpful": true, "locale": "en" }`
**202 Accepted** — `{ "ok": true }`

`questionKey` matches the i18n dictionary keys `faq.q1` … `faq.q12`. Anonymous; do not
attach identity. Deduplicate per session.

---

## 3.10 `GET /api/health` — **PROPOSED, build this first**

`{ "ok": true, "version": "12f606a", "time": "2026-07-25T18:42:11Z" }`

Build it before anything else to confirm Route Handlers deploy correctly on this Vercel
project before real work depends on them.

---

## 3.11 Endpoints deliberately NOT specified

| Not specified | Why |
| --- | --- |
| Dashboard / metrics APIs | No data UI exists. The dashboard is a hardcoded illustration (§8) |
| Search / filter / pagination | No list, table or search input exists anywhere (§9) |
| File upload | No `<input type="file">` exists anywhere (§7) |
| Notifications | No notification UI exists (§10) |
| Roles / permissions | No admin UI, no role-dependent rendering (§12, §13) |
| Payments | No pricing page, no checkout, no plan selector |
| Governance assessment APIs | The pages that would use them 404 (§5.3) |

---

# 4. Database Requirements

No database exists. The schema below is a **recommendation**, sized to what the frontend
actually needs plus the near-term roadmap. Marked entities are needed now; the rest are
forward-looking.

Conventions: `id` is a ULID/UUID string; all timestamps are UTC `timestamptz`;
`created_at` / `updated_at` on every table.

## 4.1 `organisations` — **needed now**

| Field | Type | Null | Notes |
| --- | --- | --- | --- |
| `id` | string PK | no | |
| `name` | string(120) | no | from the signup Organisation field |
| `email_domain` | string(253) | no | derived from the signup email, indexed |
| `locale` | enum(`en`,`ar`) | no | default `en` |
| `created_at` | timestamptz | no | |
| `updated_at` | timestamptz | no | |

Unique index on `email_domain`. Signup should attach a user to an existing organisation
when the domain matches, rather than creating a duplicate.

## 4.2 `users` — **needed now**

| Field | Type | Null | Notes |
| --- | --- | --- | --- |
| `id` | string PK | no | |
| `organisation_id` | FK → organisations | no | |
| `name` | string(100) | no | |
| `email` | citext(254) | no | **unique**, lowercased |
| `password_hash` | string | yes | null for SSO-only accounts |
| `email_verified_at` | timestamptz | yes | null until verified |
| `role` | enum(`owner`,`admin`,`member`) | no | default `member` (§12) |
| `locale` | enum(`en`,`ar`) | no | default `en` |
| `accepted_terms_at` | timestamptz | no | audit trail for the consent checkbox |
| `last_login_at` | timestamptz | yes | |
| `failed_login_count` | int | no | default 0 |
| `locked_until` | timestamptz | yes | |
| `created_at` / `updated_at` | timestamptz | no | |

Relationship: `organisations 1 — N users`.

## 4.3 `sessions` — **needed now** (skip if using stateless JWTs)

| Field | Type | Null | Notes |
| --- | --- | --- | --- |
| `id` | string PK | no | the opaque cookie value, stored **hashed** |
| `user_id` | FK → users | no | |
| `expires_at` | timestamptz | no | indexed for cleanup |
| `ip` | inet | yes | |
| `user_agent` | string(512) | yes | |
| `remember` | boolean | no | from "Keep me signed in" |
| `created_at` | timestamptz | no | |

## 4.4 `password_reset_tokens` — **needed now**

| Field | Type | Null | Notes |
| --- | --- | --- | --- |
| `id` | string PK | no | |
| `user_id` | FK → users | no | |
| `token_hash` | string | no | **never store the raw token** |
| `expires_at` | timestamptz | no | +60 minutes |
| `used_at` | timestamptz | yes | single-use enforcement |
| `created_at` | timestamptz | no | |

## 4.5 `email_verification_tokens` — **needed now**

Same shape as 4.4, 24-hour expiry.

## 4.6 `surface_check_jobs` — **needed now**

| Field | Type | Null | Notes |
| --- | --- | --- | --- |
| `id` | string PK | no | the `jobId` |
| `endpoint_raw` | string(2048) | no | exactly what the visitor typed |
| `endpoint_normalised` | string(2048) | no | after scheme prepend and parsing |
| `resolved_ip` | inet | yes | audit trail for the SSRF guard |
| `status` | enum(`pending`,`running`,`done`,`failed`) | no | |
| `failure_code` | string(64) | yes | |
| `requester_ip` | inet | no | for rate limiting and abuse |
| `requester_email` | citext | yes | if gated |
| `locale` | enum(`en`,`ar`) | no | |
| `started_at` / `completed_at` | timestamptz | yes | |
| `created_at` | timestamptz | no | |

Index `(requester_ip, created_at)` for the rate limiter.

## 4.7 `surface_check_findings` — **needed now**

| Field | Type | Null | Notes |
| --- | --- | --- | --- |
| `id` | string PK | no | |
| `job_id` | FK → surface_check_jobs | no | cascade delete |
| `severity` | enum(`low`,`medium`,`high`,`critical`) | no | |
| `code` | string(64) | no | **stable key, not a sentence** (§17.1) |
| `surface` | string(64) | yes | where it was observed |
| `evidence` | jsonb | yes | raw detail, never rendered directly |

Relationship: `surface_check_jobs 1 — N surface_check_findings`.

## 4.8 `contact_requests` — **needed now**

| Field | Type | Null |
| --- | --- | --- |
| `id` | string PK | no |
| `type` | enum(`demo`,`question`,`engineer`) | no |
| `name` | string(100) | no |
| `email` | citext(254) | no |
| `organisation` | string(120) | yes |
| `message` | text | yes |
| `locale` | enum(`en`,`ar`) | no |
| `source` | string(64) | yes |
| `handled_at` | timestamptz | yes |
| `created_at` | timestamptz | no |

## 4.9 `faq_feedback` — **optional**

`id`, `question_key` (string 32), `helpful` (bool), `locale`, `created_at`.

## 4.10 Entity relationship summary

```
organisations 1 ──── N users
users         1 ──── N sessions
users         1 ──── N password_reset_tokens
users         1 ──── N email_verification_tokens
surface_check_jobs 1 ──── N surface_check_findings

contact_requests   standalone (no FK — submitted by anonymous visitors)
faq_feedback       standalone (anonymous by design)
```

## 4.11 Not modelled, deliberately

AI systems, agents, models, findings registers, control mappings, evidence lockers, audit
ledgers, policies, probes, test runs. **These are the product's domain**, and none of them
have a frontend surface in this repository. The mega-menu lists 22 such features, but every
item is inert and links nowhere (§5.2). Model them when the corresponding screens are
designed, not before.

---

# 5. Frontend Pages

There are **exactly two routes**. Both are statically prerendered, public, and require no
data to render.

## 5.1 `/` — Landing page

**Route:** `app/(marketing)/page.tsx` → renders `tahara-body.html` via `TaharaRuntime.tsx`
**Rendering:** static (SSG), markup read at build time
**APIs required to render:** **none** — it is fully self-contained

Sections top to bottom: announcement ribbon → header/nav with mega-menu → hero → assurance
dashboard (4 tabs) → standards marquee → statement band → "One record of truth" (3 cards)
→ lifecycle (4 cards) → architecture stack (scroll-driven 3D) → connectors marquee →
frameworks (7 seals + drawer) → FAQ (12 questions) → closing CTA → footer.

**APIs required for its interactive elements:**

| Element | Endpoint | Currently |
| --- | --- | --- |
| Ribbon → surface-check modal → "Run check" | `POST /api/surface-check` | **no handler at all** |
| Nav "Sign in" → modal | `POST /api/auth/signin` | submit is a no-op |
| Create account modal | `POST /api/auth/signup` | submit is a no-op |
| "Forgot password" link | `POST /api/auth/forgot-password` | `href="#"`, no handler |
| All "Request a demo" buttons | `POST /api/contact` | no handler |
| FAQ "Was this helpful?" | `POST /api/faq/feedback` | animates only |
| Nav session state | `GET /api/auth/session` | not implemented |

**Data it expects:** none from a backend. All content is compiled in.

**Validation currently present:** none. Both forms carry `novalidate`. The password meter
(§6.1) is decorative.

**Loading states:** **none exist.** No spinner, no skeleton, no disabled-button state, no
progress indicator anywhere in the codebase. Every one must be built (§20.1).

**Error handling:** **none exists.** There is no error container, no inline field-error
markup, no toast, no alert region. Must be built (§20.1).

**Empty states:** not applicable — no list or collection is rendered from data.

## 5.2 Mega-menu — 22 inert items

The Platform dropdown lists 22 features across Governance (10), Adversarial (5),
PII Guardrails (4) and Vulnerability Scanner (3). Three are badged "Coming soon".

**Every one is intentionally inert** — they all point at `#platform` and navigate nowhere.
The data structure already supports an optional `href` as the 4th tuple element in
`PLATFORM_MENU` (`public/tahara-engine.js:307`), so adding real destinations later is a
data change, not a code change.

## 5.3 `/platform/governance` — Governance page

**Route:** `app/platform/governance/page.jsx` — standard React, the template to copy
**Rendering:** static
**APIs required:** **none** — it is presentational

Content: "What are you being held to?" with two assessment-route cards — *Build my master
set* (recommended) and *Choose a standard* (targeted).

**Client state:** a single `useState` tracking scroll position for a sticky-header class.
No data fetching.

**⚠️ Both card links 404.** They point to `/platform/governance/master` (linked 3×) and
`/platform/governance/specific` (linked 1×). **Neither route exists.** These are the
product's actual assessment flows and represent the largest unbuilt area of the frontend.

**⚠️ This page is currently unreachable from the site nav.** The mega-menu rewrite removed
the only link to it. It works if typed directly.

## 5.4 Pages that do not exist but are linked or implied

| Missing page | Linked from | Needed for |
| --- | --- | --- |
| `/platform/governance/master` | governance page ×3 | assessment flow |
| `/platform/governance/specific` | governance page ×1 | assessment flow |
| Forgot password | sign-in modal | §3.5 |
| Reset password | password reset email | §3.6 |
| Email verification landing | verification email | §3.1 |
| Contact / demo request form | every "Request a demo" button | §3.8 |
| Authenticated area | — | §2.7 |
| Terms of service, Privacy notice | signup consent checkbox | legal requirement |

The last one matters: the signup form asks users to accept "the terms and the privacy
notice", and **neither document exists or is linked**. That is a compliance problem for a
company selling regulatory compliance.

---

# 6. Forms

**There are exactly three forms.** All are on the landing page, inside modals.

## 6.1 Create account

**Location:** `tahara-body.html:38–69` · **`id`:** `acctForm` · **Endpoint:** `POST /api/auth/signup`

| Field | Type | Client validation today | Required server-side rule |
| --- | --- | --- | --- |
| Full name | text | **none** | 2–100 chars |
| Organisation | text | **none** | 2–120 chars |
| Work email | email | **none** (`novalidate`) | RFC 5322, business domain |
| Password | password | **none** | ≥10 chars, ≥1 digit, ≥1 symbol |
| Terms consent | checkbox | **none** | must be `true` |

**The password-strength meter is decorative.** `public/tahara-engine.js` animates a bar
width from three checks (length ≥10, contains a digit, contains a symbol). It does not
block submission, does not surface a message, and must not be treated as validation.

**Current submit behaviour:** `preventDefault()`, nothing else.

**Success behaviour to build:** disable the submit button, show progress, then swap the
modal body for a "Check your email" confirmation. Do not sign the user in.

**Error behaviour to build:** inline message under the offending field, mapped from the
error `code` via the i18n dictionary. Never render the server's raw string (§17.1).

## 6.2 Sign in

**Location:** `tahara-body.html:72–99` · **`id`:** `signinForm` · **Endpoint:** `POST /api/auth/signin`

| Field | Type | Client validation today | Required server-side rule |
| --- | --- | --- | --- |
| Work email | email | **none** | valid email |
| Password | password | **none** | non-empty |
| Keep me signed in | checkbox | **none** | maps to session lifetime |

**Success behaviour to build:** close the modal, update the nav to the signed-in state,
redirect to the authenticated area once one exists.

**Error behaviour to build:** a single message above the submit button — never indicate
which of the two fields was wrong.

## 6.3 Surface check

**Location:** `tahara-body.html:20–35` · **Not a `<form>`** — a bare input plus a button
**Endpoint:** `POST /api/surface-check`

| Field | Type | Client validation today | Server rule |
| --- | --- | --- | --- |
| Endpoint URL | text | **none** | hostname, ≤2048 chars, SSRF-validated |

**The `https://` prefix is static text beside the field, not part of the value.**

**Current behaviour: the button has no click handler at all.**

**Success behaviour to build:** the request is async (202 + `jobId`), so this needs a
polling or streaming UI — a progress state, then a results view. That results view **does
not exist and must be designed**. It is the single largest piece of frontend work implied
by this integration.

**Error behaviour to build:** inline message under the field.

## 6.4 Forms that do not exist

Contact/demo request, forgot password, reset password, email verification, profile,
settings, organisation management. All must be built (World 2, standard React).

---

# 7. File Uploads

**NOT APPLICABLE — no upload capability exists anywhere in the frontend.**

Verified: no `<input type="file">`, no drag-and-drop zone, no `FormData` construction, no
multipart handling, no upload progress UI, no file-type icons, no attachment control in
any form.

Do not build upload infrastructure for v1. Nothing would call it.

**If it becomes needed** (evidence documents are plausible given the product's "Evidence
Locker" feature): use presigned S3/R2 URLs so file bytes never transit your API. Suggested
limits: PDF/DOCX/XLSX/PNG/JPG, 25MB max, virus-scan on upload, private bucket with
short-lived signed read URLs. **Validate content type by magic bytes, not by extension or
the client-supplied `Content-Type`.**

---

# 8. Dashboard Requirements

**NO FRONTEND SURFACE — this section requires careful reading.**

The homepage displays a component that looks like a product dashboard. **It is a marketing
illustration, not a data view.**

## 8.1 What the "assurance dashboard" actually is

**Location:** `public/tahara-engine.js:2304`, the `MODULES` array
**Structure:** 4 tabs — Discover, Govern, Adversarial, Guardrails
**Data:** 4 modules × 23 strings, entirely hardcoded

Per module: a badge, a title, a subtitle, a 6-item sidebar nav, 3 stat cards (label, value,
delta, 8-point sparkline), a critical-finding card, and a 4-row coverage bar chart.

Every number — `412` systems, `96` agents, `6` findings, `8,412` probes, `12,847` prompts
inspected — is a **literal in the source**. The sparklines are hardcoded coordinate arrays.
The bar widths are hardcoded fractions. The count-up animations are pure CSS/JS theatre.

## 8.2 Should it be wired to real data?

**This is a product decision, not a technical one.** Consider carefully:

- It sits on a **public marketing page** with no authentication. Real tenant data cannot go
  there without an auth wall, which would fundamentally change the page.
- It is **statically prerendered**. Live data would force dynamic rendering and break the
  build-time `fs.readFileSync` in `page.tsx`.
- Its purpose is to communicate capability to a prospect in 5 seconds. Real data is often
  *worse* at that than curated illustration.

**Recommendation: leave it hardcoded.** If a real dashboard is wanted, build it as a
separate authenticated page in World 2 — not by retrofitting this illustration.

## 8.3 If you do wire it anyway

The render function would need rewriting to consume an API response instead of a literal,
and one property must be preserved: **the Arabic overlay `MODULES_AR` supplies text only.**
All numbers, sparklines and bar fractions come from the English array by design, so the two
languages can never drift apart on data. Any API-driven version must keep numeric data in
one place and localise only labels.

Shape it would need:

```json
{
  "modules": [{
    "key": "discover",
    "stats": [{ "key": "systems_in_scope", "value": 412, "delta": "+18", "trend": [22,20,18,15,12,10,7,4] }],
    "finding": { "severity": "critical", "code": "no_owner_on_record", "count": 3 },
    "coverage": [{ "key": "models", "value": 128, "fraction": 0.889 }]
  }]
}
```

Note every label is a **key**, not a sentence — the frontend localises (§17.1).

---

# 9. Search, Filtering, Pagination, Sorting

**NOT APPLICABLE — none of these exist in the frontend.**

Verified across the whole codebase: no search input, no filter control, no sort control, no
pagination component, no infinite scroll, no result count, no "no results" empty state, no
list or table rendered from a collection.

The only input elements in the entire project are the 9 listed in §6.

**Do not build list endpoints, cursor pagination or query DSLs for v1.** There is no
consumer. Wasted effort here is the most likely way this integration overruns.

**When list UIs are built**, the recommendations are: cursor-based pagination (`?cursor=&limit=`,
default 25, max 100) rather than offset, since findings tables grow and offset pagination
drifts under concurrent writes; filtering via explicit query params (`?severity=high&status=open`)
rather than a generic query language; sorting via `?sort=created_at&order=desc` with a
server-side allowlist of sortable columns.

The one exception worth noting: `GET /api/surface-check/:jobId` returns a `findings` array.
If a scan can produce more than ~50 findings, cap the response and paginate that array from
the start.

---

# 10. Notifications

**NOT APPLICABLE — no notification UI exists.**

No bell icon, no badge counter, no notification centre, no toast system, no alert region,
no WebSocket or SSE connection, no service worker, no push-subscription code.

**Do not build a notification system for v1.**

**Note:** even basic form success/error feedback has no UI container to render into. That
must be built first (§20.1) before any notification concept is meaningful.

---

# 11. Email Functionality

**No email is sent today.** No provider is configured, no template exists, no sending code.

Transactional email is **required** for the auth flows in §2:

| Email | Trigger | Contains | Priority |
| --- | --- | --- | --- |
| Email verification | signup | 24h single-use link | **required** |
| Password reset | forgot-password | 60min single-use link | **required** |
| Password changed | successful reset | no link, security notice | **required** |
| Demo request received | contact form | reference number | recommended |
| Internal demo notification | contact form | to sales inbox | recommended |
| Surface check complete | scan finishes | results link | if scans are gated by email |

**Requirements specific to this project:**

- **Bilingual.** Every template needs `en` and `ar` versions with correct RTL layout. Use
  the `locale` captured at signup (§3.1). This is not optional — the site is fully bilingual.
- **Provider:** Resend, Postmark or SES. Verify SPF, DKIM and DMARC before launch; a
  compliance product landing in spam is a credibility problem.
- **Never** include the password or reset token in the email body text — link only.
- Rate limit verification resends (3/hour/user).

---

# 12. Role-Based Access

**NO FRONTEND SURFACE — nothing renders conditionally on a role today.**

The `role` field is included in §4.2 because the product is sold to teams, and retrofitting
roles after launch is painful. It is not driven by any current UI.

Suggested initial model, matching how the product is described on the site (§5.1 mentions
compliance teams, engineering leads and leadership as the three audiences):

| Role | Intended capability |
| --- | --- |
| `owner` | full control, billing, can delete the organisation. Exactly one per org. |
| `admin` | manage members, configure connections, close findings |
| `member` | view everything, raise findings, cannot close them |

**One product rule from the site's own copy is worth encoding now.** The FAQ states
explicitly: *"Can a machine close a finding? No. Tahara AI can raise a flag on its own.
Only a stakeholder can confirm it's resolved."* If findings are ever modelled, enforce
server-side that resolution requires a human `user_id` — never a service account or
automated process. That is a marketed guarantee.

---

# 13. Permissions

**NO FRONTEND SURFACE.**

No permission matrix, no capability checks, no conditional rendering, no admin screens.

**When built:** check permissions **server-side on every request**, never rely on the
frontend hiding a control. Scope every query by `organisation_id` from the session — the
single most common multi-tenant data leak is a query filtered by resource ID without a
tenant check.

For v1 the only rule that matters: **a user may only access data belonging to their own
organisation.**

---

# 14. Environment Variables

## 14.1 Currently required by the frontend

**None.**

The only variable in `.env.local` is `VERCEL_OIDC_TOKEN`, which is machine-generated by the
Vercel CLI and is not consumed by any application code.

No `NEXT_PUBLIC_*` variable exists. The frontend hardcodes nothing configurable.

## 14.2 Required once the backend exists

| Variable | Scope | Purpose | Example |
| --- | --- | --- | --- |
| `DATABASE_URL` | server | Postgres connection | `postgresql://user:pass@host:5432/tahara` |
| `SESSION_SECRET` | server | session/JWT signing, ≥32 random bytes | — |
| `EMAIL_API_KEY` | server | transactional email provider | `re_...` |
| `EMAIL_FROM` | server | verified sender | `no-reply@tahara.ai` |
| `APP_URL` | server | absolute URLs in emails | `https://tahara-final1.vercel.app` |
| `SCANNER_WORKER_URL` | server | isolated surface-check worker (§3.7) | — |
| `SCANNER_WORKER_TOKEN` | server | auth for that worker | — |
| `RATE_LIMIT_REDIS_URL` | server | distributed rate limiting (§18.4) | — |
| `SALES_INBOX` | server | demo request destination | `sales@tahara.ai` |
| `NEXT_PUBLIC_API_BASE_URL` | **client** | only if the API is not same-origin | — |

**Rules:**

- Anything prefixed `NEXT_PUBLIC_` is **embedded in the client bundle and publicly
  readable**. Never put a secret behind that prefix.
- `.env*` is gitignored. Never commit secrets.
- Set production values in the Vercel dashboard, not in a committed file.
- Do not copy `VERCEL_OIDC_TOKEN` between machines — it is per-developer.

---

# 15. Dummy Data — what must be replaced

Every piece of content on the site is currently a hardcoded constant in
`public/tahara-engine.js`. This table separates what is **legitimately static marketing
copy** (leave it alone) from what is **fake data pretending to be real** (replace, or
decide deliberately to keep).

| Constant | Line | Contents | Verdict |
| --- | --- | --- | --- |
| `MODULES` / `MODULES_AR` | 2304 | 4 dashboard tabs, all metrics | **Fabricated metrics.** Marketing illustration — see §8. Replace only if a real dashboard is built. |
| `ANSWERS` / `ANSWERS_AR` | 409 | 12 FAQ answers | Static copy. **Keep.** |
| `PLATFORM_MENU` / `_AR` | 307 | 22 nav items | Static nav. **Keep**, add `href`s as pages ship. |
| `FRAMEWORK_DETAIL` / `_AR` | 374 | 7 framework mappings | Static copy. **Keep.** |
| `FOOTER_LINKS` / `_AR` | 284 | footer columns | Static nav. **Keep.** |
| `STANDARDS` | 211 | 9 standard names for the marquee | Static. **Keep.** |
| `MARQUEE_SLUG` / `MARQUEE_GLYPH` | 362 / 349 | 26 connector brands | Static. **Keep.** |
| `I18N` | ~1370 | full EN/AR dictionary | Static. **Keep** — this is the localisation source of truth. |
| `FEED` | 188 | 24 activity-feed strings | **DEAD CODE.** Guarded by `#feedList`, which does not exist in the markup. Never rendered. Delete. |
| `CONNECTORS` | 245 | connector grid labels | **DEAD CODE.** Needs `#integGrid`, absent. Never rendered. Delete. |
| `CUSTOMERS` | 208 | empty array | **DEAD CODE.** Delete. |
| `GRID_LAYOUT` | 273 | layout config for a dead grid | **DEAD CODE.** Delete. |

**Summary for planning:** the only "dummy data" a backend would ever replace is the
dashboard's fabricated metrics — and §8 recommends against replacing even those. Roughly
four constants are dead code that should simply be deleted. Everything else is real
marketing copy that belongs in the frontend.

**Do not assume this site is full of placeholder data waiting for APIs. It is not.**

---

# 16. Third-Party Services

## 16.1 Currently integrated

| Service | Purpose | Where | Runtime? |
| --- | --- | --- | --- |
| **Google Fonts** | 6 font families | `app/(marketing)/layout.tsx` + engine (Arabic font, lazy) | yes, every page load |
| **cdn.simpleicons.org** | 18 connector logos in their brand colours | `public/tahara-engine.js:1130` | yes, every page load |
| **Vercel** | hosting, CI, CDN | `vercel.json` | — |

**That is the complete list.**

## 16.2 Explicitly NOT present

No payment gateway. No Stripe, no billing. No maps. No analytics of any kind — no Google
Analytics, no Plausible, no Segment, no Mixpanel, no Hotjar. No error tracking — no Sentry.
No chat widget — no Intercom, no Drift. No CAPTCHA. No CDP. No feature flags. No A/B testing.
No AI/LLM API — despite the product being about AI, the website calls no model.

**No cookie banner exists**, which is consistent with there being no tracking today. **If
you add analytics, a consent banner becomes a legal requirement in the EU** — and note the
mega-menu already lists "Cookie & Consent" as a coming-soon product feature, so shipping
the site without one while selling one would be awkward.

## 16.3 Privacy tension worth flagging to the client

The site's own marketing states: *"Runs in your tenancy. Nothing leaves your boundary."*

The connector marquee currently makes **18 third-party requests to `cdn.simpleicons.org` on
every page view**, which discloses each visitor's IP to that host. Six logos are already
self-hosted in `public/logos/`. Vendoring the remaining 18 removes the dependency entirely
and is a ~30 minute task. Recommended before any privacy review.

---

# 17. API Integration Notes — frontend assumptions you must know

## 17.1 ⚠️ Return keys, not sentences

**This is the single most important constraint in this document.**

The site is fully bilingual (English / Arabic) with `dir="rtl"` switching. **Any
user-readable string your API returns must be a stable key, not an English sentence** —
otherwise the Arabic page displays English.

```
✅  { "error": { "code": "email_exists" } }
❌  { "error": "That email is already registered" }
```

The frontend maps `email_exists` to a localised message in the `I18N` dictionary in
`public/tahara-engine.js`. This is exactly how every existing string on the site works.

The current language is readable at runtime as `window.TaharaI18N.current` → `"en"` or `"ar"`.

Provide a complete, final list of every error `code` you will ever emit, so the
corresponding EN and AR strings can be written. Adding a code later means shipping a
frontend change too.

## 17.2 Untranslatable terms

Brand and standard names stay in Latin script even inside Arabic copy: `Tahara AI`,
`ISO/IEC 42001`, `ISO/IEC 27001`, `ISO/IEC 23894`, `EU AI Act`, `NIST AI RMF`,
`OWASP LLM Top 10`, `MITRE ATLAS`, `AIUC-1`, `SOC 2`, `GDPR`, `MCP`, `SDAIA`, and the
`LLM01`–`LLM07` codes. Numbers use **Western digits** (`412`, `8,412`) in both languages —
a deliberate decision, do not switch to Arabic-Indic numerals.

## 17.3 Calling an API from the landing page

Write it in `public/tahara-engine.js` as a self-contained IIFE matching the existing style
(see the surface-check and auth-modal blocks near the end of the file). Plain `fetch`, no
framework, no build step. From **any other page**, use normal React.

```js
/* ── sign-in submit ── */
(function(){
  const form = document.getElementById('signinForm');
  if (!form) return;
  form.addEventListener('submit', async e => {
    e.preventDefault();
    /* ... collect fields, POST, map error.code through the I18N dictionary ... */
  });
})();
```

## 17.4 Two build-time traps that will cost you an afternoon

1. **`tahara-body.html` is read at build time.** Editing it and refreshing `next start`
   changes nothing. You must rebuild.
2. **Files added to `public/` are snapshotted at build time** by `next start`. A newly
   added file 404s until you rebuild.

Additionally: **never run `npm run dev` and `npm run build` simultaneously.** They share
`.next` and corrupt it — symptoms are blank pages, 500s, or `Cannot find module ./NNN.js`.
Fix: stop everything, delete `.next`, restart one mode.

## 17.5 The i18n gotcha

Any element carrying `data-i18n="key"` has its text **overwritten from the dictionary on
load**. Editing that text in the HTML is silently discarded. Change the dictionary entry in
`public/tahara-engine.js` instead. Elements without the attribute are edited in the HTML.

## 17.6 `dangerouslySetInnerHTML`

`TaharaRuntime.tsx` uses it, but only for a build-time local file with no user input.
**Keep it that way. Never route API data through it.** If API data must be rendered into
the landing page, use `textContent` — as the existing engine does everywhere.

## 17.7 No loading, error or empty-state UI exists

There is no spinner, skeleton, disabled-button state, toast, alert region or inline field
error anywhere in the codebase. Your APIs will have nowhere to report to until this is
built (§20.1). Factor it into the timeline — it is frontend work, not backend work, but it
blocks visible progress.

## 17.8 Static prerendering

`/` and `/platform/governance` are both SSG. Any change that forces them dynamic — adding
middleware, reading cookies at the page level, calling `headers()` — will break the
build-time file read and degrade performance. Fetch from the **client**, not the server, on
these two pages.

---

# 18. Deployment Requirements

## 18.1 Platform

Vercel, auto-deploying `main`. `vercel.json` pins `framework: nextjs`. Next.js Route
Handlers under `app/api/` deploy automatically as serverless functions on the same domain —
**no separate backend deployment is required** unless you choose a different architecture.

## 18.2 CORS — probably not needed at all

**If the API lives in `app/api/` on the same Vercel project, it is same-origin and CORS
does not apply.** This is the recommended architecture and the reason `zod` is already a
dependency.

**Only if you host the API on a separate domain** do you need:

```
Access-Control-Allow-Origin: https://tahara-final1.vercel.app
Access-Control-Allow-Credentials: true
Access-Control-Allow-Methods: GET, POST, PATCH, DELETE, OPTIONS
Access-Control-Allow-Headers: Content-Type
Access-Control-Max-Age: 86400
```

Critical rules if you go cross-origin:

- **`Access-Control-Allow-Origin` must not be `*`** when credentials are used. Echo an
  explicit allowlisted origin.
- Handle `OPTIONS` preflight on every endpoint.
- Cookies must be `SameSite=None; Secure` — which weakens CSRF posture and is a strong
  argument for staying same-origin.
- Include Vercel preview deployment URLs in the allowlist, or preview builds break.

## 18.3 Serverless constraints

Vercel functions are stateless with a ~10s default timeout on Hobby / 60s configurable on
Pro. Consequences:

- **The surface-check scan must not run inside the request.** Return 202 with a `jobId`
  and process in a worker or queue (§3.7). A scan that waits on a slow remote host will hit
  the timeout.
- **No in-memory state between requests.** Rate limit counters, session stores and job
  state must live in Redis or the database, not in a module-level variable.
- **Cold starts** apply. Keep the auth path light.

## 18.4 Rate limiting

Every endpoint in §3 is publicly reachable and unauthenticated. Use a distributed store
(Upstash Redis is the usual Vercel pairing) — **not** an in-process map, which resets on
every cold start and does not share state across concurrent function instances.

Suggested limits: signin 5/15min/email + 20/hr/IP · signup 5/hr/IP · forgot-password
3/hr/email · surface-check 3/hr/IP · contact 5/hr/IP.

## 18.5 Security headers

None are currently configured. Add via `next.config.mjs` `headers()`:
`Strict-Transport-Security`, `X-Content-Type-Options: nosniff`, `Referrer-Policy:
strict-origin-when-cross-origin`, `X-Frame-Options: DENY`, and a `Content-Security-Policy`.

**CSP will need care:** the landing page injects markup via `dangerouslySetInnerHTML` and
loads fonts from `fonts.googleapis.com`/`fonts.gstatic.com` and images from
`cdn.simpleicons.org`. Test CSP against the live page before enforcing it — a wrong policy
will silently break the fonts and the logo marquee.

## 18.6 Logging & observability

No error tracking exists. Add Sentry or equivalent before launch, and ensure the
`requestId` from §3's error envelope is logged. **Never log passwords, tokens, session IDs
or reset tokens.**

---

# 19. Integration Checklist

### Phase 0 — Setup (½ day)
- [ ] Clone, `npm install`, `npm run dev`, confirm the site renders at `localhost:3000`
- [ ] Read §1.4 until the two-worlds architecture is clear
- [ ] Create `app/api/health/route.ts` returning `{ ok: true }`
- [ ] Deploy and confirm `https://<preview>/api/health` responds — **validates the whole
      Route Handler path before real work depends on it**
- [ ] Provision Postgres and Redis; set `DATABASE_URL`, `SESSION_SECRET` in Vercel

### Phase 1 — Data layer (1 day)
- [ ] Implement §4.1–4.5 (organisations, users, sessions, both token tables)
- [ ] Migrations checked into the repo
- [ ] Seed script for local development

### Phase 2 — Authentication (3–4 days)
- [ ] `POST /api/auth/signup` with full §3.1 validation
- [ ] Email verification token + send + landing page
- [ ] `POST /api/auth/signin` — constant-time, no user enumeration
- [ ] `GET /api/auth/session` with `Cache-Control: no-store`
- [ ] `POST /api/auth/signout`
- [ ] `POST /api/auth/forgot-password` — 202 regardless of existence
- [ ] `POST /api/auth/reset-password` — invalidates all sessions on success
- [ ] Rate limiting on all five, backed by Redis
- [ ] Argon2id/bcrypt cost ≥12 verified

### Phase 3 — Wire the frontend (2 days) — *coordinate with the frontend developer*
- [ ] Build the loading / error / disabled-button UI (§20.1) — **blocks everything visible**
- [ ] Add EN + AR dictionary entries for every error `code` (§17.1)
- [ ] Replace the `preventDefault()` no-op on `acctForm` with a real `fetch`
- [ ] Same for `signinForm`
- [ ] Build the forgot-password and reset-password pages (World 2, React)
- [ ] Restore a direct route to the signup modal (§20.2)
- [ ] Nav reflects signed-in state via `GET /api/auth/session`

### Phase 4 — Contact (1 day)
- [ ] Build the demo-request form UI — **does not exist today** (§20.3)
- [ ] `POST /api/contact` + honeypot + timing check
- [ ] Sales inbox notification + user acknowledgement email, both bilingual

### Phase 5 — Surface check (4–5 days, the hard one)
- [ ] Isolated scanner worker with locked-down egress
- [ ] Full SSRF guard per §3.7 — **write tests for each blocked range**
- [ ] `POST /api/surface-check` → 202 + `jobId`
- [ ] `GET /api/surface-check/:jobId`
- [ ] Job + findings tables (§4.6, §4.7)
- [ ] Aggressive rate limiting + global circuit breaker
- [ ] Frontend: wire the "Run check" button, build the polling and results UI
- [ ] Penetration-test the SSRF guard before it goes public

### Phase 6 — Hardening (1–2 days)
- [ ] Security headers + CSP tested against the live page (§18.5)
- [ ] Sentry wired, `requestId` logged
- [ ] Confirm no secret is behind a `NEXT_PUBLIC_` prefix
- [ ] SPF / DKIM / DMARC verified for the sending domain
- [ ] Load test the auth endpoints
- [ ] Confirm every response returns codes, never display strings (§17.1)

---

# 20. Frontend Changes Needed After Integration

These are frontend tasks, listed so they are not forgotten in planning. Most **block** the
backend work from being visible.

## 20.1 Loading, error and empty-state UI — **blocking, do first**
No spinner, skeleton, disabled state, toast or inline field-error markup exists anywhere.
Until this is built, a working API has nowhere to report to. Needs CSS in `landing.css` and
render logic in `tahara-engine.js`, in both LTR and RTL.

## 20.2 Restore a route to the signup modal
The Create account modal is currently reachable **only** from inside the Sign in modal. The
hero button that opened it was removed and the nav has no "Sign up" link. Add `data-signup`
to a nav element. The `nav.signup` dictionary entry still exists with its Arabic, so this
is a one-line change.

## 20.3 Build a contact / demo form
Every "Request a demo" button is currently a bare button with no destination. A form must
exist before `POST /api/contact` has a consumer. Decide: modal on the landing page (matches
the existing auth modals) or a dedicated `/contact` page (World 2, easier).

## 20.4 Build the surface-check results view
The largest piece. An async scan needs a progress state and a results presentation, neither
of which exists. Needs design input, not just implementation.

## 20.5 Build the missing pages
`/platform/governance/master`, `/platform/governance/specific` (both currently 404 and
linked 4 times between them), forgot-password, reset-password, email-verification landing.

## 20.6 Write the legal documents
The signup form asks users to accept "the terms and the privacy notice". **Neither exists
nor is linked.** For a company selling regulatory compliance this is a credibility and
compliance problem. Blocks launch.

## 20.7 Client-side validation
Both forms carry `novalidate` and have zero validation. Mirror the server rules client-side
for responsiveness — while treating the server as the only real gate.

## 20.8 Add the language to every request
Send `locale` with signup, contact and surface-check so email and results come back in the
right language. Read it from `window.TaharaI18N.current`.

## 20.9 Re-link the governance page
`/platform/governance` is live but unreachable from the nav — the mega-menu rewrite removed
its only link. Add an `href` to a Governance mega-menu item (the data structure already
supports it, §5.2).

## 20.10 Optional: vendor the remaining 18 logos
Removes 18 third-party requests per page view and the privacy tension in §16.3.

---

# Known Limitations

1. **The surface-check feature is advertised on every page load and does nothing.** No
   handler exists. This is the most visible gap on the site.
2. **SSO buttons are decorative.** Microsoft and Okta are rendered but no OAuth exists.
   Ship the flows or remove the buttons.
3. **The password-strength meter is theatre.** It animates a bar and blocks nothing.
4. **Both forms have `novalidate` and zero validation.** Not weak validation — none.
5. **Terms and Privacy documents do not exist** but users are asked to accept them.
6. **Four routes 404 or are unreachable:** `/platform/governance/master`,
   `/platform/governance/specific`, and `/platform/governance` is orphaned from the nav.
   The signup modal is two clicks deep.
7. **The homepage cannot use React.** All client-side integration is vanilla JS in a
   2,600-line file (§1.4).
8. **The dashboard is fabricated.** Every metric is a literal. Treat as marketing.
9. **~4 dead data constants** (`FEED`, `CONNECTORS`, `CUSTOMERS`, `GRID_LAYOUT`) reference
   DOM elements that do not exist. Harmless but misleading — delete them.
10. **No test suite, no CI beyond Vercel's build.** No regression safety net.
11. **No error tracking, no analytics, no logging.** Production failures are currently invisible.
12. **18 logos load from a third-party CDN on every page view**, contradicting the site's
    own "nothing leaves your boundary" positioning.
13. **Two build-time traps** (§17.4) that reliably confuse newcomers.
14. **No cookie consent banner** — becomes a legal requirement the moment analytics is added.

---

# Recommendations

**1. Build in the order given in §19.** Health check → data layer → auth → wire the
frontend → contact → surface check. Each phase produces something demonstrable.

**2. Do not build ahead of the UI.** The strongest recommendation in this document. There
is no dashboard, no list, no table, no upload, no admin. Endpoints for those would sit
uncalled. Sections 7–13 are marked NOT APPLICABLE for a reason.

**3. Keep the API same-origin in `app/api/`.** Avoids CORS entirely, keeps cookies
`SameSite=Lax`, requires no second deployment, and `zod` is already installed for it.

**4. Agree the error-code list on day one.** Every code needs an English and an Arabic
string written by hand. Late additions mean coordinated frontend releases. Deliver the
complete list before writing the first handler.

**5. Treat the surface check as its own project.** It is the only endpoint that makes
outbound requests to attacker-controlled destinations. Isolate it, test the SSRF guard
against each blocked range explicitly, and rate limit it hard. Everything else in this
document is routine CRUD by comparison.

**6. Sequence the frontend blockers early.** §20.1 (loading/error UI) and the error-code
dictionary block visible progress on otherwise-finished APIs. Start them in parallel with
Phase 2, not after it.

**7. Push back on scope creep from the mega-menu.** It advertises 22 features. They are
navigation copy for a product vision, not a backlog. Confirm which are actually in scope
before estimating.

**8. Raise the legal gap immediately.** Terms and Privacy do not exist while users are
asked to accept them. It is not a backend task, but it blocks launch and someone must own it.

---

## Quick reference

| | |
| --- | --- |
| Run dev | `npm run dev` — one mode at a time, never with `build` |
| Run production | `npm run build && npm start` |
| Type check | `npm run typecheck` |
| Lint | `npm run lint` |
| API routes go in | `app/api/**/route.ts` |
| Landing page JS goes in | `public/tahara-engine.js` |
| Translations go in | the `I18N` object in `public/tahara-engine.js` |
| Never edit | `tahara-body.html` expecting a dev-server refresh — rebuild |
| Never do | rewrite the landing page into React |
