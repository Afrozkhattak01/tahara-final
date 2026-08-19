import type { Metadata } from 'next';
import { pageMetadata } from '@/lib/metadata';
import { POSTS, getPost } from '../posts';
import PostClient from './PostClient';

type Params = { params: { slug: string } };

// Every post gets its own title and social card straight from posts.ts, so
// adding a post stays a one-object job — nothing to update here.
export function generateMetadata({ params }: Params): Metadata {
  const post = getPost(params.slug);
  if (!post) return pageMetadata({ title: 'Not found', description: 'This article does not exist.', path: `/resources/${params.slug}` });

  return pageMetadata({
    title: post.title,
    description: post.excerpt,
    path: `/resources/${post.slug}`,
    type: 'article'
  });
}

// Prerenders all three posts at build time instead of rendering each on demand.
// posts.ts is compiled in anyway, so adding a post already needed a rebuild.
export function generateStaticParams() {
  return POSTS.map((post) => ({ slug: post.slug }));
}

// No notFound() here on purpose: PostClient already renders a designed,
// translated "not found" state inside the site chrome (header, back link,
// footer). Handing an unknown slug to Next's bare 404 would be a downgrade.
// generateStaticParams prerenders the known posts; dynamicParams (on by
// default) still lets an unknown slug render that state on demand.
export default function Page() {
  return <PostClient />;
}
