import Link from 'next/link';
import Logo from './Logo';
import { SITE } from '@/lib/site';
import InstallApp from './InstallApp';
import ThemeToggle from './ThemeToggle';

// Footer: rustig en voor kinderen. Alles voor ouders (uitleg, privacy, voorwaarden) staat op /ouders.
const PLAY: [string, string][] = [['/games', 'Alle games'], ['/ranglijst', 'Ranglijst'], ['/winkel', 'Gloop-winkel'], ['/nieuw', 'Wat is er nieuw?']];
const SMALL: [string, string][] = [['/ouders', 'Voor ouders'], ['/privacy', 'Privacy'], ['/cookies', 'Cookies'], ['/contact', 'Contact']];

export default function Footer() {
  const a = ([href, label]: [string, string]) => <Link key={href} href={href}>{label}</Link>;
  return (
    <footer className="site-footer">
      <div className="wrap">
        <div className="foot-main">
          <div className="foot-brand">
            <Link href="/" className="logo" aria-label="Gloop, naar home"><Logo /></Link>
            <p>Gloop is het huis van Gloopie: gratis mini games voor tussendoor.</p>
            {SITE.url && <p className="foot-url"><span aria-hidden="true">🏠</span> Speel op <b>{SITE.url.replace(/^https?:\/\/(www\.)?/, '')}</b></p>}
          </div>
          <div className="foot-install"><InstallApp /></div>
        </div>
        <nav className="foot-play" aria-label="Spelen">
          {PLAY.map(a)}
          <a href={SITE.xlPath} className="foot-xl">Gloop XL <span aria-hidden="true">→</span></a>
        </nav>
        <div className="foot-bottom">
          <p>© {SITE.year} {SITE.owner}</p>
          <nav aria-label="Informatie">{SMALL.map(a)}<ThemeToggle text /></nav>
        </div>
      </div>
    </footer>
  );
}
