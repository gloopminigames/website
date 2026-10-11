import type { Metadata } from 'next';
import Link from 'next/link';
import Html from '@/components/Html';
import { blob, ICON } from '@/lib/blob';
import { SITE } from '@/lib/site';

export const metadata: Metadata = {
  title: 'Voor ouders',
  description: 'Alles over Gloop voor ouders en verzorgers: veilig spelen, geen tracking en geen advertenties, accounts zonder e-mailadres, privacy en voorwaarden.',
  alternates: { canonical: '/ouders' },
};

const SAFE: [string, string, string][] = [
  ['🚫', 'Geen advertenties', 'Er staat nergens reclame op Gloop, ook niet tussen de spelletjes door.'],
  ['🕵️', 'Geen tracking', 'We volgen niemand. Geen analysediensten, geen trackingcookies en geen gegevens van derden.'],
  ['🪙', 'Nooit echt geld', 'Gloopmunten verdien je alleen door te spelen. Er valt niets te kopen met echt geld.'],
  ['🔑', 'Account zonder e-mail', 'Een account is niet nodig. Wie er een maakt, kiest alleen een bijnaam en een pincode.'],
  ['🌴', 'Gloop XL voor ouderen', 'Grotere, rustigere games voor tieners en volwassenen staan apart, op Gloop XL.'],
  ['🇳🇱', 'Gemaakt in Nederland', 'Gloop is een klein Nederlands project, gemaakt met zorg voor kinderen.'],
];
const MORE: [string, string, string][] = [
  ['/over', 'Over Gloop', 'Wie we zijn en wie Gloopie is'],
  ['/faq', 'Veelgestelde vragen', 'Accounts, records, de ranglijst en meer'],
  ['/contact', 'Contact', 'Een vraag, idee of probleem? Mail ons'],
  ['/toegankelijkheid', 'Toegankelijkheid', 'Wat we doen zodat iedereen kan spelen'],
  ['/nieuw', 'Wat is er nieuw?', 'Nieuwe games en verbeteringen'],
];
const LEGAL: [string, string][] = [['/privacy', 'Privacyverklaring'], ['/cookies', 'Cookieverklaring'], ['/voorwaarden', 'Gebruiksvoorwaarden'], ['/disclaimer', 'Disclaimer en copyright']];

// Eén plek voor ouders en verzorgers; zo blijft de rest van de site voor kinderen.
export default function OudersPage() {
  return (
    <div className="page ouders">
      <section className="ouders-hero">
        <div>
          <h1>Voor ouders en verzorgers</h1>
          <p className="lead">Gloop is een plek waar kinderen veilig even een potje kunnen spelen. Hier lees je hoe dat werkt.</p>
        </div>
        <Html html={blob('#6BE38A', 'happy', 'ouders-blob')} />
      </section>

      <section aria-labelledby="veilig" className="ouders-sec">
        <h2 id="veilig">Veilig spelen</h2>
        <ul className="safe-grid">
          {SAFE.map(([e, t, d]) => <li key={t}><span className="safe-e" aria-hidden="true">{e}</span><b>{t}</b><span>{d}</span></li>)}
        </ul>
      </section>

      <section aria-labelledby="meer" className="ouders-sec">
        <h2 id="meer">Meer weten</h2>
        <div className="more-grid">
          {MORE.map(([href, t, d]) => <Link key={href} href={href} className="more-card"><b>{t}</b><span>{d}</span><Html html={ICON.play} /></Link>)}
          <a href={SITE.xlPath} className="more-card"><b>Gloop XL</b><span>Grotere games voor tieners en volwassenen</span><Html html={ICON.play} /></a>
        </div>
      </section>

      <section aria-labelledby="regels" className="ouders-sec">
        <h2 id="regels">Privacy en voorwaarden</h2>
        <ul className="legal-list">{LEGAL.map(([href, t]) => <li key={href}><Link href={href}>{t}</Link></li>)}</ul>
        <p className="muted small">Vragen? Mail naar <a href={`mailto:${SITE.email}`}>{SITE.email}</a>.</p>
      </section>
    </div>
  );
}
