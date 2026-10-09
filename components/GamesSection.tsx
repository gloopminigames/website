'use client';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import GameCard from './GameCard';
import Html from './Html';
import { GAMES, CATS, isNewFor } from '@/lib/games';
import { data } from '@/lib/store';
import { blob, ICON } from '@/lib/blob';

// soonLimit: toon maar een paar Binnenkort-kaarten, met een link naar de rest.
// home: compacte versie zonder zoekbalk; nieuwe games eerst en 'Binnenkort' als één regel.
export default function GamesSection({ title, soonLimit, home }: { title: string; soonLimit?: number; home?: boolean }) {
  const [cat, setCat] = useState('Alles');
  const [query, setQuery] = useState('');
  // Pas na het laden weten we wat deze speler al heeft gespeeld (staat in de browser).
  const [played, setPlayed] = useState<Record<string, number> | null>(null);
  useEffect(() => { setPlayed({ ...(data.played || {}) }); }, []);
  const q = query.trim().toLowerCase();
  const list = GAMES.filter((g) => (cat === 'Alles' || g.cat === cat) && (!q || g.title.toLowerCase().includes(q) || g.cat.toLowerCase().includes(q)));
  let playable = list.filter((g) => g.playable);
  if (home && played) playable = [...playable].sort((a, b) => Number(isNewFor(b, played)) - Number(isNewFor(a, played)));
  const soon = list.filter((g) => !g.playable);
  const soonShown = soonLimit ? soon.slice(0, soonLimit) : soon;
  return (
    <section className="section" aria-labelledby="gamesTitle">
      <div className="section-head">
        <h2 id="gamesTitle">{title}</h2>
        {!home && <div className="search">
          <Html html={ICON.search} />
          <label htmlFor="q" className="sr-only">Zoek een game</label>
          <input id="q" type="search" placeholder="Zoek een game" value={query} onChange={(e) => setQuery(e.target.value)} autoComplete="off" />
        </div>}
      </div>
      <div className="chips" role="group" aria-label="Categorieën">
        {CATS.map((c) => (
          <button key={c} type="button" className="chip" aria-pressed={c === cat} onClick={() => setCat(c)}>{c}</button>
        ))}
      </div>
      {!list.length && (
        <div className="grid"><div className="empty"><Html html={blob('#8B6CFF', 'sad')} />Geen games gevonden. Probeer een andere zoekterm.</div></div>
      )}
      {playable.length > 0 && (
        <>
          {!home && <div className="sub-head"><h3>Nu speelbaar</h3><span className="count">{playable.length}</span></div>}
          <div className="grid">{playable.map((g) => <GameCard key={g.id} g={g} isNew={played !== null && isNewFor(g, played)} />)}</div>
        </>
      )}
      {home && soon.length > 0 && (
        <p className="soon-line"><Link href="/games#binnenkort"><span aria-hidden="true">🔜</span> Er komen nog {soon.length} games aan. Bekijk ze!</Link></p>
      )}
      {!home && soon.length > 0 && (
        <>
          <div className="sub-head soon-head" id="binnenkort"><h3>Binnenkort</h3><span className="count">{soon.length}</span><p>Aan deze games wordt gewerkt.</p></div>
          <div className="grid soon-grid">{soonShown.map((g) => <GameCard key={g.id} g={g} />)}</div>
          {soonShown.length < soon.length && <p className="soon-more"><Link className="btn btn-plain btn-sm" href="/games">Bekijk alle {soon.length} games die eraan komen</Link></p>}
        </>
      )}
    </section>
  );
}
