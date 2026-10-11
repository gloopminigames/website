import type { Metadata } from 'next';
import { SITE } from '@/lib/site';
import GamesSection from '@/components/GamesSection';

export const metadata: Metadata = { title: 'Alle games', description: 'Alle gratis mini games van Gloop: actie, puzzels, geheugen, klassiekers en multiplayer. Direct spelen in je browser.' };

export default function GamesPage() {
  return (
    <>
      <div className="page"><h1>Alle games</h1><p className="lead">Nieuwe games komen er regelmatig bij.</p></div>
      <GamesSection title="Kies je spel" />
      <section className="plus-teaser" aria-labelledby="xlTeaser">
        <img src="/xl-192.png" alt="" width={96} height={96} />
        <div>
          <h2 id="xlTeaser">Ouder dan 12? Probeer Gloop XL</h2>
          <p className="muted">Onze aparte site met grotere, rustigere games voor tieners en volwassenen, zoals het 3D-boerderijspel Little Farm Island. Je logt in met je Gloop-account.</p>
        </div>
        <a className="btn btn-plain" href={SITE.xlUrl}>Naar Gloop XL</a>
      </section>
    </>
  );
}
