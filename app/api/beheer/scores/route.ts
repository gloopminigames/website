import type { NextRequest } from 'next/server';
import { json, fail, notReady, readJson, safe } from '@/lib/server/http';
import { adminState, listScores, removeScore } from '@/lib/server/admin';

export const dynamic = 'force-dynamic';

// Top 50 van een spel (en niveau), ook verborgen spelers en spelers die niet op de ranglijst willen.
export const GET = safe(async (req: NextRequest) => {
  const nr = notReady(); if (nr) return nr;
  const s = await adminState(req);
  if (s.state !== 'ok') return fail('Geen toegang.', 403);
  const rows = await listScores(req.nextUrl.searchParams.get('game') || '');
  return rows ? json({ rows }) : fail('Onbekend spel.', 404);
});

// Eén score weghalen (bijv. valsspelen).
export const POST = safe(async (req: NextRequest) => {
  const nr = notReady(); if (nr) return nr;
  const body = await readJson(req, 1000);
  if (!body || typeof body.id !== 'string' || typeof body.game !== 'string') return fail('Ongeldig verzoek.');
  const s = await adminState(req);
  if (s.state !== 'ok') return fail('Geen toegang.', 403);
  const err = await removeScore(s.user, body.id, body.game);
  return err ? fail(err) : json({ ok: true });
});
