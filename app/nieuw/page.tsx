import type { Metadata } from 'next';
import Link from 'next/link';
import Html from '@/components/Html';
import { blob } from '@/lib/blob';
import { UPDATES, fmtDate } from '@/lib/updates';
import { GAMES } from '@/lib/games';

export const metadata: Metadata = {
  title: 'Wat is er nieuw?',
  description: 'Alle leuke nieuwe dingen in Gloop, en waar we nu aan werken.',
  alternates: { canonical: '/nieuw' },
};

export default function NieuwPage() {
  const soon = GAMES.filter((g) => !g.playable);
  return (
    <section className="page news">
      <div className="news-hero">
        <Html html={blob('#FF7AC6', 'love', 'news-blob', true)} />
        <div>
          <h1>Wat is er nieuw?</h1>
          <p className="lead">Hier zie je alle leuke dingen die we aan Gloop hebben toegevoegd. En waar we nu aan werken!</p>
        </div>
      </div>

      <ol className="news-list">
        {UPDATES.map((u) => (
          <li key={u.id} className="news-entry">
            <div className="news-date"><span className="news-emoji" aria-hidden="true">{u.emoji}</span><time dateTime={u.date}>{fmtDate(u.date)}</time></div>
            <h2>{u.title}</h2>
            <ul className="news-items">
              {u.items.map((it) => (
                <li key={it.title} className="news-item">
                  <span className="ni-emoji" aria-hidden="true">{it.emoji}</span>
                  <div><b>{it.title}</b><p>{it.text}</p></div>
                  {it.href && <Link className="btn btn-plain btn-sm" href={it.href}>Probeer het!</Link>}
                </li>
              ))}
            </ul>
          </li>
        ))}
      </ol>

      {soon.length > 0 && (
        <section className="news-soon" aria-labelledby="soonTitle">
          <h2 id="soonTitle"><span aria-hidden="true">🛠️</span> Hier werken we aan</h2>
          <p className="muted">Deze games komen eraan. Welke wil jij als eerste spelen? Laat het ons weten via <Link href="/contact">contact</Link>!</p>
          <ul className="soon-tiles">
            {soon.map((g) => (
              <li key={g.id}>
                <span className="gt-art" style={{ background: g.bg }}><Html html={blob(g.blob, g.face, 'gt-blob')} /></span>
                <span className="gt-name">{g.title}</span>
              </li>
            ))}
          </ul>
        </section>
      )}
    </section>
  );
}
