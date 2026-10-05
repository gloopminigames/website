import Link from 'next/link';
import Html from './Html';
import { blob, ICON } from '@/lib/blob';

export type Game = { id: string; title: string; cat: string; bg: string; blob: string; face: string; playable?: boolean; added?: string; desc?: string };

export default function GameCard({ g, isNew = false }: { g: Game; isNew?: boolean }) {
  const inner = (
    <>
      <div className="card-top" style={{ background: g.bg }}>
        {isNew && <span className="sticker">Nieuw!</span>}
        {!g.playable && <span className="sticker soon-tag">Binnenkort</span>}
        <Html html={blob(g.blob, g.face, 'card-blob')} />
      </div>
      <div className="card-body">
        <div><h3>{g.title}</h3><span className="cat">{g.cat}</span></div>
        {g.playable && <span className="play" aria-hidden="true"><Html html={ICON.play} /></span>}
      </div>
    </>
  );
  return g.playable
    ? <Link className="card" href={`/games/${g.id}`}>{inner}</Link>
    : <div className="card soon" aria-disabled="true">{inner}</div>;
}
