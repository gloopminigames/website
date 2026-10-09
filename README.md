# Gloop 🫧

Gratis mini games voor tussendoor, gemaakt door Gloop.
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
| `lib/server/admin.js`, `app/api/beheer/*`, `app/beheer` | Beheer (zie hieronder) |

## Beheer (admin)

Op `/beheer` kan een beheerder spelers zoeken, verbergen op de ranglijst, hernoemen, hun scores wissen of het account verwijderen,
en per spel/niveau losse scores van de ranglijst halen (bijv. bij valsspelen). Een weggehaalde score komt niet terug via een ander apparaat
(staat in de kolom `players.cleared`). Elke beheeractie staat in de Vercel-logs (`[gloop beheer]`).

Er zijn twee sloten, omdat een pincode van een kinderaccount makkelijk te raden is:

1. Draai `supabase/schema.sql` opnieuw (voegt `is_admin` en `cleared` toe).
2. Supabase → **Table Editor → players** → jouw eigen rij → zet `is_admin` op **true**.
3. Vercel → **Settings → Environment Variables**: voeg `ADMIN_PASSWORD` toe (minstens 12 tekens, niet je pincode), en deploy opnieuw.
4. Log in met je account; in **Profiel** staat dan de knop **Beheer**. Vul daar het beheerwachtwoord in (2 uur geldig).

Lokaal zonder Supabase: `GLOOP_DEV_ADMIN=JouwNaam ADMIN_PASSWORD=... npm run dev`.

## Gloop als app (PWA)

Gloop is te installeren als app op telefoon, tablet en computer, zonder app store.

| Bestand | Wat |
|---|---|
| `app/manifest.ts` | Naam, kleuren, icoontjes en snelkoppelingen van de app |
| `public/icons/` | App-icoontjes (`icon-*` gewoon, `maskable-*` met extra rand voor Android) |
| `app/apple-icon.png` | Icoontje voor iPhone/iPad |
| `app/sw.js/route.ts` | Service worker: bewaart pagina's en games, zodat ze ook offline werken |
| `components/InstallApp.tsx` | Knop/banner "Installeren" (met uitleg voor iPhone/iPad en Mac) |

## Nieuwtjes ("Wat is er nieuw?")

Leuke vernieuwingen voor spelers staan in `lib/updates.js` en op de pagina `/nieuw`.
Zet een nieuw nieuwtje **bovenaan** de lijst. Met `popup: true` krijgen spelers één keer een pop-up
"Nieuw in Gloop!" (nooit tijdens het spelen; nieuwe bezoekers krijgen geen oude nieuwtjes).
Technische of kleine verbeteringen horen er niet in.

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

## Stickers en thema-albums

Alles staat in `lib/stickers.js`:

- **Nieuw thema/album:** voeg een regel toe aan `THEMES` (`id`, `name`, `emoji`, `color`).
  Seizoensthema? Geef `from`/`to` (`'MM-DD'`) en `season` (tekst). Het komt dan elk jaar terug; buiten die periode zijn de stickers niet te verdienen.
- **Beloning:** `reward` = id van een spulletje. Zet dat in `ACCESSORIES` met `theme:'<id>'` en teken het in `lib/blob.js` (`ACC`),
  en voeg het id toe aan `ACC_IDS` in `lib/accountRules.js`.
- **Stickers:** een lijst zoals `HALLOWEEN`, met `test(e)`. `e` is het potje dat net klaar is: `{game, level, r, challenge}`
  (`r` is het resultaat van de game, bijv. `r.score`, `r.planets`). `secret:true` verbergt de hint tot je hem hebt.
  Aantal potjes in een seizoen: `seasonPlays('<thema-id>')`.
- Zet de nieuwe stickers in `STICKERS` met `theme:'<id>'`. Een id nooit meer veranderen (dan raken spelers hun sticker kwijt).

## Gloopmunten en de Gloop-winkel

- `lib/shop.js`: alles wat te koop is (`SHOP`: kleur, gezicht of spulletje met een prijs) en hoeveel munten een potje oplevert (`coinsFor`).
- In de spelersdata: `coins` = totaal ooit verdiend, `owned` = gekochte ids. Saldo = `coins` min de prijzen; de server bewaart nooit meer aankopen dan je kunt betalen,
  en een Gloop mag alleen dingen dragen die echt gekocht zijn (`allowedAvatar` in `lib/server/auth.js`).
- Nieuw gezicht of spulletje? Teken het in `lib/blob.js` (`FACES`/`MOUTH`/`ACC`). Een id nooit meer veranderen.
- Munten zijn nooit met echt geld te koop.

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


Zet bij een nieuwe game in `lib/games.js` ook `added:'JJJJ-MM-DD'` (de datum van vandaag). Dan krijgt hij 30 dagen lang een "Nieuw!"-sticker, maar alleen voor spelers die hem nog niet hebben gespeeld.

## Oude links

Links uit de vorige versie (zoals `/#/game/memo`) worden automatisch doorgestuurd naar `/games/memo`.
