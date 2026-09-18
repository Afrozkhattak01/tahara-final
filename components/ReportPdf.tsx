'use client';

import { useEffect } from 'react';

/**
 * Assessment-report → PDF exporter.
 *
 * The report itself is screen 3 of the surface-check modal, built imperatively
 * by the vanilla engine (public/tahara-engine.js). The engine cannot `import`
 * npm packages, so the two heavy dependencies live here instead and the engine
 * reaches them through `window.TaharaReportPDF`, handing over a plain data
 * payload rather than a DOM node.
 *
 * Why we re-lay-out rather than screenshotting the modal: the on-screen report
 * is a dark-on-light two-column panel sized to a viewport, and rasterising it
 * directly gives a document that is one enormous page, cropped on narrow
 * screens, and unreadable when printed. Instead we rebuild the same content as
 * a paginated A4 document off-screen, flow it into pages so no finding is ever
 * sliced across a page break, and capture one page at a time.
 *
 * Both libraries are pulled in with a dynamic import inside the click handler,
 * so nothing ships to a visitor who never presses the button.
 */

/* ── the payload the engine hands over ─────────────────────────────────── */

type Card = { label: string; value: string; desc: string; sig?: boolean };
type Finding = { sev: string; sevLabel: string; tag: string; asset: string; title: string; desc: string };
type Coverage = { name: string; state: string; stateLabel: string; fill: number };

export type ReportPayload = {
  lang: 'en' | 'ar';
  target: string;
  subtitle: string;
  meta: string;
  risk: number;
  riskTitle: string;
  riskDesc: string;
  cards: Card[];
  findingsTitle: string;
  findingsCount: string;
  findings: Finding[];
  coverageTitle: string;
  coverageCount: string;
  coverage: Coverage[];
  recTitle: string;
  recBody: string;
  /* chrome */
  brand: string;
  docKind: string;
  generated: string;
  disclaimer: string;
  pageLabel: (n: number, total: number) => string;
  fileName: string;
};

declare global {
  interface Window {
    TaharaReportPDF?: { download: (payload: ReportPayload) => Promise<void> };
  }
}

/* ── page geometry · A4 at 96dpi ───────────────────────────────────────── */

const PAGE_W = 794;
const PAGE_H = 1123;
const PAD_X = 54;
const PAD_TOP = 42;
const PAD_BOTTOM = 62;                 /* leaves room for the footer rule */
const CONTENT_H = PAGE_H - PAD_TOP - PAD_BOTTOM;

