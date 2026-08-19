import type { Metadata } from 'next';
import fs from 'node:fs';
import path from 'node:path';
import TaharaRuntime from './TaharaRuntime';
import ReportPdf from '../../components/ReportPdf';

// Read the ported markup on the server so it is present in the initial HTML
// (server-rendered, SEO-visible, no blank flash before hydration). The file is
// co-located in this route group; read at build time (this page is static).
// Canonical only -- title and description stay inherited from the route
// group layout, which describes the landing page already.
export const metadata: Metadata = { alternates: { canonical: '/' } };

export default function Home() {
  const markup = fs.readFileSync(
    path.join(process.cwd(), 'app', '(marketing)', 'tahara-body.html'),
    'utf8'
  );
  return (
    <>
      <TaharaRuntime html={markup} />
      {/* Renders nothing — publishes window.TaharaReportPDF for the vanilla
          engine's "Download report" button. The PDF libraries behind it are
          dynamically imported on click, not in this bundle. */}
      <ReportPdf />
    </>
  );
}
