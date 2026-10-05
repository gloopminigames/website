import { json, safe } from '@/lib/server/http';
import { dbCheck } from '@/lib/server/db';

export const dynamic = 'force-dynamic';

// Controlepagina voor de beheerder: werkt de koppeling met Supabase? Toont geen geheimen.
export const GET = safe(async () => json(await dbCheck()));
