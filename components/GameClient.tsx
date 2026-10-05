'use client';
import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import Html from './Html';
import { blob, ICON } from '@/lib/blob';
import { gameById } from '@/lib/games';
import { data, save, statsHtml } from '@/lib/store';
import { LOADERS } from '@/lib/engine';
import { shareClick } from '@/lib/engine/common';

export default function GameClient({ id }: { id: string }) {
  const g = gameById(id);
  const stageRef = useRef<HTMLDivElement>(null);
  const statsRef = useRef<HTMLDivElement>(null);
  const [run, setRun] = useState(0);

  useEffect(() => {
    document.addEventListener('click', shareClick);
    return () => document.removeEventListener('click', shareClick);
  }, []);

  useEffect(() => {
    if (!g || !stageRef.current) return;
    data.lastGame = g.id; save();
    if (statsRef.current) statsRef.current.innerHTML = statsHtml(g.id);
    let cleanup: (() => void) | undefined;
    let cancelled = false;
    const stage = stageRef.current;
    stage.innerHTML = '<p class="stapel-help">Laden…</p>';
    LOADERS[g.id]().then((mod: any) => {
      if (cancelled) return;
      window.scrollTo(0, 0);
      cleanup = mod.default(stage, g, () => setRun((r) => r + 1));
    });
    return () => { cancelled = true; if (cleanup) cleanup(); };
  }, [g, run]);

  if (!g) return null;
  return (
    <section className="game-page">
      <Link className="back" href="/games"><Html html={ICON.back} /> Alle games</Link>
      <div className="game-head">
        <div className="game-title"><Html html={blob(g.blob, g.face, 'mini-blob')} /><div><h1>{g.title}</h1><p>{g.desc}</p></div></div>
        <div className="stats" id="stats" ref={statsRef} />
      </div>
      <div id="stage" ref={stageRef} />
    </section>
  );
}
