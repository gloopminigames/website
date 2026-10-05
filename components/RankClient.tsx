'use client';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import Html from './Html';
import WorldBoard from './WorldBoard';
import { blob } from '@/lib/blob';
import { PLAYABLE } from '@/lib/games';
import { fmtRec } from '@/lib/store';
import { useAccount } from '@/lib/useAccount';

export default function RankClient() {
  const [ready, setReady] = useState(false);
  const acc = useAccount(); // her-rendert zodra de records van het account binnen zijn
  useEffect(() => setReady(true), []);
  return (
    <section className="page">
      <h1>Ranglijst</h1>
      <p className="lead">Zie wie de beste is van de wereld, en hoe jij het doet.</p>
      <WorldBoard />
      <h2 className="rank-sub">{acc.user ? `Jouw records, ${acc.user.name}` : 'Jouw records op dit apparaat'}</h2>
      <div className="rank-grid">
        {PLAYABLE.map((g) => (
          <div className="rank-card" key={g.id}>
            <div className="rank-top" style={{ background: g.bg }}><Html html={blob(g.blob, g.face, 'card-blob')} /></div>
            <div className="rank-body">
              <h3>{g.title}</h3>
              <p className="rec">{ready ? fmtRec(g.id) : '…'}</p>
              <Link className="btn btn-primary btn-sm" href={`/games/${g.id}`}>Verbeter je record</Link>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
