'use client';
import Link from 'next/link';
import { useCallback, useEffect, useState } from 'react';
import Html from './Html';
import { avatarSvg } from '@/lib/avatar';
import { PLAYABLE } from '@/lib/games';
import { fmtScore } from '@/lib/store';
import { GAME_LEVELS, LEVELS, recKey, baseId } from '@/lib/levels';
import { toast } from '@/lib/toast';

type Player = { id: string; name: string; avatar: string; created: string; lastSeen: string; hidden: boolean; onBoard: boolean; admin: boolean; played: number; records: number };
type ScoreRow = { rank: number; id: string; name: string; avatar: string; score: number; extra: number | null; hidden: boolean; onBoard: boolean; updated: string };

async function api(path: string, body?: object, method = body ? 'POST' : 'GET') {
  const r = await fetch('/api/beheer' + path, { method, headers: body ? { 'Content-Type': 'application/json' } : {}, body: body ? JSON.stringify(body) : undefined, credentials: 'same-origin', cache: 'no-store' });
  let j: any = {}; try { j = await r.json(); } catch (e) {}
  if (!r.ok) throw new Error(j.error || 'Er ging iets mis.');
  return j;
}
const day = (s: string) => s ? new Date(s).toLocaleDateString('nl-NL', { day: 'numeric', month: 'short', year: 'numeric' }) : '–';
const GAME_KEYS = PLAYABLE.flatMap((g) => ((GAME_LEVELS as Record<string, string[]>)[g.id] || ['normaal']).map((l) => ({
  key: recKey(g.id, l), label: g.title + (((GAME_LEVELS as Record<string, string[]>)[g.id] || []).length > 1 ? ' – ' + (LEVELS.find((x) => x.id === l)?.label || l) : '')
})));
const fmt = (game: string, score: number, extra: number | null) => fmtScore(baseId(game), score, extra);

// Beheer: alleen voor beheerders (is_admin in Supabase + beheerwachtwoord).
export default function BeheerClient() {
  const [state, setState] = useState<string | null>(null);
  const [tab, setTab] = useState<'spelers' | 'ranglijst'>('spelers');
  const load = useCallback(() => { api('').then((j) => setState(j.state)).catch(() => setState('error')); }, []);
  useEffect(load, [load]);
  const leave = async () => { try { await api('', {}, 'DELETE'); } catch (e) {} load(); };

  return (
    <section className="page beheer">
      <h1>Beheer</h1>
      {state === null && <p className="lead">Laden…</p>}
      {state === 'error' && <p className="lead">Het beheer kon niet worden geladen.</p>}
      {state === 'login' && <p className="lead">Log eerst in met je eigen account. <Link href="/inloggen">Naar inloggen</Link></p>}
      {state === 'forbidden' && <p className="lead">Dit account heeft geen beheerrechten.</p>}
      {state === 'setup' && <p className="lead">Bijna klaar: zet in Vercel de omgevingsvariabele <code>ADMIN_PASSWORD</code> (minstens 12 tekens) en deploy opnieuw.</p>}
      {state === 'password' && <PasswordForm onDone={load} />}
      {state === 'ok' && (
        <>
          <div className="bh-top">
            <div className="chips" role="tablist" aria-label="Onderdeel">
              <button type="button" role="tab" className="chip" aria-selected={tab === 'spelers'} onClick={() => setTab('spelers')}>👥 Spelers</button>
              <button type="button" role="tab" className="chip" aria-selected={tab === 'ranglijst'} onClick={() => setTab('ranglijst')}>🏆 Ranglijst</button>
            </div>
            <button type="button" className="btn btn-plain btn-sm" onClick={leave}>🔒 Beheer sluiten</button>
          </div>
          {tab === 'spelers' ? <Players /> : <Scores />}
        </>
      )}
    </section>
  );
}

