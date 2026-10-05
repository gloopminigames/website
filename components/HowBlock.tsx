import Html from './Html';
import { blob } from '@/lib/blob';

const STEPS = [
  ['#6BE38A', 'wink', 'Kies een game', 'Van snelle reactietests tot minigolf en bubbels knallen.'],
  ['#FFD84A', 'surprised', 'Speel meteen', 'Geen download, geen account. Op je telefoon, tablet of computer.'],
  ['#FF7AC6', 'grin', 'Verbeter je record', 'Deel je score en daag je vrienden uit.'],
];

export default function HowBlock() {
  return (
    <section className="section how" aria-labelledby="howTitle">
      <div className="section-head"><h2 id="howTitle">Zo werkt Gloop</h2></div>
      <ol className="steps">
        {STEPS.map(([c, f, t, d], i) => (
          <li className="step" key={t}><Html html={blob(c, f, 'step-blob')} /><span className="step-n">{i + 1}</span><h3>{t}</h3><p>{d}</p></li>
        ))}
      </ol>
    </section>
  );
}
