import type { NextRequest } from 'next/server';
import { json, fail, notReady, readJson, clientIp, withSession, publicUser } from '@/lib/server/http';
import { createUser, createSession, hit } from '@/lib/server/auth';
import { nameError, pinError } from '@/lib/accountRules';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  const nr = notReady(); if (nr) return nr;
  const body = await readJson(req);
  if (!body) return fail('Ongeldig verzoek.');
  const err = nameError(body.name);
  if (err) return fail(err);
  const perr = pinError(body.pin);
  if (perr) return fail(perr);
  if ((await hit('reg:' + clientIp(req), 3600)) > 5) return fail('Er zijn hier net veel accounts gemaakt. Probeer het over een uurtje nog eens.', 429);
  const u = await createUser(body.name, body.pin, body.data);
  if (!u) return fail('Deze naam is al bezet. Kies een andere naam.', 409);
  const token = await createSession(u);
  return withSession(json({ user: publicUser(u) }), token);
}
