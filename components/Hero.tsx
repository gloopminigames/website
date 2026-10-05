'use client';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Html from './Html';
import { blob, ICON } from '@/lib/blob';
import { PLAYABLE } from '@/lib/games';
import { data } from '@/lib/store';

export default function Hero() {
  const router = useRouter();
  const [name, setName] = useState('');
  useEffect(() => setName(data.name || ''), []);
  const random = () => router.push('/games/' + PLAYABLE[Math.floor(Math.random() * PLAYABLE.length)].id);
  return (
    <section className="hero">
      <div className="hero-text">
        <h1>Even een potje?</h1>
        <p>{name ? `Hoi ${name}! ` : ''}Korte spelletjes voor tussendoor. Kies er een en je speelt meteen, gewoon in je browser.</p>
        <div className="hero-btns">
          <button type="button" className="btn btn-primary" onClick={random}>Speel een willekeurige game</button>
          <Link className="btn btn-sun" href="/games">Alle games</Link>
        </div>
        <ul className="badges">
          {['Gratis', 'Geen download', 'Geen account nodig'].map((t) => <li key={t}><Html html={ICON.check} />{t}</li>)}
        </ul>
      </div>
      <div className="hero-art" aria-hidden="true">
        <span className="bubble b1" /><span className="bubble b2" /><span className="bubble b3" /><span className="bubble b4" />
        <Html html={blob('#8B6CFF', 'grin', 'hero-blob')} />
      </div>
    </section>
  );
}