/* Palette lifted from landing.css :root so the document and the screen agree. */
const CSS = `
.tpdf-root{position:fixed;left:-20000px;top:0;z-index:-1;
  --ink:#03152f;--ink-2:#103f86;--ink-3:#4884bc;
  --line:#c6d7ed;--line-2:#afc8e3;--paper:#f9fbfd;--bg-2:#edf3fb;
  --g900:#031838;--g600:#114086;--g400:#558bbd;--signal:#b5651d;
  font-family:'Archivo',system-ui,-apple-system,sans-serif;
  -webkit-font-smoothing:antialiased}
.tpdf-root[dir="rtl"]{font-family:'IBM Plex Sans Arabic','Archivo',system-ui,sans-serif}
.tpdf-page{position:relative;width:${PAGE_W}px;height:${PAGE_H}px;background:#fff;
  padding:${PAD_TOP}px ${PAD_X}px ${PAD_BOTTOM}px;overflow:hidden;color:var(--ink)}
.tpdf-flow{height:${CONTENT_H}px;overflow:hidden}
.tpdf-mono{font-family:'IBM Plex Mono',monospace}

/* masthead · page 1 */
.tpdf-mast{display:flex;align-items:flex-end;justify-content:space-between;gap:20px;
  padding-bottom:16px;border-bottom:1.5px solid var(--g900)}
.tpdf-brand{display:flex;align-items:center;gap:10px;
  font-family:'Libre Caslon Text',Georgia,serif;font-size:20px;line-height:1}
.tpdf-brand img{width:34px;height:43px;object-fit:contain;display:block}
.tpdf-kind{font-family:'IBM Plex Mono',monospace;font-size:9.5px;font-weight:500;
  letter-spacing:.14em;text-transform:uppercase;color:var(--ink-3);text-align:end}

/* running header · pages 2+ */
.tpdf-run{display:flex;align-items:baseline;justify-content:space-between;gap:16px;
  padding-bottom:11px;margin-bottom:22px;border-bottom:1px solid var(--line);
  font-family:'IBM Plex Mono',monospace;font-size:9.5px;letter-spacing:.12em;
  text-transform:uppercase;color:var(--ink-3)}

/* title block */
.tpdf-title{margin-top:26px}
.tpdf-target{display:flex;align-items:center;gap:10px;
  font-family:'Libre Caslon Text',Georgia,serif;font-size:30px;letter-spacing:-.015em;
  line-height:1.2;word-break:break-all}
.tpdf-dot{width:8px;height:8px;flex:none;border-radius:50%;background:var(--signal)}
.tpdf-sub{margin-top:9px;font-size:12.5px;color:var(--ink-2);line-height:1.5}
.tpdf-gen{margin-top:3px;font-family:'IBM Plex Mono',monospace;font-size:10.5px;
  letter-spacing:.06em;color:var(--ink-3)}

/* risk band */
.tpdf-risk{margin-top:24px;padding:20px 22px;border:1px solid var(--line);border-radius:14px;
  background:var(--paper);display:flex;align-items:center;gap:22px}
.tpdf-gauge{position:relative;width:96px;height:96px;flex:none}
.tpdf-gauge svg{display:block;width:96px;height:96px}
.tpdf-gauge-n{position:absolute;inset:0;display:flex;align-items:center;justify-content:center;
  font-weight:600;font-size:27px;letter-spacing:-.02em;color:var(--ink)}
.tpdf-risk-t{font-size:17px;line-height:1.3;color:var(--ink)}
.tpdf-risk-d{margin-top:7px;font-size:12.5px;line-height:1.55;color:var(--ink-2)}

/* stat cards */
.tpdf-cards{margin-top:20px;display:grid;grid-template-columns:repeat(4,1fr);
  border:1px solid var(--line);border-radius:14px;overflow:hidden}
.tpdf-card{padding:16px 16px 18px;border-inline-start:1px solid var(--line)}
.tpdf-card:first-child{border-inline-start:none}
.tpdf-card-l{font-family:'IBM Plex Mono',monospace;font-size:8.5px;font-weight:500;
  letter-spacing:.12em;text-transform:uppercase;color:var(--ink-3);line-height:1.5}
.tpdf-card-v{margin-top:6px;font-weight:600;font-size:30px;letter-spacing:-.02em;
  line-height:1.05;color:var(--ink)}
.tpdf-card-v.is-sig{color:var(--signal)}
.tpdf-card-d{margin-top:6px;font-size:11px;line-height:1.45;color:var(--ink-2)}

/* section heads */
.tpdf-sec{display:flex;align-items:baseline;justify-content:space-between;gap:16px;
  margin-top:30px;padding-bottom:9px;border-bottom:1px solid var(--line);
  font-family:'IBM Plex Mono',monospace;font-size:10px;font-weight:500;letter-spacing:.13em;
  text-transform:uppercase;color:var(--ink-3)}
.tpdf-sec b{color:var(--ink);font-weight:500}

/* findings */
.tpdf-find{display:grid;grid-template-columns:118px minmax(0,1fr) auto;column-gap:16px;
  align-items:start;padding:15px 0;border-bottom:1px solid var(--line)}
.tpdf-sev{grid-row:1 / span 2;align-self:stretch;padding-inline-start:12px;
  border-inline-start:2px solid var(--line-2)}
.tpdf-find.is-critical .tpdf-sev,.tpdf-find.is-high .tpdf-sev{border-inline-start-color:var(--signal)}
.tpdf-find.is-medium .tpdf-sev{border-inline-start-color:#d6a25e}
.tpdf-sev-l{font-family:'IBM Plex Mono',monospace;font-size:9px;font-weight:500;
  letter-spacing:.12em;text-transform:uppercase;color:var(--ink-3);line-height:1.4}
.tpdf-find.is-critical .tpdf-sev-l,.tpdf-find.is-high .tpdf-sev-l{color:var(--signal)}
.tpdf-tag{display:inline-block;margin-top:9px;font-family:'IBM Plex Mono',monospace;
  font-size:9.5px;color:var(--ink-2);background:var(--bg-2);border:1px solid var(--line);
  border-radius:6px;padding:2px 7px;max-width:100%;overflow:hidden;text-overflow:ellipsis;
  white-space:nowrap}
.tpdf-find-t{font-size:14.5px;line-height:1.35;color:var(--ink)}
.tpdf-find-d{grid-column:2;margin-top:5px;font-size:12px;line-height:1.5;color:var(--ink-2)}
.tpdf-asset{justify-self:end;font-family:'IBM Plex Mono',monospace;font-size:11px;
  line-height:1.35;color:var(--ink-3);max-width:180px;overflow:hidden;
  text-overflow:ellipsis;white-space:nowrap}
.tpdf-root[dir="rtl"] .tpdf-asset{justify-self:start;direction:ltr}

/* coverage · two columns on A4, where the screen has room for only one */
.tpdf-cov{display:grid;grid-template-columns:1fr 1fr;gap:15px 30px;margin-top:16px}
.tpdf-cov-row{display:grid;grid-template-columns:1fr auto;gap:6px 12px;align-items:baseline}
.tpdf-cov-n{font-size:12.5px;color:var(--ink)}
.tpdf-cov-s{font-family:'IBM Plex Mono',monospace;font-size:9px;font-weight:500;
  letter-spacing:.12em;text-transform:uppercase;color:var(--ink-3)}
.tpdf-cov-row.is-fail .tpdf-cov-s{color:var(--signal)}
.tpdf-cov-bar{grid-column:1 / -1;height:2px;border-radius:1px;background:var(--line)}
.tpdf-cov-bar > i{display:block;height:100%;border-radius:1px;background:var(--g600)}
.tpdf-cov-row.is-fail .tpdf-cov-bar > i{background:var(--signal)}
.tpdf-cov-row.is-watch .tpdf-cov-bar > i{background:var(--g400)}

/* recommendation */
.tpdf-rec{margin-top:26px;padding:18px 20px;border:1px solid var(--line);border-radius:14px;
  background:var(--paper)}
.tpdf-rec-t{display:flex;align-items:center;gap:9px;font-family:'IBM Plex Mono',monospace;
  font-size:9.5px;font-weight:500;letter-spacing:.13em;text-transform:uppercase;color:var(--signal)}
.tpdf-rec-t i{width:7px;height:7px;flex:none;background:var(--signal);transform:rotate(45deg)}
.tpdf-rec p{margin-top:10px;font-size:12.5px;line-height:1.6;color:var(--ink-2)}

/* footer · every page */
.tpdf-foot{position:absolute;left:${PAD_X}px;right:${PAD_X}px;bottom:26px;
  display:flex;align-items:baseline;justify-content:space-between;gap:16px;
  padding-top:10px;border-top:1px solid var(--line);
  font-family:'IBM Plex Mono',monospace;font-size:8.5px;letter-spacing:.08em;
  color:var(--ink-3)}
`;

