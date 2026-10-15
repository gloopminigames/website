import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { NextResponse, type NextRequest } from 'next/server';
import { notReady, safe } from '@/lib/server/http';
import { adminState } from '@/lib/server/admin';

export const dynamic = 'force-dynamic';

// Testlab: Sprout & Sword (in ontwikkeling). Alleen voor beheerders met het beheerwachtwoord;
// iedereen anders gaat naar /beheer. Het spel staat bewust niet in /public.
export const GET = safe(async (req: NextRequest) => {
  const s = notReady() ? null : await adminState(req);
  if (s?.state !== 'ok') return NextResponse.redirect(new URL('/beheer', req.url), 303);
  const html = await readFile(path.join(process.cwd(), 'lib/lab/sprout.html'), 'utf8');
  return new NextResponse(html, { headers: {
    'Content-Type': 'text/html; charset=utf-8',
    'Cache-Control': 'no-store',
    'X-Robots-Tag': 'noindex, nofollow',
  } });
});
