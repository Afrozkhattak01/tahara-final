import { pageMetadata } from '@/lib/metadata';
import GovernanceClient from './GovernanceClient';

export const metadata = pageMetadata({
  title: 'Governance',
  description:
    'Discover every AI system in your environment, check it against the frameworks that actually apply, and produce the evidence to prove it — continuously, not once a year.',
  path: '/governance'
});

export default function Page() {
  return <GovernanceClient />;
}
