/**
 * The landing page's fixed background stack, as a component the React pages in
 * this route group can reuse. Without it they render on bare white while the
 * landing page sits on a gradient wash — the seam is obvious when you click
 * through from one to the other.
 *
 * Every layer here is pure CSS (all four are styled in landing.css, which the
 * route group's layout already loads), so this adds markup and no JavaScript.
 * The landing page additionally paints a `#scene3d` canvas between .bg and
 * .bg-grid; that one is driven by tahara-engine.js, which these pages do not
 * load, so it is deliberately left out.
 */
export default function AmbientBg() {
  return (
    <>
      <div className="bg" aria-hidden="true" />
      <div className="bg-blob blob-1" aria-hidden="true" />
      <div className="bg-blob blob-2" aria-hidden="true" />
      <div className="bg-blob blob-3" aria-hidden="true" />
      <div className="bg-grid" aria-hidden="true" />
      <div className="bg-noise" aria-hidden="true" />
    </>
  );
}
