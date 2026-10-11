import type { Metadata } from 'next';
import Link from 'next/link';
import GamesSection from '@/components/GamesSection';

export const metadata: Metadata = { title: 'Alle games', description: 'Alle gratis mini games van Gloop: actie, puzzels, geheugen, klassiekers en multiplayer. Direct spelen in je browser.' };

export default function GamesPage() {
  return (
    <>
      <div className="page"><h1>Alle games</h1><p className="lead">Nieuwe games komen er regelmatig bij.</p></div>
      <GamesSection title="Kies je spel" />
      <section className="plus-teaser" aria-labelledby="plusTeaser">
        <img src="/plus/little-farm-island/icon-192.png" alt="" width={96} height={96} />
        <div>
          <h2 id="plusTeaser">Ouder dan 12? Probeer Gloop Plus</h2>
          <p className="muted">Grotere, rustigere games voor tieners en volwassenen, zoals het 3D-boerderijspel Little Farm Island.</p>
        </div>
        <Link className="btn btn-plain" href="/plus">Naar Gloop Plus</Link>
      </section>
    </>
  );
}
