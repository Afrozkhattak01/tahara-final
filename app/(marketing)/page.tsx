import fs from 'node:fs';
import path from 'node:path';
import TaharaRuntime from './TaharaRuntime';

// Read the ported markup on the server so it is present in the initial HTML
// (server-rendered, SEO-visible, no blank flash before hydration). The file is
// co-located in this route group; read at build time (this page is static).
export default function Home() {
  const markup = fs.readFileSync(
    path.join(process.cwd(), 'app', '(marketing)', 'tahara-body.html'),
    'utf8'
  );
  return <TaharaRuntime html={markup} />;
}
