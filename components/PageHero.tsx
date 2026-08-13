/**
 * The centred page hero: status pill, serif headline, lead, one CTA, sitting on
 * a survey grid.
 *
 * Extracted the moment a second page wanted it. The nav and footer are still
 * copy-pasted per page — this is the first piece of that duplication being
 * paid off, not the whole job.
 *
 * The grid is drawn here rather than reusing the landing page's `.field`:
 * that one's opacity is wound down by the scroll engine, which these React
 * pages do not load, so it would render at whatever value the engine last
 * left it.
 *
 * Server component — no state, no effects. The pages that use it stay client
 * components for the language toggle and pass their already-translated
 * strings in.
 */

type Props = {
  badge: string;
  title: string;
  lead: string;
  cta: string;
  /** cal.com booking link; omit to render no button */
  calLink?: string;
};

export default function PageHero({ badge, title, lead, cta, calLink }: Props) {
  return (
    <section className="ph-hero">
      <span className="ph-field" aria-hidden="true"></span>
      <style suppressHydrationWarning>{`
        .ph-hero{position:relative;isolation:isolate;text-align:center;
          padding:104px 0 118px;overflow:hidden}
        .ph-field{position:absolute;inset:0;z-index:-1;pointer-events:none;
          background-image:
            linear-gradient(rgba(17,64,134,.07) 1px,transparent 1px),
            linear-gradient(90deg,rgba(17,64,134,.07) 1px,transparent 1px);
          background-size:96px 96px;
          -webkit-mask-image:radial-gradient(ellipse 96% 88% at 50% 46%,#000 62%,transparent 100%);
          mask-image:radial-gradient(ellipse 96% 88% at 50% 46%,#000 62%,transparent 100%)}
        /* a small cross at each coarse intersection */
        .ph-field::after{content:'';position:absolute;inset:0;
          background-image:
            linear-gradient(rgba(17,64,134,.32) 1px,transparent 1px),
            linear-gradient(90deg,rgba(17,64,134,.32) 1px,transparent 1px);
          background-size:96px 17px,17px 96px;
          background-position:40px 39px,39px 40px;
          background-repeat:repeat}

        .ph-badge{display:inline-flex;align-items:center;gap:9px;
          border:1px solid var(--line);border-radius:999px;background:#fff;
          padding:8px 18px;box-shadow:var(--sh-s);
          font-family:var(--font-mono);font-size:11.5px;font-weight:500;
          letter-spacing:.13em;text-transform:uppercase;color:var(--g600)}
        .ph-badge > i{width:7px;height:7px;border-radius:50%;background:#12855a;
          animation:ph-pulse 2.2s ease-in-out infinite}
        @keyframes ph-pulse{0%,100%{opacity:.35}50%{opacity:1}}

        /* 700, not the site's usual 400 display weight: the reference hero is
           set in the bold cut, and Libre Caslon Text's bold is now loaded for
           it. No max-width — .wrap's 1180px is what breaks the line, which is
           what puts "Your Company" on its own row rather than a 16ch cap
           forcing three. */
        /* Slightly wider than .wrap so "…Running In" holds on the first line
           rather than dropping "In" to the second. Capped against the viewport
           so it can never push the page sideways on a narrow screen. */
        .ph-hero h1{margin:32px auto 0;font-weight:700;
          width:min(1240px,calc(100vw - 48px));
          font-size:clamp(34px,5.2vw,64px);line-height:1.12;letter-spacing:-.02em;
          color:var(--ink)}
        .ph-hero p{margin:28px auto 0;max-width:min(100%,640px);
          font-size:clamp(15.5px,1.4vw,19px);line-height:1.62;color:var(--ink-2)}
        .ph-cta{margin-top:38px}
        /* the hero button sits larger than the nav's */
        .ph-cta .btn{padding:15px 30px;font-size:16.5px;font-weight:600;border-radius:9px}

        @media(prefers-reduced-motion:reduce){ .ph-badge > i{animation:none} }
        @media(max-width:640px){
          .ph-hero{padding:66px 0 78px}
          .ph-hero h1{max-width:none}
          .ph-badge{font-size:10.5px;padding:7px 14px}
          .ph-field{background-size:64px 64px}
          .ph-field::after{background-size:64px 9px,9px 64px;
            background-position:31px 27px,27px 31px}
        }
      `}</style>
      <div className="wrap">
        <span className="ph-badge"><i aria-hidden="true"></i>{badge}</span>
        <h1>{title}</h1>
        <p>{lead}</p>
        {cta ? (
          <div className="ph-cta">
            <button className="btn btn-solid" data-cal-link={calLink}>
              <span>{cta}</span>
            </button>
          </div>
        ) : null}
      </div>
    </section>
  );
}