/* ── DOM helpers ───────────────────────────────────────────────────────── */

function el(tag: string, cls?: string, text?: string): HTMLElement {
  const n = document.createElement(tag);
  if (cls) n.className = cls;
  if (text != null) n.textContent = text;
  return n;
}

const GAUGE_R = 40;
const GAUGE_C = 2 * Math.PI * GAUGE_R;

/**
 * Risk gauge. The arc is rotated with an SVG `transform` attribute rather than
 * CSS: html2canvas serialises the SVG and re-rasterises it, and a CSS transform
 * with a px transform-origin does not survive that round trip reliably. The
 * score sits in an HTML layer on top for the same reason — serialised <text>
 * loses the webfont.
 */
function gauge(risk: number): HTMLElement {
  const wrap = el('div', 'tpdf-gauge');
  const off = GAUGE_C * (1 - Math.max(0, Math.min(100, risk)) / 100);
  wrap.innerHTML =
    `<svg viewBox="0 0 96 96" xmlns="http://www.w3.org/2000/svg">` +
    `<circle cx="48" cy="48" r="${GAUGE_R}" fill="none" stroke="#c6d7ed" stroke-width="7"/>` +
    `<circle cx="48" cy="48" r="${GAUGE_R}" fill="none" stroke="#b5651d" stroke-width="7"` +
    ` stroke-linecap="round" stroke-dasharray="${GAUGE_C.toFixed(2)}"` +
    ` stroke-dashoffset="${off.toFixed(2)}" transform="rotate(-90 48 48)"/></svg>`;
  wrap.appendChild(el('div', 'tpdf-gauge-n', String(risk)));
  return wrap;
}

