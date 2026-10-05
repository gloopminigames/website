import type { NextRequest } from 'next/server';
import { json, fail, notReady, readJson, clientIp, withSession, publicUser } from '@/lib/server/http';
import { getUser, checkPin, createSession, hit, count, reset } from '@/lib/server/auth';
import { cleanName, validPin } from '@/lib/accountRules';

export const dynamic = 'force-dynamic';
const WINDOW = 15 * 60;

export async function POST(req: NextRequest) {
  const nr = notReady(); if (nr) return nr;
  const body = await readJson(req);
  if (!body || typeof body.name !== 'string' || !validPin(body.pin)) return fail('Vul je naam en je pincode in.');
  const nameKey = 'login:' + cleanName(body.name).toLowerCase(), ipKey = 'loginip:' + clientIp(req);
  // Een pincode is makkelijk, dus raden afremmen: max. 5 fouten per naam en 30 per adres per kwartier.
  if ((await count(nameKey)) >= 5 || (await count(ipKey)) >= 30) return fail('Te vaak geprobeerd. Wacht een kwartiertje en probeer het dan opnieuw.', 429);
  const u = await getUser(body.name);
  if (!u || !(await checkPin(u, body.pin))) {
    await hit(nameKey, WINDOW); await hit(ipKey, WINDOW);
    return fail('Die naam of pincode klopt niet. Probeer het nog eens!', 401);
  }
  await reset(nameKey);
  const token = await createSession(u);
  return withSession(json({ user: publicUser(u) }), token);
}
