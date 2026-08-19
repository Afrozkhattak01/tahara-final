import type { MetadataRoute } from 'next';
import { SITE_URL } from '@/lib/site';
import { POSTS } from './(marketing)/resources/posts';

// Served at /sitemap.xml. Lists only routes that actually exist today:
// the four static marketing pages plus one entry per blog post. Adding a post
// to posts.ts adds it here automatically — there is no second list to update.
export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: SITE_URL, changeFrequency: 'weekly', priority: 1 },
    { url: `${SITE_URL}/about`, changeFrequency: 'monthly', priority: 0.8 },
    { url: `${SITE_URL}/governance`, changeFrequency: 'monthly', priority: 0.8 },
    { url: `${SITE_URL}/resources`, changeFrequency: 'weekly', priority: 0.7 },
    ...POSTS.map((post) => ({
      url: `${SITE_URL}/resources/${post.slug}`,
      changeFrequency: 'monthly' as const,
      priority: 0.6
    }))
  ];
}
