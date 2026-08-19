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
  const image = { url: '/og-image.png', width: 1200, height: 630, alt: 'Tahara AI' };

  return {
    title,
    description,
    alternates: { canonical: path },
    openGraph: { type, siteName: 'Tahara AI', title: social, description, url: path, images: [image] },
    twitter: { card: 'summary_large_image', title: social, description, images: ['/og-image.png'] }
  };
}
