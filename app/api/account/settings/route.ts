import type { NextRequest } from 'next/server';
import { json, fail, notReady, readJson, currentUser, publicUser, safe } from '@/lib/server/http';
import { setOnBoard, setAvatar } from '@/lib/server/auth';
import { validAvatar } from '@/lib/accountRules';

export const dynamic = 'force-dynamic';

// Instellingen van het account: wel of niet op de wereldranglijst, en je eigen Gloop.
export const POST = safe(async (req: NextRequest) => {
  const nr = notReady(); if (nr) return nr;
  const body = await readJson(req);
  if (!body || (typeof body.onBoard !== 'boolean' && !validAvatar(body.avatar))) return fail('Ongeldig verzoek.');
  const u = await currentUser(req);
  if (!u) return fail('Je bent niet ingelogd.', 401);
  if (typeof body.onBoard === 'boolean') await setOnBoard(u, body.onBoard);
  if (validAvatar(body.avatar)) await setAvatar(u, body.avatar);
  return json({ user: publicUser(u) });
});
