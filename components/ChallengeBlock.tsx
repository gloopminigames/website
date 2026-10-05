'use client';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import Html from './Html';
import { blob, ICON } from '@/lib/blob';
import { challenge, data, today } from '@/lib/store';

export default function ChallengeBlock() {
  const [state, setState] = useState<{ text: string; game: string; done: boolean } | null>(null);
  useEffect(() => { const c = challenge(); setState({ text: c.text, game: c.game, done: data.challengeDone === today() }); }, []);
  return (
    <section className="challenge" aria-labelledby="chTitle">
      <div><h2 id="chTitle">Dagelijkse uitdaging</h2><p>{state ? state.text : 'Elke dag een nieuwe uitdaging.'}</p></div>
      <div className="challenge-side">
        {state && (state.done
          ? <span className="done"><Html html={ICON.check} /> Gehaald vandaag!</span>
          : <Link className="btn btn-sun" href={`/games/${state.game}`}>Doe mee</Link>)}
        <Html html={blob('#FF7AC6', state?.done ? 'grin' : 'happy', 'crown-blob', true)} />
      </div>
    </section>
  );
}
