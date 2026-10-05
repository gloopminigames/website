import type { NextRequest } from 'next/server';
import { json, fail, notReady, readJson, clientIp, safe } from '@/lib/server/http';
import { hit, count, reset } from '@/lib/server/auth';
import { adminState, checkPassword, adminToken, cookieOpts, ADMIN_COOKIE, log } from '@/lib/server/admin';

export const dynamic = 'force-dynamic';
const WINDOW = 60 * 60;

// Tweede slot: het beheerwachtwoord. Max. 5 fouten per uur.
export const POST = safe(async (req: NextRequest) => {
  const nr = notReady(); if (nr) return nr;
  const body = await readJson(req, 500);
  if (!body || typeof body.password !== 'string') return fail('Vul het beheerwachtwoord in.');
  const s = await adminState(req);
  if (s.state === 'login') return fail('Log eerst in met je account.', 401);
  if (s.state === 'forbidden') return fail('Dit account heeft geen beheerrechten.', 403);
  if (s.state === 'setup') return fail('ADMIN_PASSWORD (minstens 12 tekens) ontbreekt nog in Vercel.', 503);
  const u = s.user!, k1 = 'beheer:' + u.id, k2 = 'beheerip:' + clientIp(req);
  if ((await count(k1)) >= 5 || (await count(k2)) >= 5) return fail('Te vaak geprobeerd. Wacht een uur en probeer het opnieuw.', 429);
  if (!checkPassword(body.password)) {
    await hit(k1, WINDOW); await hit(k2, WINDOW);
    console.warn('[gloop beheer] fout wachtwoord voor', u.name);
    return fail('Dat wachtwoord klopt niet.', 401);
  }
  await reset(k1);
  log(u, 'ingelogd in beheer');
  const res = json({ ok: true });
  res.cookies.set(ADMIN_COOKIE, adminToken(u), { ...cookieOpts, sameSite: 'strict' as const });
  return res;
});
