import { SITE } from '@/lib/site';

// Grote, opvallende verwijzing naar Gloop XL (home en Alle games).
// Een gewone <a>: /xl/ is de aparte XL-site die Gloop doorgeeft, geen pagina van Gloop zelf.
export default function XlBanner() {
  return (
    <a className="xl-banner" href={SITE.xlPath} aria-labelledby="xlTitle xlSub">
      <span className="xl-art" aria-hidden="true">
        <img className="xl-logo" src="/xl-192.png" alt="" width={96} height={96} />
        <img className="xl-island" src="/xl-island.png" alt="" width={96} height={96} />
      </span>
      <span className="xl-txt">
        <small><span className="xl-new">Nieuw</span> Voor tieners en volwassenen</small>
        <b id="xlTitle">Gloop XL</b>
        <span id="xlSub">Grotere games om lang mee bezig te zijn, zoals het 3D-boerderijspel Little Farm Island. Je speelt met je eigen Gloop-account.</span>
      </span>
      <span className="btn btn-sun xl-go" aria-hidden="true">Ontdek XL <span className="xl-arrow">→</span></span>
    </a>
  );
}
