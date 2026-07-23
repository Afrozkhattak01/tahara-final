import fs from 'node:fs';
import path from 'node:path';
import TaharaRuntime from './TaharaRuntime';

// Read the ported markup on the server so it is present in the initial HTML
// (server-rendered, SEO-visible, no blank flash before hydration).
export default function Home() {
  const markup = fs.readFileSync(
    path.join(process.cwd(), 'public', 'tahara-body.html'),
    'utf8'
  );
  return <TaharaRuntime html={markup} />;
}
