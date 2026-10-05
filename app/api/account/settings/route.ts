import type { NextRequest } from 'next/server';
import { json, fail, notReady, readJson, currentUser, publicUser, safe } from '@/lib/server/http';
import { setOnBoard } from '@/lib/server/auth';

export const dynamic = 'force-dynamic';

// Instellingen van het account, nu: wel of niet op de wereldranglijst.
export const POST = safe(async (req: NextRequest) => {
  const nr = notReady(); if (nr) return nr;
  const body = await readJson(req);
  if (!body || typeof body.onBoard !== 'boolean') return fail('Ongeldig verzoek.');
  const u = await currentUser(req);
  if (!u) return fail('Je bent niet ingelogd.', 401);
  await setOnBoard(u, body.onBoard);
  return json({ user: publicUser(u) });
});
