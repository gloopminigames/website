'use client';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import Html from './Html';
import { blob } from '@/lib/blob';
import { PLAYABLE } from '@/lib/games';
import { fmtScore } from '@/lib/store';
import { useAccount } from '@/lib/useAccount';
import { parseAvatar } from '@/lib/accountRules';

type Row = { rank: number; name: string; avatar?: string; score: number; extra: number | null; me?: boolean };
type Board = { top: Row[]; total: number; me: { rank: number; score: number; extra: number | null } | null };
const MEDAL: Record<number, string> = { 1: '🥇', 2: '🥈', 3: '🥉' };

// Wereldranglijst: per spel de 10 beste spelers met een account.
export default function WorldBoard() {
  const acc = useAccount();
  const [game, setGame] = useState(PLAYABLE[0].id);
  const [board, setBoard] = useState<Board | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    if (acc.available === false) return;
    let stop = false;
    setBoard(null); setError('');
    fetch('/api/ranglijst?game=' + game, { cache: 'no-store' })
      .then(async (r) => { const j = await r.json(); if (!r.ok) throw new Error(j.error); return j; })
      .then((j) => { if (!stop) setBoard(j); })
      .catch(() => { if (!stop) setError('De ranglijst kon niet worden geladen. Probeer het later nog eens.'); });
    return () => { stop = true; };
  }, [game, acc.user, acc.available]);

  const g = PLAYABLE.find((x) => x.id === game)!;
  if (acc.available === false) return null;
  return (
    <section className="world" aria-labelledby="worldTitle">
      <h2 id="worldTitle">Wereldranglijst</h2>
      <p className="muted">Wie is de beste? Hier staan de 10 beste spelers per game. Alleen spelers met een account komen op de wereldranglijst.</p>
      <div className="chips" role="group" aria-label="Kies een game">
        {PLAYABLE.map((x) => (
          <button key={x.id} type="button" className="chip" aria-pressed={x.id === game} onClick={() => setGame(x.id)}>{x.title}</button>
        ))}
      </div>
      <div className="world-card">
        <div className="world-head" style={{ background: g.bg }}>
          <Html html={blob(g.blob, g.face, 'world-blob', true)} />
          <div><h3>{g.title}</h3>{board && <span>{board.total} {board.total === 1 ? 'speler' : 'spelers'}</span>}</div>
        </div>
        {error && <p className="world-empty">{error}</p>}
        {!error && !board && <p className="world-empty">Laden…</p>}
        {board && !board.top.length && <p className="world-empty">Nog niemand op de ranglijst. Word jij de eerste?</p>}
        {board && board.top.length > 0 && (
          <ol className="world-list">
            {board.top.map((r, i) => (
              <li key={i} className={r.me ? 'me' : ''}>
                <span className="pos" aria-label={`Plek ${r.rank}`}>{MEDAL[r.rank] || r.rank}</span>
                <span className="who"><Html html={blob(parseAvatar(r.avatar).color, parseAvatar(r.avatar).face, 'row-blob')} /><span>{r.name}{r.me && <small> (jij)</small>}</span></span>
                <span className="val">{fmtScore(game, r.score, r.extra)}</span>
              </li>
            ))}
          </ol>
        )}
        {board && board.me && !board.top.some((r) => r.me) && (
          <p className="world-me">Jij staat op plek <b>{board.me.rank}</b> met {fmtScore(game, board.me.score, board.me.extra)}.</p>
        )}
        <div className="world-foot">
          {!acc.user && <><span>Wil jij hier ook tussen staan?</span><Link className="btn btn-sun btn-sm" href="/inloggen">Maak een account</Link></>}
          {acc.user && acc.user.onBoard === false && <><span>Je staat niet op de ranglijst.</span><Link className="btn btn-plain btn-sm" href="/profiel">Aanzetten in Profiel</Link></>}
          {acc.user && acc.user.onBoard !== false && <Link className="btn btn-primary btn-sm" href={`/games/${game}`}>Speel {g.title}</Link>}
        </div>
      </div>
    </section>
  );
}