function PasswordForm({ onDone }: { onDone: () => void }) {
  const [pw, setPw] = useState('');
  const [err, setErr] = useState('');
  const [busy, setBusy] = useState(false);
  const submit = async (e: React.FormEvent) => {
    e.preventDefault(); setBusy(true); setErr('');
    try { await api('/login', { password: pw }); onDone(); } catch (x: any) { setErr(x.message); } finally { setBusy(false); }
  };
  return (
    <form className="bh-login" onSubmit={submit}>
      <p className="lead">Vul het beheerwachtwoord in. Je blijft 2 uur in het beheer.</p>
      <label htmlFor="bhpw">Beheerwachtwoord</label>
      <div className="row">
        <input id="bhpw" className="field" type="password" autoComplete="current-password" value={pw} onChange={(e) => setPw(e.target.value)} required />
        <button type="submit" className="btn btn-primary" disabled={busy}>Openen</button>
      </div>
      {err && <p className="bh-err" role="alert">{err}</p>}
    </form>
  );
}

function Players() {
  const [q, setQ] = useState('');
  const [list, setList] = useState<Player[] | null>(null);
  const [armed, setArmed] = useState('');
  const [renaming, setRenaming] = useState<{ id: string; name: string } | null>(null);
  const search = useCallback(async (term: string) => {
    try { setList((await api('/spelers?q=' + encodeURIComponent(term))).players); } catch (e: any) { toast(e.message); }
  }, []);
  useEffect(() => { const t = setTimeout(() => search(q), 250); return () => clearTimeout(t); }, [q, search]);
  useEffect(() => { if (!armed) return; const t = setTimeout(() => setArmed(''), 4000); return () => clearTimeout(t); }, [armed]);
  const act = async (p: Player, action: string, extra: object = {}, msg = 'Gelukt') => {
    try { await api('/spelers', { id: p.id, action, ...extra }); toast(msg); setArmed(''); setRenaming(null); search(q); } catch (e: any) { toast(e.message); }
  };
  // Gevaarlijke acties eerst "armen": tweede klik voert uit.
  const confirm = (p: Player, action: string, msg: string) => { const k = p.id + action; if (armed !== k) { setArmed(k); return; } act(p, action, {}, msg); };
  return (
    <div>
      <label htmlFor="bhq" className="sr-only">Zoek een speler</label>
      <input id="bhq" className="field bh-search" type="search" placeholder="🔍 Zoek op naam…" value={q} onChange={(e) => setQ(e.target.value)} autoComplete="off" />
      <p className="muted">{list ? (q ? `${list.length} gevonden` : `Laatst actieve spelers (${list.length})`) : 'Laden…'}</p>
      <ul className="bh-list">
        {list?.map((p) => (
          <li key={p.id} className={'bh-item' + (p.hidden ? ' is-hidden' : '')}>
            <Html html={avatarSvg(p.avatar, 'bh-blob')} />
            <div className="bh-info">
              {renaming?.id === p.id ? (
                <form className="row" onSubmit={(e) => { e.preventDefault(); act(p, 'rename', { name: renaming.name }, 'Naam aangepast'); }}>
                  <label htmlFor={'rn' + p.id} className="sr-only">Nieuwe naam</label>
                  <input id={'rn' + p.id} className="field" maxLength={16} value={renaming.name} onChange={(e) => setRenaming({ id: p.id, name: e.target.value })} autoFocus />
                  <button type="submit" className="btn btn-primary btn-sm">Opslaan</button>
                  <button type="button" className="btn btn-plain btn-sm" onClick={() => setRenaming(null)}>Annuleer</button>
                </form>
              ) : (
                <b className="bh-name">{p.name}{p.admin && <span className="bh-tag">beheerder</span>}{p.hidden && <span className="bh-tag warn">verborgen</span>}{!p.onBoard && <span className="bh-tag">niet op ranglijst</span>}</b>
              )}
              <span className="muted bh-meta">Sinds {day(p.created)} · laatst {day(p.lastSeen)} · {p.played} potjes · {p.records} records</span>
            </div>
            <div className="bh-actions">
              <button type="button" className="btn btn-plain btn-sm" onClick={() => setRenaming({ id: p.id, name: p.name })}>✏️ Naam</button>
              {p.hidden
                ? <button type="button" className="btn btn-plain btn-sm" onClick={() => act(p, 'unhide', {}, 'Weer zichtbaar op de ranglijst')}>👁️ Tonen</button>
                : !p.admin && <button type="button" className="btn btn-plain btn-sm" onClick={() => act(p, 'hide', {}, 'Verborgen op de ranglijst')}>🙈 Verbergen</button>}
              <button type="button" className="btn btn-plain btn-sm" onClick={() => confirm(p, 'reset', 'Scores gewist')}>{armed === p.id + 'reset' ? 'Zeker? Klik nog eens' : '🧹 Scores wissen'}</button>
              {!p.admin && <button type="button" className="btn danger btn-sm" onClick={() => confirm(p, 'delete', 'Account verwijderd')}>{armed === p.id + 'delete' ? 'Zeker? Klik nog eens' : '🗑️ Verwijderen'}</button>}
            </div>
          </li>
        ))}
      </ul>
      {list && !list.length && <p className="muted">Geen spelers gevonden.</p>}
    </div>
  );
}

