import type { Metadata } from 'next';
import PlusAccount from '@/components/PlusAccount';

export const metadata: Metadata = {
  title: 'Gloop Plus (12+)',
  description: 'Gloop Plus: rustigere, grotere games voor tieners en volwassenen. Speel Little Farm Island, een 3D-boerderijspel op je eigen eiland. Met een Gloop-account speel je op elk apparaat verder.',
  alternates: { canonical: '/plus' },
};

const GAME = '/plus/little-farm-island';

// Gloop Plus: games voor 12+ en volwassenen. De games zelf zijn losse pagina's (zie public/plus/).
export default function PlusPage() {
  return (
    <div className="page plus">
      <section className="plus-hero" aria-labelledby="plusTitle">
        <span className="plus-badge">Gloop Plus · 12+</span>
        <h1 id="plusTitle">Grotere games voor tieners en volwassenen</h1>
        <p className="lead">Rustiger, dieper en om lang mee bezig te zijn. Speel gratis in je browser, met hetzelfde Gloop-account.</p>
      </section>

      <section className="plus-game" aria-labelledby="lfiTitle">
        {/* Een gewone link: het spel is een losse pagina buiten de rest van de site. */}
        <a className="plus-art" href={GAME} tabIndex={-1} aria-hidden="true">
          <img src="/plus/little-farm-island/icon-512.png" alt="" width={512} height={512} />
        </a>
        <div className="plus-info">
          <span className="plus-tag">3D · Boerderij · Rustig</span>
          <h2 id="lfiTitle">Little Farm Island</h2>
          <p>Begin op een kale rots in zee. Zaai, geef water en oogst, vang vissen voor tonics die alles sneller laten groeien, en richt je eiland in met paden, lantaarns, bomen en zelfs een vuurtoren. Hoe mooier je eiland, hoe verder het opbloeit: van Kale Rots tot Wondereiland.</p>
          <a className="btn btn-sun" href={GAME}>Speel Little Farm Island</a>
          <PlusAccount back={GAME} />
        </div>
      </section>

      <section id="hoe" className="plus-how" aria-labelledby="hoeTitle">
        <h2 id="hoeTitle">Hoe werkt Little Farm Island?</h2>
        <div className="plus-grid">
          <div className="plus-card">
            <h3>Besturing</h3>
            <ul>
              <li><b>Tikken of klikken</b> op een akker om te zaaien, water te geven en te oogsten.</li>
              <li><b>Slepen</b> om rond te kijken.</li>
              <li><b>Knijpen</b> met twee vingers of <b>scrollen</b> om te zoomen.</li>
              <li><b>Ingedrukt houden</b> op een versiering om te draaien, verplaatsen of weg te halen.</li>
            </ul>
          </div>
          <div className="plus-card">
            <h3>Voortgang</h3>
            <ul>
              <li>Verkoop je oogst voor munten en koop zaden en versiering in de Strandwinkel.</li>
              <li>Versiering maakt je eiland mooier. Zo stijg je in niveau en komen er nieuwe gewassen en spullen vrij.</li>
              <li>Zie je iets bewegen in zee? Tik erop en vang een vis.</li>
              <li>Gewassen groeien rustig door, ook als je even weg bent (tot 3 uur).</li>
            </ul>
          </div>
          <div className="plus-card">
            <h3>Opslaan en verder spelen</h3>
            <p>Zonder account wordt je eiland bewaard op dit apparaat. Ben je ingelogd bij Gloop, dan gaat je eiland ook mee in je account en speel je op je telefoon, tablet of computer gewoon verder.</p>
          </div>
          <div className="plus-card">
            <h3>Goed om te weten</h3>
            <p>Het spel heeft 3D nodig (WebGL); dat kan elke recente browser. Een keer geladen? Dan werkt het ook zonder internet. Geen reclame en geen aankopen met echt geld.</p>
          </div>
        </div>
      </section>
    </div>
  );
}
