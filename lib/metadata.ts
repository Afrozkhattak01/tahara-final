import type { Metadata } from 'next';

// Builds the per-page metadata block.
//
// Every page under (marketing) used to inherit the route group layout's
// `title: { absolute: ... }`, so all five shipped an identical <title> and
// <meta description>. Search engines saw five pages that looked like one, and
// blog articles had no title of their own at all.
//
// Next does NOT derive openGraph/twitter fields from `title` and `description`,
// so those have to be restated. Doing that here rather than in each page keeps
// the five consistent and makes adding a page a three-line job.
export function pageMetadata(opts: {
  /** Bare page title. The root layout's "%s · Tahara AI" template wraps it. */
  title: string;
  description: string;
  /** Root-relative path, resolved against metadataBase for the canonical URL. */
  path: string;
  /** 'article' for blog posts, so unfurlers render them as content not a site. */
  type?: 'website' | 'article';
}): Metadata {
  const { title, description, path, type = 'website' } = opts;
  const social = `${title} · Tahara AI`;
  // TODO: og-image.png (1200x630) was removed. The wide lockup stands in -- at
  // 2120x632 it is almost exactly the 1.91:1 unfurlers expect, so it rescales
  // cleanly. Swap both entries back when a real poster exists.
  const image = { url: '/logo-full-lockup.png', width: 2120, height: 632, alt: 'Tahara AI' };

  return {
    title,
    description,
    alternates: { canonical: path },
    openGraph: { type, siteName: 'Tahara AI', title: social, description, url: path, images: [image] },
    twitter: { card: 'summary_large_image', title: social, description, images: ['/logo-full-lockup.png'] }
  };
}