/** Every block that can be flowed onto a page, in document order. */
function buildBlocks(p: ReportPayload): { node: HTMLElement; keepWithNext?: boolean }[] {
  const blocks: { node: HTMLElement; keepWithNext?: boolean }[] = [];

  /* masthead */
  const mast = el('div', 'tpdf-mast');
  const brand = el('div', 'tpdf-brand');
  const logo = document.createElement('img');
  logo.src = '/logo-mark-512.png';
  logo.alt = '';
  brand.appendChild(logo);
  brand.appendChild(el('span', undefined, p.brand));
  mast.appendChild(brand);
  mast.appendChild(el('div', 'tpdf-kind', p.docKind));
  blocks.push({ node: mast, keepWithNext: true });

  /* title */
  const title = el('div', 'tpdf-title');
  const tgt = el('div', 'tpdf-target');
  tgt.appendChild(el('span', 'tpdf-dot'));
  tgt.appendChild(el('span', undefined, p.target));
  title.appendChild(tgt);
  title.appendChild(el('div', 'tpdf-sub', p.subtitle + ' · ' + p.meta));
  title.appendChild(el('div', 'tpdf-gen', p.generated));
  blocks.push({ node: title, keepWithNext: true });

  /* risk band */
  const risk = el('div', 'tpdf-risk');
  risk.appendChild(gauge(p.risk));
  const rtxt = el('div');
  rtxt.appendChild(el('div', 'tpdf-risk-t', p.riskTitle));
  rtxt.appendChild(el('div', 'tpdf-risk-d', p.riskDesc));
  risk.appendChild(rtxt);
  blocks.push({ node: risk });

  /* stat cards */
  const cards = el('div', 'tpdf-cards');
  p.cards.forEach((c) => {
    const li = el('div', 'tpdf-card');
    li.appendChild(el('div', 'tpdf-card-l', c.label));
    li.appendChild(el('div', 'tpdf-card-v' + (c.sig ? ' is-sig' : ''), c.value));
    li.appendChild(el('div', 'tpdf-card-d', c.desc));
    cards.appendChild(li);
  });
  blocks.push({ node: cards });

  /* findings */
  const fhead = el('div', 'tpdf-sec');
  fhead.appendChild(el('span', undefined, p.findingsTitle));
  fhead.appendChild(el('span', undefined, p.findingsCount));
  blocks.push({ node: fhead, keepWithNext: true });

  p.findings.forEach((f) => {
    const row = el('div', 'tpdf-find is-' + f.sev);
    const sev = el('div', 'tpdf-sev');
    sev.appendChild(el('div', 'tpdf-sev-l', f.sevLabel));
    sev.appendChild(el('span', 'tpdf-tag', f.tag));
    row.appendChild(sev);
    row.appendChild(el('div', 'tpdf-find-t', f.title));
    row.appendChild(el('div', 'tpdf-asset', f.asset));
    row.appendChild(el('div', 'tpdf-find-d', f.desc));
    blocks.push({ node: row });
  });

  /* coverage — the grid is one block: ten short rows are not worth splitting */
  const chead = el('div', 'tpdf-sec');
  chead.appendChild(el('span', undefined, p.coverageTitle));
  chead.appendChild(el('span', undefined, p.coverageCount));
  blocks.push({ node: chead, keepWithNext: true });

  const cov = el('div', 'tpdf-cov');
  p.coverage.forEach((c) => {
    const row = el('div', 'tpdf-cov-row is-' + c.state);
    row.appendChild(el('div', 'tpdf-cov-n', c.name));
    row.appendChild(el('div', 'tpdf-cov-s', c.stateLabel));
    const bar = el('div', 'tpdf-cov-bar');
    const fill = el('i');
    fill.style.width = Math.max(0, Math.min(100, c.fill)) + '%';
    bar.appendChild(fill);
    row.appendChild(bar);
    cov.appendChild(row);
  });
  blocks.push({ node: cov });

  /* recommendation */
  const rec = el('div', 'tpdf-rec');
  const rt = el('div', 'tpdf-rec-t');
  rt.appendChild(el('i'));
  rt.appendChild(el('span', undefined, p.recTitle));
  rec.appendChild(rt);
  rec.appendChild(el('p', undefined, p.recBody));
  blocks.push({ node: rec });

  return blocks;
}

