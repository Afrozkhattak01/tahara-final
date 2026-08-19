import { pageMetadata } from '@/lib/metadata';
import ResourcesClient from './ResourcesClient';

export const metadata = pageMetadata({
  title: 'Resources',
  description:
    "Field notes on AI assurance: prompting models well, and proving what an agent did once it is out acting on your behalf.",
  path: '/resources'
});

export default function Page() {
  return <ResourcesClient />;
}
