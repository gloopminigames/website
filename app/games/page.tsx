import type { Metadata } from 'next';
import GamesSection from '@/components/GamesSection';

export const metadata: Metadata = { title: 'Alle games', description: 'Alle gratis mini games van Gloop: actie, puzzels, geheugen, klassiekers en multiplayer. Direct spelen in je browser.' };

export default function GamesPage() {
  return (
    <>
      <div className="page"><h1>Alle games</h1><p className="lead">Nieuwe games komen er regelmatig bij.</p></div>
      <GamesSection title="Kies je spel" />
    </>
  );
}