/** Greedy flow: fill a page until the next block would overflow, then break. */
function paginate(
  root: HTMLElement,
  blocks: { node: HTMLElement; keepWithNext?: boolean }[],
  p: ReportPayload
): HTMLElement[] {
  const pages: HTMLElement[] = [];
  let page: HTMLElement | null = null;
  let flow: HTMLElement | null = null;

  const newPage = () => {
    page = el('div', 'tpdf-page');
    flow = el('div', 'tpdf-flow');
    /* Pages after the first reintroduce the brand and the target, so a loose
       sheet out of a printer still says what it belongs to. */
    if (pages.length) {
      const run = el('div', 'tpdf-run');
      run.appendChild(el('span', undefined, p.brand + ' · ' + p.docKind));
      run.appendChild(el('span', undefined, p.target));
      flow.appendChild(run);
    }
    page.appendChild(flow);
    root.appendChild(page);
    pages.push(page);
  };

  newPage();

  for (let i = 0; i < blocks.length; i++) {
    const b = blocks[i];
    if (!b) continue;
    flow!.appendChild(b.node);
    if (flow!.scrollHeight <= CONTENT_H) continue;

    /* Overflowed. If this block is the only thing on the page it cannot be
       moved anywhere better, so let it stay and clip rather than loop. */
    const alone = flow!.children.length === (pages.length > 1 ? 2 : 1);
    if (alone) continue;

    flow!.removeChild(b.node);
    /* A section head stranded at the foot of a page reads as an empty section;
       carry it over with its first row. */
    const prev = i > 0 ? blocks[i - 1] : undefined;
    const carry = !!prev && !!prev.keepWithNext && flow!.lastElementChild === prev.node;
    if (carry && prev) flow!.removeChild(prev.node);
    newPage();
    if (carry && prev) flow!.appendChild(prev.node);
    flow!.appendChild(b.node);
  }

  /* Footers last: the page count is not known until the flow is finished. */
  pages.forEach((pg, i) => {
    const foot = el('div', 'tpdf-foot');
    foot.appendChild(el('span', undefined, p.disclaimer));
    foot.appendChild(el('span', undefined, p.pageLabel(i + 1, pages.length)));
    pg.appendChild(foot);
  });

  return pages;
}

/* ── export ────────────────────────────────────────────────────────────── */

async function download(payload: ReportPayload): Promise<void> {
  const [{ default: html2canvas }, { jsPDF }] = await Promise.all([
    import('html2canvas'),
    import('jspdf'),
  ]);

  const root = el('div', 'tpdf-root');
  root.setAttribute('dir', payload.lang === 'ar' ? 'rtl' : 'ltr');
  root.lang = payload.lang;
  const style = document.createElement('style');
  style.textContent = CSS;
  root.appendChild(style);
  document.body.appendChild(root);

  try {
    const blocks = buildBlocks(payload);
    const pages = paginate(root, blocks, payload);

    /* Capturing before the webfonts and the logo resolve gives a document set
       in the fallback face, with the mark missing. */
    if (document.fonts && document.fonts.ready) await document.fonts.ready;
    await Promise.all(
      Array.from(root.querySelectorAll('img')).map((img) =>
        img.decode ? img.decode().catch(() => undefined) : Promise.resolve()
      )
    );

    const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4', compress: true });
    for (let i = 0; i < pages.length; i++) {
      const page = pages[i];
      if (!page) continue;
      const canvas = await html2canvas(page, {
        scale: 2,                     /* 2× keeps the 8.5px mono legible in print */
        backgroundColor: '#ffffff',
        useCORS: true,
        logging: false,
        width: PAGE_W,
        height: PAGE_H,
        windowWidth: PAGE_W,
        windowHeight: PAGE_H,
      });
      /* JPEG, not PNG: eight lossless 1588×2246 sheets land around 12MB, which
         is not a file anyone wants to be handed. */
      const img = canvas.toDataURL('image/jpeg', 0.95);
      if (i) pdf.addPage('a4', 'portrait');
      pdf.addImage(img, 'JPEG', 0, 0, 210, 297, undefined, 'FAST');
    }
    pdf.save(payload.fileName);
  } finally {
    root.remove();
  }
}

export default function ReportPdf() {
  useEffect(() => {
    window.TaharaReportPDF = { download };
    return () => {
      delete window.TaharaReportPDF;
    };
  }, []);
  return null;
}
