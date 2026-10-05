import type { NextRequest } from 'next/server';
import { json, fail, notReady, currentUser, safe } from '@/lib/server/http';
import { board } from '@/lib/server/auth';
import { ALL_KEYS } from '@/lib/levels';

export const dynamic = 'force-dynamic';

// Wereldranglijst van één spel (en niveau, bijv. mepdeblob@snel): top 10 en (als je bent ingelogd) jouw plek.
export const GET = safe(async (req: NextRequest) => {
  const nr = notReady(); if (nr) return nr;
  const game = req.nextUrl.searchParams.get('game') || '';
  if (!ALL_KEYS.includes(game)) return fail('Onbekend spel.', 404);
  const u = await currentUser(req);
  return json(await board(game, 10, u?.id));
});
