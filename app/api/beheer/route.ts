import type { NextRequest } from 'next/server';
import { json, notReady, readJson, safe } from '@/lib/server/http';
import { adminState, ADMIN_COOKIE } from '@/lib/server/admin';

export const dynamic = 'force-dynamic';

// Mag deze speler in het beheer? (login / forbidden / setup / password / ok)
export const GET = safe(async (req: NextRequest) => {
  const nr = notReady(); if (nr) return nr;
  const s = await adminState(req);
  return json({ state: s.state, name: s.user?.name });
});

// Beheer verlaten (het gewone account blijft ingelogd).
export const DELETE = safe(async (req: NextRequest) => {
  if (!(await readJson(req))) return json({ error: 'Ongeldig verzoek.' }, 400);
  const res = json({ ok: true });
  res.cookies.set(ADMIN_COOKIE, '', { httpOnly: true, path: '/', maxAge: 0 });
  return res;
});
