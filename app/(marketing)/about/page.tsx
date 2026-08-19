import { pageMetadata } from '@/lib/metadata';
import AboutClient from './AboutClient';

// Server Component wrapper. Its only job is to export metadata — a 'use client'
// module cannot, which is why every page here once shared the layout's title.
export const metadata = pageMetadata({
  title: 'About us',
  description:
    'Who we are and what we are building: discovery, governance and audit-ready evidence for the AI systems companies actually run.',
  path: '/about'
});

export default function Page() {
  return <AboutClient />;
}
