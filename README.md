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
   voor deellinks, de sitemap en Google.

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
