'use client';
import Link from 'next/link';
import { useEffect, useMemo, useRef, useState } from 'react';
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

export default function GameClient({ id }: { id: string }) {
  const g = gameById(id);
  const stageRef = useRef<HTMLDivElement>(null);
  const statsRef = useRef<HTMLDivElement>(null);
  const [run, setRun] = useState(0);
  // null = nog niet bekend (eerst localStorage lezen), true = uitleg tonen
  const [tutorial, setTutorial] = useState<boolean | null>(null);
  const levels: string[] = (GAME_LEVELS as Record<string, string[]>)[id] || [];
  const [level, setLevel] = useState('normaal');
  const [sound, setSoundState] = useState(true);
  // Het spel krijgt het gekozen niveau mee: snelheid en de sleutel voor het record.
  const gg = useMemo(() => (g ? { ...g, level, speed: levelInfo(level).speed, rk: recKey(g.id, level) } : null), [g, level]);

  useEffect(() => {
    if (!g) return;
    const saved = (data.levels || {})[g.id];
    if (saved && levels.includes(saved)) setLevel(saved);
    setSoundState(soundOn());
    setTutorial(Boolean((TUTORIALS as Record<string, unknown>)[g.id]) && !(data.tutorials || {})[g.id]);
  }, [g]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    document.addEventListener('click', shareClick);
    return () => document.removeEventListener('click', shareClick);
  }, []);

  useEffect(() => { if (gg && statsRef.current) statsRef.current.innerHTML = statsHtml(gg.id, gg.rk); }, [gg]);

  useEffect(() => {
    if (!gg || !stageRef.current || tutorial !== false) return;
    data.lastGame = gg.id; save();
    let cleanup: (() => void) | undefined;
    let cancelled = false;
    const stage = stageRef.current;
    stage.innerHTML = '<p class="stapel-help">Laden…</p>';
    LOADERS[gg.id]().then((mod: any) => {
      if (cancelled) return;
      // Op een telefoon scrollen we het speelveld in beeld, anders valt het half onder de vouw.
      // (met niveauknoppen erboven, zodat je die ook ziet)
      const anchor = (document.querySelector('.levels') as HTMLElement) || stage;
      const top = window.matchMedia('(max-width:760px)').matches ? anchor.getBoundingClientRect().top + window.scrollY - 12 : 0;
      window.scrollTo(0, top);
      cleanup = mod.default(stage, gg, () => setRun((r) => r + 1));
    }).catch(() => {
      if (cancelled) return;
      stage.innerHTML = '<div class="load-error" role="alert"><p>De game kon niet worden geladen. Controleer je internetverbinding.</p><button type="button" class="btn btn-primary" id="retry">Opnieuw proberen</button></div>';
      stage.querySelector('#retry')?.addEventListener('click', () => setRun((r) => r + 1));
    });
    return () => { cancelled = true; if (cleanup) cleanup(); };
  }, [gg, run, tutorial]);

  const pickLevel = (l: string) => {
    if (!g || l === level) return;
    data.levels = { ...(data.levels || {}), [g.id]: l }; save();
    sfx('click'); setLevel(l);
  };
  const toggleSound = () => { const on = !sound; setSound(on); setSoundState(on); };

  if (!g) return null;
  return (
    <section className="game-page">
      <Link className="back" href="/games"><Html html={ICON.back} /> Alle games</Link>
      <div className="game-head">
        <div className="game-title"><Html html={blob(g.blob, g.face, 'mini-blob')} /><div><h1>{g.title}</h1><p>{g.desc}</p></div></div>
        <div className="game-side">
          <div className="stats" id="stats" ref={statsRef} />
          <button type="button" className="help-btn sound-btn" onClick={toggleSound} aria-pressed={sound} aria-label={sound ? 'Geluid uitzetten' : 'Geluid aanzetten'} title={sound ? 'Geluid uit' : 'Geluid aan'}>{sound ? '🔊' : '🔇'}</button>
          {tutorial === false && <button type="button" className="help-btn" onClick={() => setTutorial(true)} aria-label="Uitleg bekijken" title="Uitleg bekijken">?</button>}
        </div>
      </div>
      {tutorial === false && levels.length > 1 && (
        <div className="levels" role="radiogroup" aria-label="Kies hoe snel">
          {LEVELS.filter((l) => levels.includes(l.id)).map((l) => (
            <button key={l.id} type="button" role="radio" aria-checked={l.id === level} className="level-btn" onClick={() => pickLevel(l.id)}>
              <span className="lv-icon" aria-hidden="true">{l.icon}</span>{l.label}
            </button>
          ))}
        </div>
      )}
      {tutorial && <GameTutorial id={g.id} color={g.blob} onDone={() => setTutorial(false)} />}
      <div id="stage" ref={stageRef} hidden={tutorial !== false} />
    </section>
  );
}
