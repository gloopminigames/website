'use client';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Html from './Html';
import { blob, ICON } from '@/lib/blob';
import { PLAYABLE } from '@/lib/games';
import { data, fmtRec, challenge, today } from '@/lib/store';
import { useAccount } from '@/lib/useAccount';

type Game = (typeof PLAYABLE)[number];
type State = { returning: boolean; name: string; last?: Game; ch: { text: string; game: string; done: boolean } };

// Bovenkant van de homepagina.
// Nieuwe bezoeker: een kort welkom met één grote knop. Terugkerende speler: meteen 'Verder spelen' en de uitdaging van vandaag.
export function useHomeState() {
  const acc = useAccount();
  const [st, setSt] = useState<State | null>(null);
  useEffect(() => {
    const played = Object.values((data.played || {}) as Record<string, number>).reduce((a, b) => a + b, 0);
    const c = challenge();
    setSt({ returning: played > 0, name: data.name || '', last: PLAYABLE.find((g) => g.id === data.lastGame), ch: { text: c.text, game: c.game, done: data.challengeDone === today() } });
  }, [acc.user]);
  return st;
}

export default function HomeTop() {
  const router = useRouter();
  const st = useHomeState();
  const random = () => router.push('/games/' + PLAYABLE[Math.floor(Math.random() * PLAYABLE.length)].id);

  if (st?.returning) {
    const g = st.last;
    return (
      <section className="home-hi" aria-labelledby="hiTitle">
        <h1 id="hiTitle">Hoi{st.name ? ` ${st.name}` : ''}! <span aria-hidden="true">👋</span></h1>
        <div className="today-row">
          {g ? (
            <Link className="continue today-card" href={`/games/${g.id}`}>
              <span className="cont-art" style={{ background: g.bg }}><Html html={blob(g.blob, g.face)} /></span>
              <span className="cont-txt"><small>Verder spelen</small><b>{g.title}</b><span>{fmtRec(g.id)}</span></span>
              <span className="play" aria-hidden="true"><Html html={ICON.play} /></span>
            </Link>
          ) : (
            <button type="button" className="continue today-card" onClick={random}>
              <span className="cont-art" style={{ background: '#8B6CFF' }}><Html html={blob('#6BE38A', 'grin')} /></span>
              <span className="cont-txt"><small>Verrassing</small><b>Willekeurige game</b><span>Laat Gloopie kiezen!</span></span>
              <span className="play" aria-hidden="true"><Html html={ICON.play} /></span>
            </button>
          )}
          <div className={'today-ch' + (st.ch.done ? ' done' : '')}>
            <div className="tc-txt"><small><span aria-hidden="true">🎯</span> Uitdaging van vandaag</small><p>{st.ch.text}</p></div>
            {st.ch.done
              ? <span className="tc-done"><Html html={ICON.check} /> Gehaald!</span>
              : <Link className="btn btn-sun btn-sm" href={`/games/${st.ch.game}`}>Doe mee</Link>}
          </div>
        </div>
      </section>
    );
  }
  // Nieuwe bezoeker (en de versie die zoekmachines zien)
  return (
    <section className="hero hero-compact">
      <div className="hero-text">
        <h1>Even een potje?</h1>
        <p>Korte spelletjes voor tussendoor. Kies er een en je speelt meteen!</p>
        <div className="hero-btns">
          <button type="button" className="btn btn-primary" onClick={random}><Html html={ICON.play} /> Speel meteen</button>
        </div>
        <ul className="badges">
          {['Gratis', 'Geen download', 'Geen account nodig'].map((t) => <li key={t}><Html html={ICON.check} />{t}</li>)}
        </ul>
      </div>
      <div className="hero-art" aria-hidden="true">
        <span className="bubble b1" /><span className="bubble b2" /><span className="bubble b3" />
        <Html html={blob('#8B6CFF', 'grin', 'hero-blob')} />
      </div>
    </section>
  );
}
