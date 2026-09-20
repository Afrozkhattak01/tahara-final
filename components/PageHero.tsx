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
  /** status pill above the headline; omit to render none */
  badge?: string;
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
      {/* The .ph-* rules live in landing.css, NOT in an inline <style> here.
          They used to be inline, which made the hero style itself differently
          depending on how you arrived: on a direct load the <style> was in the
          server HTML, but on a client-side <Link> navigation the RSC payload
          carries no markup at all -- it only references JS chunks -- so the
          style element had to be created by React at runtime, after the grid
          had already painted. landing.css is loaded by the route-group layout
          before anything renders, so both paths now look identical. */}
      <div className="wrap">
        {badge ? <span className="ph-badge"><i aria-hidden="true"></i>{badge}</span> : null}
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