function Scores() {
  const [game, setGame] = useState(GAME_KEYS[0].key);
  const [rows, setRows] = useState<ScoreRow[] | null>(null);
  const [armed, setArmed] = useState('');
  const load = useCallback(async () => {
    setRows(null);
    try { setRows((await api('/scores?game=' + encodeURIComponent(game))).rows); } catch (e: any) { toast(e.message); setRows([]); }
  }, [game]);
  useEffect(() => { load(); }, [load]);
  useEffect(() => { if (!armed) return; const t = setTimeout(() => setArmed(''), 4000); return () => clearTimeout(t); }, [armed]);
  const remove = async (r: ScoreRow) => {
    if (armed !== r.id) { setArmed(r.id); return; }
    try { await api('/scores', { id: r.id, game }); toast('Score weggehaald'); setArmed(''); load(); } catch (e: any) { toast(e.message); }
  };
  return (
    <div>
      <label htmlFor="bhgame" className="bh-label">Spel</label>
      <select id="bhgame" className="field bh-select" value={game} onChange={(e) => setGame(e.target.value)}>
        {GAME_KEYS.map((g) => <option key={g.key} value={g.key}>{g.label}</option>)}
      </select>
      <p className="muted">Top 50, ook spelers die verborgen zijn of niet op de ranglijst willen. Een weggehaalde score komt niet terug, ook niet vanaf een ander apparaat.</p>
      {!rows && <p className="muted">Laden…</p>}
      {rows && !rows.length && <p className="muted">Nog geen scores voor dit spel.</p>}
      <ol className="bh-list">
        {rows?.map((r) => (
          <li key={r.id} className={'bh-item' + (r.hidden || !r.onBoard ? ' is-hidden' : '')}>
            <span className="bh-rank">{r.rank}</span>
            <Html html={avatarSvg(r.avatar, 'bh-blob')} />
            <div className="bh-info">
              <b className="bh-name">{r.name}{r.hidden && <span className="bh-tag warn">verborgen</span>}{!r.onBoard && <span className="bh-tag">niet op ranglijst</span>}</b>
              <span className="muted bh-meta">{fmt(game, r.score, r.extra)} · {day(r.updated)}</span>
            </div>
            <div className="bh-actions">
              <button type="button" className="btn danger btn-sm" onClick={() => remove(r)}>{armed === r.id ? 'Zeker? Klik nog eens' : '🗑️ Weghalen'}</button>
            </div>
          </li>
        ))}
      </ol>
    </div>
  );
}
