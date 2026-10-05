import Link from 'next/link';
import Logo from './Logo';
import Html from './Html';
import { SITE } from '@/lib/site';
import { ICON } from '@/lib/blob';

export default function Footer() {
  const col = (id: string, title: string, links: [string, string][]) => (
    <nav className="foot-col" aria-labelledby={id}>
      <h2 id={id}>{title}</h2>
      <ul>{links.map(([href, label]) => <li key={href}><Link href={href}>{label}</Link></li>)}</ul>
    </nav>
  );
  return (
    <footer className="site-footer">
      <div className="wrap">
        <div className="foot-grid">
          <div className="foot-brand">
            <Link href="/" className="logo" aria-label="Gloop, naar home"><Logo /></Link>
            <p>Gratis mini games voor tussendoor. Geen download, geen account en geen advertenties.</p>
            <ul className="foot-pills">
              {['Geen tracking', 'Geen advertenties', 'Gemaakt in Nederland'].map((t) => <li key={t}><Html html={ICON.check} />{t}</li>)}
            </ul>
          </div>
          {col('f1', 'Spelen', [['/games', 'Alle games'], ['/ranglijst', 'Ranglijst'], ['/profiel', 'Profiel']])}
          {col('f2', 'Gloop', [['/over', 'Over Gloop'], ['/faq', 'Veelgestelde vragen'], ['/contact', 'Contact'], ['/toegankelijkheid', 'Toegankelijkheid']])}
          {col('f3', 'Juridisch', [['/privacy', 'Privacyverklaring'], ['/cookies', 'Cookieverklaring'], ['/voorwaarden', 'Gebruiksvoorwaarden'], ['/disclaimer', 'Disclaimer en copyright']])}
        </div>
        <div className="foot-bottom">
          <p>© {SITE.year} {SITE.name}, {SITE.owner}. Alle rechten voorbehouden.</p>
          <p>{SITE.kvk ? `KvK ${SITE.kvk}. ` : ''}Contact: <a href={`mailto:${SITE.email}`}>{SITE.email}</a></p>
        </div>
      </div>
    </footer>
  );
}
