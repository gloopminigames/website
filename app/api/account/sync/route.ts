import type { NextRequest } from 'next/server';
import { json, fail, notReady, readJson, currentUser, safe } from '@/lib/server/http';
import { saveData } from '@/lib/server/auth';
import { mergeData } from '@/lib/merge';

export const dynamic = 'force-dynamic';

// Records van dit apparaat samenvoegen met het account; het resultaat gaat terug naar de browser.
export const POST = safe(async (req: NextRequest) => {
  const nr = notReady(); if (nr) return nr;
  const body = await readJson(req, 80000);  // ruimer: de boerderij van Gloop Eiland en het eiland van Little Farm Island gaan mee
  if (!body) return fail('Ongeldig verzoek.');
  const u = await currentUser(req);
  if (!u) return fail('Je bent niet ingelogd.', 401);
  await saveData(u, mergeData(u.data, body.data));
  return json({ data: u.data });
});
