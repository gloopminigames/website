import type { NextRequest } from 'next/server';
import { clientIp, currentUser } from '@/lib/server/http';
import { dbReady } from '@/lib/server/db';
import { getUser, checkPin, createSession, sessionUser, endSession, saveData, hit, count, reset } from '@/lib/server/auth';
import { allowedOrigin, xlJson, xlFail, xlPreflight, bearer, readXlJson, xlUser } from '@/lib/server/xl';
import { cleanName, validPin } from '@/lib/accountRules';
import { mergeData } from '@/lib/merge';

export const dynamic = 'force-dynamic';
const WINDOW = 15 * 60;
type Ctx = { params: Promise<{ action: string }> };

// Gloop XL: /api/xl/login, /api/xl/me, /api/xl/sync, /api/xl/logout (zie lib/server/xl.js).
async function handle(req: NextRequest, { params }: Ctx) {
  const host = req.headers.get('host'), sent = req.headers.get('origin');
  const origin = allowedOrigin(sent, host);
  if (sent && !origin) return xlFail('', 'Niet toegestaan.', 403);
  // XL op Gloop zelf (/xl/) mag ook de gewone Gloop-inlogcookie gebruiken.
  // Een POST van een andere site heeft altijd een Origin; dan alleen met een inlogcode.
  let sameSite = !sent;
  try { if (sent) sameSite = new URL(sent).host === host; } catch (e) { sameSite = false; }
  const { action } = await params;
  try {
    if (!dbReady()) return xlFail(origin, 'Inloggen is nog niet beschikbaar. Probeer het later nog eens.', 503);

    if (action === 'login' && req.method === 'POST') {
      const body = await readXlJson(req, 2000);
      if (!body || typeof body.name !== 'string' || !validPin(body.pin)) return xlFail(origin, 'Vul je naam en je pincode in.');
      const nameKey = 'login:' + cleanName(body.name).toLowerCase(), ipKey = 'loginip:' + clientIp(req);
      // Zelfde rem als op Gloop: max. 5 fouten per naam en 30 per adres per kwartier.
      if ((await count(nameKey)) >= 5 || (await count(ipKey)) >= 30) return xlFail(origin, 'Te vaak geprobeerd. Wacht een kwartiertje en probeer het dan opnieuw.', 429);
      const u = await getUser(body.name);
      if (!u || !(await checkPin(u, body.pin))) {
        await hit(nameKey, WINDOW); await hit(ipKey, WINDOW);
        return xlFail(origin, 'Die naam of pincode klopt niet. Probeer het nog eens.', 401);
      }
      await reset(nameKey);
      return xlJson(origin, { token: await createSession(u), user: xlUser(u) });
    }

    const token = bearer(req);
    if (action === 'logout' && req.method === 'POST') { await endSession(token); return xlJson(origin, { ok: true }); }

    const viaCookie = !token && sameSite;
    const u = token ? await sessionUser(token) : viaCookie ? await currentUser(req) : null;
    if (!u) return xlFail(origin, 'Je bent niet ingelogd.', 401);
    if (action === 'me' && req.method === 'GET') return xlJson(origin, { user: xlUser(u, viaCookie ? 'gloop' : 'token') });
    if (action === 'sync' && req.method === 'POST') {
      const body = await readXlJson(req, 80000);
      if (!body || typeof body.lfi !== 'object') return xlFail(origin, 'Ongeldig verzoek.');
      // Alleen het eiland samenvoegen; de rest van je Gloop-gegevens blijft zoals het is.
      await saveData(u, mergeData(u.data, { lfi: body.lfi }));
      return xlJson(origin, { lfi: u.data.lfi || null });
    }
    return xlFail(origin, 'Onbekend verzoek.', 404);
  } catch (e) {
    console.error('[gloop xl]', e);
    return xlFail(origin, 'De server heeft even een probleem. Probeer het later nog eens.', 500);
  }
}
export const GET = handle;
export const POST = handle;
export async function OPTIONS(req: NextRequest) { return xlPreflight(allowedOrigin(req.headers.get('origin'), req.headers.get('host'))); }
