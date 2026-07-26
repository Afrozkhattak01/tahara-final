import type { MetadataRoute } from 'next';
import { PLATFORM_MENU } from '@/content/platform';

function slugify(heading: string) {
  return heading.toLowerCase().replace(/\+/g, 'and').replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

const SITE = 'https://tahara.ai'; // update to the real production domain

export default function sitemap(): MetadataRoute.Sitemap {
  const stages = ['assess', 'govern', 'test', 'monitor'];
  const now = new Date();

  return [
    { url: SITE, lastModified: now, changeFrequency: 'weekly', priority: 1 },
    { url: `${SITE}/resources`, lastModified: now, changeFrequency: 'weekly', priority: 0.7 },
    { url: `${SITE}/trust`, lastModified: now, changeFrequency: 'monthly', priority: 0.5 },
    { url: `${SITE}/contact`, lastModified: now, changeFrequency: 'yearly', priority: 0.5 },
    ...PLATFORM_MENU.map(([heading]) => ({
      url: `${SITE}/platform/${slugify(heading)}`,
      lastModified: now,
      changeFrequency: 'monthly' as const,
      priority: 0.8
    })),
    ...stages.map(stage => ({
      url: `${SITE}/lifecycle/${stage}`,
      lastModified: now,
      changeFrequency: 'monthly' as const,
      priority: 0.8
    }))
  ];
}
