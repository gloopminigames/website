'use client';
import ChallengeBlock from './ChallengeBlock';
import Html from './Html';
import { blob } from '@/lib/blob';
import { useHomeState } from './HomeTop';

const STEPS = [
  ['#6BE38A', 'wink', 'Kies een game'],
  ['#FFD84A', 'surprised', 'Speel meteen'],
  ['#FF7AC6', 'grin', 'Verbeter je record'],
];

// Onderkant van de homepagina, alleen voor nieuwe bezoekers: de uitdaging en in het kort hoe Gloop werkt.
// Terugkerende spelers zien de uitdaging al bovenaan.
export default function HomeBottom() {
  const st = useHomeState();
  if (st?.returning) return null;
  return (
    <>
      <ChallengeBlock />
      <section className="how-row" aria-labelledby="howTitle">
        <h2 id="howTitle">Zo werkt Gloop</h2>
        <ol>
          {STEPS.map(([c, f, t], i) => (
            <li key={t}><Html html={blob(c, f, 'how-blob')} /><span><b>{i + 1}.</b> {t}</span></li>
          ))}
        </ol>
        <p className="muted">Geen download en geen account nodig. Op je telefoon, tablet of computer.</p>
      </section>
    </>
  );
}
