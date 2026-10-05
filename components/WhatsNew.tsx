'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import Html from './Html';
import { blob } from '@/lib/blob';
import { latestPopup } from '@/lib/updates';
import { data, save } from '@/lib/store';
import { sfx } from '@/lib/sfx';
import { confetti } from '@/lib/confetti';

type Update = { id: string; title: string; emoji: string; items: { emoji: string; title: string; text: string; href?: string }[] };

// Pop-up "Nieuw in Gloop!": één keer per leuk nieuwtje, nooit tijdens het spelen.
export default function WhatsNew() {
  const path = usePathname() || '/';
  const [u, setU] = useState<Update | null>(null);
  const dlg = useRef<HTMLDialogElement>(null);
  const quietPage = /^\/(games\/.+|inloggen)/.test(path);

  useEffect(() => {
    if (quietPage) return;
    const up = latestPopup() as Update | null;
    if (!up || data.seenUpdate === up.id) return;
    // Nieuwe bezoeker? Dan geen oude nieuwtjes laten zien, alleen onthouden.
    const isNew = !data.seenUpdate && !Object.keys(data.played || {}).length && !Object.keys(data.records || {}).length;
    if (isNew) { data.seenUpdate = up.id; save(); return; }
    const t = setTimeout(() => setU(up), 900);
    return () => clearTimeout(t);
  }, [path, quietPage]);

  useEffect(() => {
    if (!u || !dlg.current || dlg.current.open) return;
    dlg.current.showModal(); sfx('sticker'); confetti(90);
  }, [u]);

  if (!u) return null;
  const close = () => { data.seenUpdate = u.id; save(); dlg.current?.close(); setU(null); };
  return (
    <dialog ref={dlg} className="news-pop" aria-labelledby="newsPopTitle" onCancel={close}>
      <Html html={blob('#6BE38A', 'grin', 'news-pop-blob', true)} />
      <p className="news-pop-kicker">Nieuw in Gloop!</p>
      <h2 id="newsPopTitle">{u.emoji} {u.title}</h2>
      <ul>
        {u.items.slice(0, 4).map((it) => <li key={it.title}><span aria-hidden="true">{it.emoji}</span> <b>{it.title}</b></li>)}
      </ul>
      {u.items.length > 4 && <p className="muted small">…en nog {u.items.length - 4} andere leuke dingen!</p>}
      <div className="news-pop-btns">
        <button type="button" className="btn btn-primary" onClick={close}>Leuk!</button>
        <Link className="btn btn-plain" href="/nieuw" onClick={close}>Bekijk alles</Link>
      </div>
    </dialog>
  );
}
