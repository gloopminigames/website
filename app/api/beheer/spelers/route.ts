import type { NextRequest } from 'next/server';
import { json, fail, notReady, readJson, safe } from '@/lib/server/http';
import { adminState, findPlayers, playerAction } from '@/lib/server/admin';

export const dynamic = 'force-dynamic';
const ACTIONS = ['hide', 'unhide', 'rename', 'reset', 'delete'];

// Spelers zoeken op naam (leeg = laatst actief).
export const GET = safe(async (req: NextRequest) => {
  const nr = notReady(); if (nr) return nr;
  const s = await adminState(req);
  if (s.state !== 'ok') return fail('Geen toegang.', 403);
  return json({ players: await findPlayers(req.nextUrl.searchParams.get('q') || '') });
});

// Actie op één speler: verbergen, terugzetten, hernoemen, scores wissen of verwijderen.
export const POST = safe(async (req: NextRequest) => {
  const nr = notReady(); if (nr) return nr;
  const body = await readJson(req, 1000);
  if (!body || typeof body.id !== 'string' || !ACTIONS.includes(body.action)) return fail('Ongeldig verzoek.');
  const s = await adminState(req);
  if (s.state !== 'ok') return fail('Geen toegang.', 403);
  const err = await playerAction(s.user, body.id, body.action, body.name);
  return err ? fail(err) : json({ ok: true });
});
