import type { NextRequest } from 'next/server';
import { json, notReady, clearSession, safe } from '@/lib/server/http';
import { endSession, COOKIE } from '@/lib/server/auth';

export const dynamic = 'force-dynamic';

export const POST = safe(async (req: NextRequest) => {
  const nr = notReady(); if (nr) return nr;
  await endSession(req.cookies.get(COOKIE)?.value);
  return clearSession(json({ ok: true }));
});
