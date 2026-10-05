# Gloop 🫧

Gratis mini games voor tussendoor, gemaakt door NDR Creatives.
Gebouwd met **Next.js** (App Router). Alle pagina's worden vooraf als statische HTML gebouwd,
en elke game wordt pas geladen als iemand hem opent.

## Lokaal draaien

```bash
npm install
npm run dev        # http://localhost:3000
```

Productiebuild testen:

```bash
npm run build
npm start
```

## Online zetten (Vercel)

1. Zet deze map in een GitHub-repo (`git init`, `git add .`, `git commit`, `git push`).
2. Vercel → **Add New → Project** → kies de repo. Vercel herkent Next.js vanzelf → **Deploy**.
3. **Settings → Domains**: koppel je domein.
4. Vul in `lib/site.js` het veld `url` in (bijv. `https://gloop.nl`) en push. Dit wordt gebruikt
   voor deellinks, de sitemap en Google. Laat je het leeg, dan gebruikt de site op Vercel
   automatisch het productiedomein van het project.

## Accounts (Supabase)

Spelers kunnen een account maken met alleen een **spelersnaam en een pincode van 4 of 6 cijfers** (geen e-mail).
Records gaan dan automatisch mee naar elk apparaat. Accounts staan in Supabase; alleen de server praat met de database.

1. Maak een project op [supabase.com](https://supabase.com). Kies als regio **Frankfurt (EU)** – de privacyverklaring zegt dat de data in de EU staat.
2. Open **SQL Editor**, plak de inhoud van `supabase/schema.sql` en klik **Run**.
3. Zet in Supabase (Database → Extensions) **pg_cron** aan en voer uit:
   `select cron.schedule('gloop-cleanup', '17 3 * * *', 'select public.gloop_cleanup()');`
   Zo worden accounts die 400 dagen niet zijn gebruikt automatisch verwijderd (dat belooft de privacyverklaring).
4. Vercel → **Settings → Environment Variables**: voeg toe
   - `SUPABASE_URL` – Project Settings → API → Project URL
   - `SUPABASE_SERVICE_ROLE_KEY` – Project Settings → API → `service_role` key (**geheim**, nooit `NEXT_PUBLIC_` ervoor zetten)
5. Deploy opnieuw.

Zonder deze instellingen werkt de site gewoon; op de inlogpagina staat dan dat inloggen nog niet beschikbaar is.
Lokaal (`npm run dev`) wordt zonder instellingen een tijdelijke database in het geheugen gebruikt.

| Bestand | Wat |
|---|---|
| `lib/accountRules.js` | Regels voor namen en pincodes (o.a. blokkade van makkelijke codes) |
| `lib/account.js` | Inloggen/uitloggen in de browser en records automatisch bewaren |
| `lib/merge.js` | Records van apparaat en account samenvoegen (beste score wint) |
| `lib/server/*` | Database, pincode-hashing (scrypt), sessies, beperking van inlogpogingen |
| `app/api/account/*` | De account-API |

## Mappenstructuur

| Map / bestand | Wat staat erin |
|---|---|
| `lib/site.js` | **Sitegegevens**: eigenaar, e-mail, plaats, KvK, hosting, live-URL |
| `lib/games.js` | **Lijst met alle games** (titel, categorie, kleuren, speelbaar of "Binnenkort") |
| `lib/engine/*.js` | **Eén bestand per game** (canvas/DOM-code) |
| `lib/engine/index.js` | Koppeling game-id → game-bestand (code-splitting) |
| `lib/engine/common.js` | Gedeeld resultaatscherm, delen en dagelijkse uitdaging |
| `lib/store.js` | Lokale opslag (records, gespeelde potjes, naam), dagelijkse uitdaging, recordteksten |
| `lib/content.js` | Teksten van info- en juridische pagina's (privacy, cookies, voorwaarden, FAQ…) |
| `lib/blob.js` | Gloopie-tekening (SVG) en iconen |
| `app/` | Pagina's (home, games, ranglijst, profiel, info-pagina's, sitemap, robots) |
| `components/` | React-onderdelen (header, footer, gamekaarten, uitdaging…) |
| `app/globals.css` | Alle vormgeving (Gloop-huisstijl) |

## Een nieuwe game toevoegen

1. Maak `lib/engine/<id>.js` met:
   ```js
   import {data,save} from '../store';
   import {finishCommon} from './common';
   export default function start(stage, g, restart){
     // bouw je game in `stage` (een div)
     // aan het eind: stage.innerHTML = finishCommon(g, {score}, isRecord, [regels], 'grin');
     //               document.getElementById('again').addEventListener('click', restart);
     return () => { /* opruimen: animaties stoppen, listeners weghalen */ };
   }
   ```
2. Voeg de loader toe in `lib/engine/index.js`.
3. Zet in `lib/games.js` bij de game `playable:true` en een `desc`.
4. Voeg een recordtekst toe in `fmtRec()` (`lib/store.js`) en een deeltekst in `shareText()` (`lib/engine/common.js`).

## Oude links

Links uit de vorige versie (zoals `/#/game/memo`) worden automatisch doorgestuurd naar `/games/memo`.
