# CSS & Design System — Tahara AI

Every colour, font, size and rule used on the site, with the exact values from the
code. Nothing here is approximate — it is all read straight out of the stylesheets.

**Where it lives:** [`app/(marketing)/landing.css`](<app/(marketing)/landing.css>) — 2,747 lines.
This one file is the design system. Every React page inherits its tokens because
they all sit inside the `(marketing)` route group.

---

## Contents

1. [How styling is organised](#1-how-styling-is-organised)
2. [The colour palette](#2-the-colour-palette)
3. [Typography](#3-typography)
4. [Shadows, radii, spacing](#4-shadows-radii-spacing)
5. [Motion & easing](#5-motion--easing)
6. [Layout & breakpoints](#6-layout--breakpoints)
7. [The z-index scale](#7-the-z-index-scale)
8. [Right-to-left (Arabic)](#8-right-to-left-arabic)
9. [Section-local tokens](#9-section-local-tokens)
10. [Blog figure palette](#10-blog-figure-palette)
11. [Rules & conventions](#11-rules--conventions)
12. [Viva answers about CSS](#12-viva-answers-about-css)

---

## 1. How styling is organised

There are **four** styling mechanisms in this project, each with a clear job.

| Mechanism | Where | Why it is used there |
| --- | --- | --- |
| **`landing.css`** (global, route-group scoped) | `app/(marketing)/landing.css` | Holds all design tokens and the landing page styles. Loaded by the `(marketing)` layout only. |
| **Inline `<style>` blocks** | `AboutClient.tsx`, `ResourcesClient.tsx`, `PostClient.tsx` | Page-specific styles that only that page needs. Keeps them next to the markup they style. |
| **CSS Module** | `components/CookieBanner.module.css` | The banner mounts from the **root** layout, so it can appear on pages outside the route group. A module guarantees its class names never collide. |
| **Inline `style={{}}`** | A few components | Only for values computed in JavaScript, such as `--i` stagger indices. |

> **No CSS framework.** No Tailwind, no Bootstrap, no styled-components, no Sass.
> Plain CSS with **custom properties** (CSS variables).

### The critical rule

The **root layout imports no global CSS at all.** `landing.css` is imported by
`app/(marketing)/layout.tsx`, and Next.js loads route CSS per segment. So the
landing page's styles physically cannot reach a page outside that route group.

---

## 2. The colour palette

All defined in one `:root` block at the top of `landing.css`.

### Surfaces — the backgrounds

| Token | Hex | Preview | Used for |
| --- | --- | --- | --- |
| `--bg` | `#e3ebf7` | ▉ pale blue | Page background, deepest tone |
| `--bg-2` | `#edf3fb` | ▉ lighter blue | Secondary background wash |
| `--paper` | `#f9fbfd` | ▉ near-white | Cards, panels, raised surfaces |

### Ink — the text colours

| Token | Hex | Preview | Used for |
| --- | --- | --- | --- |
| `--ink` | `#03152f` | ▉ near-black navy | Headings and primary text |
| `--ink-2` | `#103f86` | ▉ mid blue | Body copy, secondary text |
| `--ink-3` | `#4884bc` | ▉ light blue | Captions, labels, muted text |

### Structure — lines and borders

| Token | Hex | Preview | Used for |
| --- | --- | --- | --- |
| `--line` | `#c6d7ed` | ▉ pale blue-grey | Default hairlines and borders |
| `--line-2` | `#afc8e3` | ▉ slightly darker | Hover borders, stronger dividers |

### Brand navy scale

Five steps of the brand colour, dark to light. The comment in the code calls these
"brand greens" — that is a **leftover name from an earlier green palette**. The
values are navy. Worth knowing in case an examiner spots it.

| Token | Hex | Preview | Used for |
| --- | --- | --- | --- |
| `--g900` | `#031838` | ▉ darkest navy | Solid buttons, footer, deepest fills |
| `--g800` | `#062451` | ▉ | Button hover state |
| `--g700` | `#092f68` | ▉ | Icons, mid-dark accents |
| `--g600` | `#114086` | ▉ | Links, active states |
| `--g400` | `#558bbd` | ▉ lightest | Focus rings, subtle accents |

### Signal — the one accent colour

| Token | Hex | Preview | Used for |
| --- | --- | --- | --- |
| `--signal` | `#b5651d` | ▉ burnt orange | **Risk, blocked, warning.** The only non-blue colour in the system. |

> **Why only one accent?** The design is deliberately monochrome navy so that when
> `--signal` appears, it means something. A second accent would dilute it. This is a
> good design decision to be able to explain.

---

## 3. Typography

### The three typefaces

| Token | Font | Role | Weights loaded |
| --- | --- | --- | --- |
| `--font-display` | **Libre Caslon Text**, Georgia, serif | Headings, hero, editorial | 400, 500, 400 italic |
| `--font-body` | **Archivo**, system-ui, sans-serif | Body copy, buttons, UI | 400, 500, 600, 700 |
| `--font-mono` | **IBM Plex Mono**, monospace | Labels, data, eyebrows, numbers | 400, 500 |
| *(Arabic)* | **IBM Plex Sans Arabic** | Everything in Arabic / RTL | 400, 500, 600, 700 |

All four load from **Google Fonts**, requested in `app/(marketing)/layout.tsx` with
`display=swap`.

> **Why a serif for display and a sans for body?** The serif gives the headings an
> editorial, authoritative feel appropriate for a compliance product. The sans keeps
> body copy and UI clean and legible. The mono marks anything machine-generated —
> labels, counters, data.

### Base type

```css
body{
  font-family: var(--font-body);
  color: var(--ink);
  font-size: 17px;
  line-height: 1.65;
}
```

### Fluid heading scale

Headings use `clamp(min, preferred, max)` so they scale with the viewport without
media queries. The `vw` value in the middle is what makes them fluid.

| Usage | Value |
| --- | --- |
| Hero headline | `clamp(46px, 6.4vw, 68px)` |
| Large display | `clamp(38px, 5.6vw, 84px)` |
| Section headings | `clamp(30px, 4.4vw, 60px)` |
| Sub-headings | `clamp(28px, 3.6vw, 54px)` |
| Small section heads | `clamp(25px, 3vw, 40px)` |

> **How `clamp()` works — a likely question.** `clamp(30px, 4.4vw, 60px)` means:
> never smaller than 30px, never larger than 60px, and in between it is 4.4% of the
> viewport width. One line replaces three media queries.

---

## 4. Shadows, radii, spacing

### Elevation

Three shadow steps. All tinted with the ink colour `rgba(3,24,56,…)` rather than
pure black — a black shadow on a blue page reads as dirty.

| Token | Value |
| --- | --- |
| `--sh-s` | `0 1px 2px rgba(3,24,56,.05)` |
| `--sh-m` | `0 1px 2px rgba(3,24,56,.04), 0 10px 30px rgba(3,24,56,.07)` |
| `--sh-l` | `0 2px 4px rgba(3,24,56,.05), 0 30px 70px rgba(3,24,56,.12)` |

> Each larger shadow is **two shadows stacked** — a tight one for the contact edge
> and a wide soft one for the ambient light. That is what makes it look real rather
> than like a grey blur.

### Corner radii

| Token | Value | Used for |
| --- | --- | --- |
| `--r-s` | `8px` | Small chips, pills, inputs |
| `--r-m` | `14px` | Cards, panels |
| `--r-l` | `22px` | Large containers, hero panels |

---

## 5. Motion & easing

Three easing curves, each with a different feel.

| Token | Curve | Feel | Used for |
| --- | --- | --- | --- |
| `--e-out` | `cubic-bezier(.16,1,.3,1)` | Fast start, long soft landing | Most entrances and hovers |
| `--e-io` | `cubic-bezier(.65,0,.35,1)` | Symmetrical ease-in-out | Two-way transitions |
| `--e-back` | `cubic-bezier(.34,1.4,.5,1)` | Slight overshoot | Playful pops |

### Reduced motion

`@media(prefers-reduced-motion: reduce)` appears **9 times** in `landing.css`. Under
it, animations are disabled, the scroll-assembled stack renders in its final
position, and the marquee stops.

> This is an accessibility feature. Some people get motion sickness from
> scroll-driven animation, and the operating system lets them signal that.

---

## 6. Layout & breakpoints

### Container

| Token | Value |
| --- | --- |
| `--maxw` | `1180px` — standard content width |
| `--gutter` | `24px` — side padding |

```css
.wrap{ max-width: var(--maxw); margin: 0 auto; padding: 0 var(--gutter) }
.wrap-wide{ max-width: calc(1440px + var(--gutter) * 2) }  /* hero dashboard */
```

### The main breakpoints

Chosen from **where the content actually breaks**, not from device names.

| Breakpoint | What changes |
| --- | --- |
| `max-width: 1240px` | Large layout adjustments begin |
| `max-width: 1050px` | **Stack animation un-pins** — sticky scroll effect turns off |
| `max-width: 960px` | Report layout collapses to one column |
| `max-width: 900px` | Grids drop from 4 columns to 2 |
| `max-width: 860px` | Multi-column blocks collapse |
| `max-width: 820px` | Panel padding reduces |
| `max-width: 700px` | Tablet/large-phone adjustments |
| `max-width: 640px` | |
| `max-width: 600px` | Grids drop to a single column |
| `max-width: 560px` | Small-phone adjustments |
| `max-width: 520px` | Form rows stack |

**Height-based breakpoints** — unusual, and worth mentioning:

| Breakpoint | Why it exists |
| --- | --- |
| `max-height: 900px` / `800px` | Pinned section spacing tightens |
| `max-height: 720px` | **Stack animation un-pins.** A 100vh sticky section on a short screen leaves nothing readable. |
| `max-height: 700px` | Final fallback |

**Two upward breakpoints:** `min-width: 1600px` and `min-width: 2000px` for very
large monitors.

> ⚠️ **`max-width:1050px` and `max-height:720px` are duplicated in JavaScript.** The
> engine reads them via `matchMedia('(max-width:1050px), (max-height:720px)')` rather
> than hard-coding the numbers again — because when they were written twice, they
> drifted and caused a bug. See VIVA.md §11, Bug 7.

---

## 7. The z-index scale

Layering is deliberate, not arbitrary. Knowing this order is a good detail to have.

| Range | What sits there |
| --- | --- |
| `0 – 7` | In-page content layering (cards, hover lift, overlapping panels) |
| `60` | Background / ambient layers |
| `80 – 95` | Sticky header and navigation chrome |
| **`118`** | **Cookie banner** |
| `120 – 121` | Modal scrim and surface-check modal |
| `130 – 131` | Account / top-level dialogs |

> **Why the cookie banner is at 118, deliberately *below* the modals:** if a dialog
> is open, it should cover the banner — not have the banner floating on top of its
> own dark scrim. That is a considered decision, and it is commented in the code.

---

## 8. Right-to-left (Arabic)

Two techniques are used. **Be accurate about the split** — the override approach is
the dominant one.

| Technique | Count | How it works |
| --- | --- | --- |
| **`[dir="rtl"]` overrides** | **62** | A rule that only applies when `<html dir="rtl">`. Manually flips whatever does not mirror on its own. |
| **CSS logical properties** | **29** | `margin-inline-start`, `inset-inline-start`, `border-start-start-radius`. These resolve against the writing direction, so they mirror **automatically**. |

Breakdown by file:

| File | `[dir="rtl"]` | Logical |
| --- | --- | --- |
| `landing.css` | 44 | 21 |
| `PostClient.tsx` | 11 | 0 |
| `ResourcesClient.tsx` | 4 | 0 |
| `AboutClient.tsx` | 3 | 6 |
| `CookieBanner.module.css` | 0 | 2 |
| **Total** | **62** | **29** |

### How direction is set

```js
document.documentElement.setAttribute('lang', lang === 'ar' ? 'ar' : 'en');
document.documentElement.setAttribute('dir',  lang === 'ar' ? 'rtl' : 'ltr');
```

Set in `tahara-engine.js` (line 1463) and in each React page.

> **Honest answer if asked which is better:** *"Logical properties are the better
> approach — they mirror automatically, so there is no second rule to maintain. The
> `[dir="rtl"]` overrides came first and still handle most of the landing page. If I
> refactored the CSS, converting those is what I would do."*

---

## 9. Section-local tokens

Some sections define their own tokens scoped to that block, rather than adding to
the global set. This keeps section-specific values out of `:root`.

| Token | Value | Where |
| --- | --- | --- |
| `--kf-accent` | `rgb(17, 64, 134)` | Key-features grid on `/about` — the accent for that section |
| `--kf-stroke` | `rgba(17, 64, 134, .4)` | Resting card border in that grid |
| `--fw-angle` | `360deg` | Framework card rotation |
| `--i` | index number | **Stagger index** — set per element in JS so each item animates slightly later |
| `--si`, `--ch`, `--seen`, `--m`, `--sp`, `--e` | computed | Animation progress values written from JavaScript each frame |

> **`--i` is worth explaining.** Instead of writing a separate delay for every card,
> each card gets `--i: 0, 1, 2…` and the CSS does
> `animation-delay: calc(var(--i) * .09s)`. One rule staggers any number of items.

---

## 10. Blog figure palette

The blog chart SVGs in `public/figures/` arrived in a green/sage palette and were
remapped to the site navy — roughly **50 hardcoded hex values per figure**.

| Original | → Site | Role |
| --- | --- | --- |
| `#EFF4F2` | `#edf3fb` | Canvas |
| `#FFFFFF` | `#f9fbfd` | Panel |
| `#16332F` | `#03152f` | Ink |
| `#6E8683` | `#103f86` | Muted |
| `#D3E0DA` | `#c6d7ed` | Hairline |
| `#A9C0B0` | `#afc8e3` | Light accent |
| `#8AAEC6` | `#558bbd` | Mid accent |
| `#4E7A5E` | `#114086` | Strong accent |
| `#4A7391` | `#558bbd` | Secondary |

Fonts inside the SVGs were swapped **Inter → Archivo** and **SF Mono → IBM Plex Mono**.

> **Why the values are baked into the SVGs rather than inherited:** it makes the
> figures immune to a token change — but also means restyling one requires editing
> the SVG. A deliberate trade-off.

---

## 11. Rules & conventions

Things to keep consistent when adding CSS to this project.

1. **Never hardcode a colour.** Use a token. If you need a new one, add it to
   `:root` in `landing.css`.
2. **Never import `landing.css` outside the `(marketing)` route group.** That is
   what keeps the two worlds apart.
3. **Shadows come from `--sh-s/m/l`.** Do not write a new `box-shadow` unless the
   scale genuinely does not cover it.
4. **Prefer logical properties** (`margin-inline-start`) over directional ones
   (`margin-left`) so RTL works without an override.
5. **Watch specificity.** A rule with `:nth-child()` is `(0,2,0)` and beats a plain
   class at `(0,1,0)` **regardless of source order**. This caused a real bug — see
   VIVA.md §11, Bug 9.
6. **Every animation needs a `prefers-reduced-motion` fallback.**
7. **Breakpoints are content-driven.** Add one where the layout actually breaks, not
   because a device has that width.
8. **Wide content gets `overflow-x: auto`** on its own container so the page body
   never scrolls sideways.

---

## 12. Viva answers about CSS

<details><summary><b>"Why didn't you use Tailwind or a CSS framework?"</b></summary>

The landing page already had a working design system built on CSS custom
properties. Adding Tailwind would have created **two sources of truth** for the same
colours — a token called `--ink` and a Tailwind class both trying to define the same
navy. When they drift, you get subtle inconsistencies that are hard to trace.

Plain CSS with custom properties gives the same benefit — change one value, it
updates everywhere — without the second system or the build step.
</details>

<details><summary><b>"What are CSS custom properties and why use them?"</b></summary>

Variables in CSS: `--ink: #03152f` declared on `:root`, used as `color: var(--ink)`.

Three reasons here. **One value, one place** — changing the navy updates the whole
site. **They cascade**, so a section can override a token locally, which is how
`--kf-accent` works. And **JavaScript can set them at runtime** — the animation
engine writes `--m` and `--e` every frame, so the CSS does the rendering and the JS
only supplies numbers.
</details>

<details><summary><b>"How did you make it responsive?"</b></summary>

Three techniques. **Fluid type** with `clamp()`, so headings scale with the viewport
and need no media query at all. **Media queries at content-driven breakpoints** —
1050, 900, 860, 600, 520 — where grids collapse 4 → 2 → 1. And **height-based
breakpoints**, which are less common: the pinned scroll animation switches off below
720px tall, because a full-viewport sticky section on a short screen leaves nothing
to read.
</details>

<details><summary><b>"How do you avoid CSS conflicts across pages?"</b></summary>

Three layers of defence. The **root layout imports no global CSS**, so nothing leaks
by default. **`landing.css` is scoped to a route group**, and Next.js loads route CSS
per segment. And the cookie banner — which appears on every page including outside
that group — uses a **CSS Module**, so its class names are hashed at build time and
cannot collide with anything.
</details>

<details><summary><b>"Explain your colour system."</b></summary>

It is deliberately **monochrome navy** — five brand steps from `#031838` to
`#558bbd`, three ink levels, three surface levels, two line colours. Then exactly
**one** accent, `--signal` at `#b5651d`, a burnt orange, reserved for risk and
blocked states.

Only one accent is the point. Because nothing else on the page is orange, when
`--signal` appears the eye goes straight to it. A second accent colour would dilute
that.
</details>

<details><summary><b>"What is `clamp()`?"</b></summary>

`clamp(min, preferred, max)`. My section headings use
`clamp(30px, 4.4vw, 60px)` — never below 30px, never above 60px, and between those
it is 4.4% of the viewport width. It replaces what would otherwise be three or four
media queries per heading.
</details>

<details><summary><b>"Why is your z-index for the cookie banner 118?"</b></summary>

It is deliberately **below** the modals, which sit at 120–131. If a dialog is open
it should cover the banner. Otherwise the banner floats on top of the dialog's own
dark scrim, which looks broken. The number is commented in the code so nobody
"fixes" it upward later.
</details>
