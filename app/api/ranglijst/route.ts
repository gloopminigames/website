import type { NextRequest } from 'next/server';
import { json, fail, notReady, currentUser, safe } from '@/lib/server/http';
import { board } from '@/lib/server/auth';
import { PLAYABLE } from '@/lib/games';

export const dynamic = 'force-dynamic';

// Wereldranglijst van één spel: top 10 en (als je bent ingelogd) jouw plek.
export const GET = safe(async (req: NextRequest) => {
  const nr = notReady(); if (nr) return nr;
  const game = req.nextUrl.searchParams.get('game') || '';
  if (!PLAYABLE.some((g: { id: string }) => g.id === game)) return fail('Onbekend spel.', 404);
  const u = await currentUser(req);
  return json(await board(game, 10, u?.id));
});
