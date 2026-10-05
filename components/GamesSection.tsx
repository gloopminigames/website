'use client';
import { useState } from 'react';
import GameCard from './GameCard';
import Html from './Html';
import { GAMES, CATS } from '@/lib/games';
import { blob, ICON } from '@/lib/blob';

export default function GamesSection({ title }: { title: string }) {
  const [cat, setCat] = useState('Alles');
  const [query, setQuery] = useState('');
  const q = query.trim().toLowerCase();
  const list = GAMES.filter((g) => (cat === 'Alles' || g.cat === cat) && (!q || g.title.toLowerCase().includes(q) || g.cat.toLowerCase().includes(q)));
  const playable = list.filter((g) => g.playable);
  const soon = list.filter((g) => !g.playable);
  return (
    <section className="section" aria-labelledby="gamesTitle">
      <div className="section-head">
        <h2 id="gamesTitle">{title}</h2>
        <div className="search">
          <Html html={ICON.search} />
          <label htmlFor="q" className="sr-only">Zoek een game</label>
          <input id="q" type="search" placeholder="Zoek een game" value={query} onChange={(e) => setQuery(e.target.value)} autoComplete="off" />
        </div>
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
          <div className="sub-head"><h3>Nu speelbaar</h3><span className="count">{playable.length}</span></div>
          <div className="grid">{playable.map((g) => <GameCard key={g.id} g={g} />)}</div>
        </>
      )}
      {soon.length > 0 && (
        <>
          <div className="sub-head soon-head"><h3>Binnenkort</h3><span className="count">{soon.length}</span><p>Aan deze games wordt gewerkt.</p></div>
          <div className="grid soon-grid">{soon.map((g) => <GameCard key={g.id} g={g} />)}</div>
        </>
      )}
    </section>
  );
}
