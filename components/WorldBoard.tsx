'use client';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import Html from './Html';
import { avatarSvg } from '@/lib/avatar';
import { blob } from '@/lib/blob';
import { PLAYABLE } from '@/lib/games';
import { fmtScore } from '@/lib/store';
import { useAccount } from '@/lib/useAccount';
import { GAME_LEVELS, LEVELS, recKey } from '@/lib/levels';

type Row = { rank: number; name: string; avatar?: string; score: number; extra: number | null; me?: boolean };
type Board = { top: Row[]; total: number; me: { rank: number; score: number; extra: number | null } | null };
const MEDAL: Record<number, string> = { 1: '🥇', 2: '🥈', 3: '🥉' };

// Gloop Kampioenen (wereldranglijst): per spel de 10 beste spelers met een account.
export default function WorldBoard() {
  const acc = useAccount();
  const [game, setGame] = useState(PLAYABLE[0].id);
  const [level, setLevel] = useState('normaal');
  const levels: string[] = (GAME_LEVELS as Record<string, string[]>)[game] || [];
  const key = recKey(game, levels.includes(level) ? level : 'normaal');
  const [board, setBoard] = useState<Board | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    if (acc.available === false) return;
    let stop = false;
    setBoard(null); setError('');
    fetch('/api/ranglijst?game=' + encodeURIComponent(key), { cache: 'no-store' })
      .then(async (r) => { const j = await r.json(); if (!r.ok) throw new Error(j.error); return j; })
      .then((j) => { if (!stop) setBoard(j); })
      .catch(() => { if (!stop) setError('De ranglijst kon niet worden geladen. Probeer het later nog eens.'); });
    return () => { stop = true; };
  }, [key, acc.user, acc.available]);

  const g = PLAYABLE.find((x) => x.id === game)!;
  if (acc.available === false) return null;
  return (
    <section className="world" aria-labelledby="worldTitle">
      <h2 id="worldTitle"><span aria-hidden="true">🏆</span> Gloop Kampioenen</h2>
      <p className="muted">Wie is de allerbeste? Kies een spel en kijk wie bovenaan staat! Met een account kun jij er ook tussen komen.</p>
      {/* Spelkiezer als tegels met plaatje: overzichtelijk, ook met veel games en voor kinderen die nog niet lezen */}
      <div className="game-tiles" role="radiogroup" aria-label="Kies een spel">
        {PLAYABLE.map((x) => (
          <button key={x.id} type="button" role="radio" aria-checked={x.id === game} className="game-tile" onClick={() => setGame(x.id)}>
            <span className="gt-art" style={{ background: x.bg }}><Html html={blob(x.blob, x.face, 'gt-blob')} /></span>
            <span className="gt-name">{x.title}</span>
          </button>
        ))}
      </div>
      {levels.length > 1 && (
        <div className="levels levels-sm" role="radiogroup" aria-label="Niveau">
          {LEVELS.filter((l) => levels.includes(l.id)).map((l) => (
            <button key={l.id} type="button" role="radio" aria-checked={l.id === (levels.includes(level) ? level : 'normaal')} className="level-btn" onClick={() => setLevel(l.id)}>
              <span className="lv-icon" aria-hidden="true">{l.icon}</span>{l.label}
            </button>
          ))}
        </div>
      )}
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
                <span className="who"><Html html={avatarSvg(r.avatar, 'row-blob')} /><span>{r.name}{r.me && <small> (jij)</small>}</span></span>
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
