'use client';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import Html from './Html';
import { blob, ICON } from '@/lib/blob';
import { PLAYABLE } from '@/lib/games';
import { data, fmtRec } from '@/lib/store';

export default function ContinueBlock() {
  const [id, setId] = useState<string | null>(null);
  useEffect(() => setId(data.lastGame || null), []);
  const g = PLAYABLE.find((x) => x.id === id);
  if (!g) return null;
  return (
    <Link className="continue" href={`/games/${g.id}`}>
      <span className="cont-art" style={{ background: g.bg }}><Html html={blob(g.blob, g.face)} /></span>
      <span className="cont-txt"><small>Verder waar je was</small><b>{g.title}</b><span>{fmtRec(g.id)}</span></span>
      <span className="play" aria-hidden="true"><Html html={ICON.play} /></span>
    </Link>
  );
}
