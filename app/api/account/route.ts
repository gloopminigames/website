import type { NextRequest } from 'next/server';
import { currentUser, json, fail, notReady, publicUser, readJson, clearSession } from '@/lib/server/http';
import { deleteUser, endSession, COOKIE } from '@/lib/server/auth';

export const dynamic = 'force-dynamic';

// Wie is er ingelogd?
export async function GET(req: NextRequest) {
  const nr = notReady(); if (nr) return json({ user: null, available: false });
  const u = await currentUser(req);
  return json({ user: u ? publicUser(u) : null, available: true });
}

// Account (en alle bijbehorende gegevens) verwijderen.
export async function DELETE(req: NextRequest) {
  const nr = notReady(); if (nr) return nr;
  if (!(await readJson(req))) return fail('Ongeldig verzoek.');
  const u = await currentUser(req);
  if (!u) return fail('Je bent niet ingelogd.', 401);
  await deleteUser(u);
  await endSession(req.cookies.get(COOKIE)?.value);
  return clearSession(json({ ok: true }));
}
