'use client';
import Link from 'next/link';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import Html from './Html';
import GameTutorial from './GameTutorial';
import { TUTORIALS } from '@/lib/tutorials';
import { blob, ICON } from '@/lib/blob';
import { gameById } from '@/lib/games';
import { data, save, statsHtml } from '@/lib/store';
import { LOADERS } from '@/lib/engine';
import { shareClick } from '@/lib/engine/common';
import { GAME_LEVELS, LEVELS, levelInfo, recKey } from '@/lib/levels';
import { soundOn, setSound, sfx } from '@/lib/sfx';

type Ctl = { cleanup?: () => void; pause?: () => void; resume?: () => void };
type Phase = 'loading' | 'setup' | 'tutorial' | 'play';

export default function GameClient({ id }: { id: string }) {
  const g = gameById(id);
  const stageRef = useRef<HTMLDivElement>(null);
  const statsRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const ctl = useRef<Ctl | null>(null);
  const [run, setRun] = useState(0);
  const [phase, setPhase] = useState<Phase>('loading');
  const levels: string[] = (GAME_LEVELS as Record<string, string[]>)[id] || [];
  const [level, setLevel] = useState('normaal');
  const [sound, setSoundState] = useState(true);
  // Instellingen tijdens het spelen (tandwiel): het spel staat dan op pauze.
  const [paused, setPaused] = useState(false);
  const [wasActive, setWasActive] = useState(false);
  const [newLevel, setNewLevel] = useState('normaal');
  const [count, setCount] = useState(0);
  const gg = useMemo(() => (g ? { ...g, level, speed: levelInfo(level).speed, rk: recKey(g.id, level) } : null), [g, level]);
  const hasTut = Boolean((TUTORIALS as Record<string, unknown>)[id]);

  // Eerste keer deze game? Dan eerst het startscherm, daarna (eenmalig) de uitleg.
  useEffect(() => {
    if (!g) return;
    const saved = (data.levels || {})[g.id];
    if (saved && levels.includes(saved)) setLevel(saved);
    setSoundState(soundOn());
    const first = !(data.setupDone || {})[g.id] && !(data.played || {})[g.id];
    setPhase(first ? 'setup' : hasTut && !(data.tutorials || {})[g.id] ? 'tutorial' : 'play');
  }, [g]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    document.addEventListener('click', shareClick);
    return () => document.removeEventListener('click', shareClick);
  }, []);

  useEffect(() => { if (gg && statsRef.current) statsRef.current.innerHTML = statsHtml(gg.id, gg.rk); }, [gg, phase]);

  // Het spel zelf starten.
  useEffect(() => {
    if (!gg || phase !== 'play' || !stageRef.current) return;
    data.lastGame = gg.id; save();
    let cancelled = false;
    const stage = stageRef.current;
    stage.innerHTML = '<p class="stapel-help">Laden…</p>';
    LOADERS[gg.id]().then((mod: any) => {
      if (cancelled) return;
      // Op een telefoon scrollen we het speelveld in beeld.
      const top = window.matchMedia('(max-width:760px)').matches ? (stage.parentElement as HTMLElement).getBoundingClientRect().top + window.scrollY - 12 : 0;
      window.scrollTo(0, top);
      const r = mod.default(stage, gg, () => setRun((x) => x + 1));
      ctl.current = typeof r === 'function' ? { cleanup: r } : r;
    }).catch(() => {
      if (cancelled) return;
      stage.innerHTML = '<div class="load-error" role="alert"><p>De game kon niet worden geladen. Controleer je internetverbinding.</p><button type="button" class="btn btn-primary" id="retry">Opnieuw proberen</button></div>';
      stage.querySelector('#retry')?.addEventListener('click', () => setRun((x) => x + 1));
    });
    return () => { cancelled = true; ctl.current?.cleanup?.(); ctl.current = null; };
  }, [gg, run, phase]);

  // Loopt er echt een potje? (niet op het keuzescherm of het resultaat)
  const active = () => { const s = stageRef.current; return Boolean(s && !s.querySelector('.result, .blast-modes, .load-error')); };

  const openSettings = useCallback(() => {
    if (paused) return;
    const a = phase === 'play' && active();
    if (a) ctl.current?.pause?.();
    setWasActive(a); setNewLevel(level); setPaused(true); sfx('click');
  }, [paused, phase, level]);

  // Weg uit de app of ander tabblad: meteen pauze.
  useEffect(() => {
    const onVis = () => { if (document.visibilityState === 'hidden' && phase === 'play' && !paused && active()) openSettings(); };
    document.addEventListener('visibilitychange', onVis);
    return () => document.removeEventListener('visibilitychange', onVis);
  }, [phase, paused, openSettings]);

  // Tijdens pauze en aftellen gaan toetsen niet naar het spel (alleen naar het instellingenvenster).
  useEffect(() => {
    if (!paused && !count) return;
    const block = (e: KeyboardEvent) => {
      if (panelRef.current && panelRef.current.contains(e.target as Node)) return;
      e.stopImmediatePropagation(); e.preventDefault();
    };
    window.addEventListener('keydown', block, true);
    return () => window.removeEventListener('keydown', block, true);
  }, [paused, count]);

  // Focus op de titel (niet op de knop), zodat de spatiebalk van het spel niet per ongeluk 'Verder spelen' indrukt.
  useEffect(() => { if (paused) panelRef.current?.querySelector<HTMLElement>('#pauseTitle')?.focus(); }, [paused]);

  const applyLevel = (l: string) => { if (!g) return; data.levels = { ...(data.levels || {}), [g.id]: l }; save(); setLevel(l); };
  const toggleSound = () => { const on = !sound; setSound(on); setSoundState(on); };

  // Verder spelen: eerst 3-2-1, zodat korte pauzes geen voordeel geven.
  const resume = () => {
    setPaused(false);
    if (newLevel !== level) { applyLevel(newLevel); return; } // ander niveau = nieuw potje
    if (!wasActive) return;
    let n = 3; setCount(n); sfx('tap');
    const t = setInterval(() => {
      n -= 1;
      if (n > 0) { setCount(n); sfx('tap'); }
      else { clearInterval(t); setCount(0); sfx('good'); ctl.current?.resume?.(); }
    }, 650);
  };
  const restartGame = () => { setPaused(false); if (newLevel !== level) applyLevel(newLevel); else setRun((x) => x + 1); };
  const showTutorial = () => { setPaused(false); setPhase('tutorial'); };

  if (!g) return null;
  const lvl = levelInfo(level);
  const levelButtons = (value: string, onPick: (l: string) => void) => (
    <div className="levels" role="radiogroup" aria-label="Kies hoe moeilijk">
      {LEVELS.filter((l) => levels.includes(l.id)).map((l) => (
        <button key={l.id} type="button" role="radio" aria-checked={l.id === value} className="level-btn" onClick={() => { sfx('click'); onPick(l.id); }}>
          <span className="lv-icon" aria-hidden="true">{l.icon}</span>{l.label}
        </button>
      ))}
    </div>
  );
  const soundButton = (
    <button type="button" className="set-toggle" aria-pressed={sound} onClick={toggleSound}>
      <span aria-hidden="true">{sound ? '🔊' : '🔇'}</span> Geluid {sound ? 'aan' : 'uit'}
    </button>
  );

  return (
    <section className="game-page">
      <Link className="back" href="/games"><Html html={ICON.back} /> Alle games</Link>
      <div className="game-title2"><Html html={blob(g.blob, g.face, 'mini-blob')} /><h1>{g.title}</h1></div>

      {phase === 'setup' && (
        <div className="game-setup">
          <Html html={blob(g.blob, g.face, 'setup-blob')} />
          <p className="setup-desc">{g.desc}</p>
          {levels.length > 1 && (<><p className="setup-q">Hoe moeilijk?</p>{levelButtons(level, applyLevel)}</>)}
          <div className="setup-row">{soundButton}</div>
          <button type="button" className="btn btn-primary setup-go" onClick={() => {
            data.setupDone = { ...(data.setupDone || {}), [g.id]: true }; save(); sfx('good');
            setPhase(hasTut && !(data.tutorials || {})[g.id] ? 'tutorial' : 'play');
          }}>Start <span aria-hidden="true">▶</span></button>
        </div>
      )}

      {phase === 'tutorial' && <GameTutorial id={g.id} color={g.blob} level={level} onDone={() => setPhase('play')} />}

      {phase === 'play' && (
        <div className="game-frame">
          <div className="game-bar">
            {levels.length > 1 && <span className="gb-level" title={lvl.label}><span aria-hidden="true">{lvl.icon}</span> <span className="gb-lv-name" aria-hidden="true">{lvl.label}</span><span className="sr-only">{lvl.label}</span></span>}
            <div className="gb-stats" id="stats" ref={statsRef} />
            <button type="button" className="gear-btn" onClick={openSettings} aria-label="Instellingen en pauze" title="Instellingen en pauze">
              <svg viewBox="0 0 24 24" width="24" height="24" aria-hidden="true"><path fill="currentColor" d="M19.4 13a7.5 7.5 0 0 0 0-2l2-1.6-2-3.4-2.4 1a7.6 7.6 0 0 0-1.7-1L15 3.5h-4l-.4 2.5a7.6 7.6 0 0 0-1.7 1l-2.4-1-2 3.4L6.6 11a7.5 7.5 0 0 0 0 2l-2 1.6 2 3.4 2.4-1c.5.4 1.1.7 1.7 1l.4 2.5h4l.4-2.5c.6-.3 1.2-.6 1.7-1l2.4 1 2-3.4zM13 15.5a3.5 3.5 0 1 1 0-7 3.5 3.5 0 0 1 0 7z" transform="translate(-1 0)"/></svg>
            </button>
          </div>
          <div id="stage" ref={stageRef} />
          {paused && (
            <div className="pause-cover" role="dialog" aria-modal="true" aria-labelledby="pauseTitle" ref={panelRef}>
              <div className="pause-panel">
                <h2 id="pauseTitle" tabIndex={-1}>{wasActive ? <><span aria-hidden="true">⏸️</span> Pauze</> : <><span aria-hidden="true">⚙️</span> Instellingen</>}</h2>
                {levels.length > 1 && (<><p className="setup-q">Hoe moeilijk?</p>{levelButtons(newLevel, setNewLevel)}
                  {newLevel !== level && <p className="muted small">Met een ander niveau begin je een nieuw potje.</p>}</>)}
                <div className="setup-row">
                  {soundButton}
                  {hasTut && <button type="button" className="set-toggle" onClick={showTutorial}><span aria-hidden="true">👆</span> Uitleg bekijken</button>}
                </div>
                <div className="pause-btns">
                  <button type="button" className="btn btn-primary set-continue" onClick={resume}>
                    {newLevel !== level ? 'Start nieuw potje ▶' : wasActive ? 'Verder spelen ▶' : 'Klaar'}
                  </button>
                  {wasActive && newLevel === level && <button type="button" className="btn btn-plain" onClick={restartGame}>Opnieuw beginnen</button>}
                </div>
              </div>
            </div>
          )}
          {count > 0 && <div className="count-cover" aria-live="assertive"><span key={count}>{count}</span></div>}
        </div>
      )}
    </section>
  );
}
