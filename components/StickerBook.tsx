'use client';
import { useEffect, useState } from 'react';
import { STICKERS as ALL, ACCESSORIES } from '@/lib/stickers';
import { data } from '@/lib/store';
import { useAccount } from '@/lib/useAccount';

const STICKERS = ALL as { id: string; emoji: string; name: string; hint: string }[];

// Stickerboek: verdiende stickers in kleur, de rest als grijs vraagteken met een hint.
export default function StickerBook() {
  const acc = useAccount();
  const [have, setHave] = useState<Record<string, string>>({});
  useEffect(() => { setHave({ ...(data.stickers || {}) }); }, [acc.user]);
  const n = STICKERS.filter((s) => have[s.id]).length;
  const next = ACCESSORIES.find((a) => a.need > n);
  return (
    <section className="stickerbook" id="stickers" aria-labelledby="sbTitle">
      <h2 id="sbTitle">Stickerboek <span className="count">{n} / {STICKERS.length}</span></h2>
      <p className="muted">Speel games en verdien stickers. {next ? <>Nog <b>{next.need - n}</b> {next.need - n === 1 ? 'sticker' : 'stickers'} voor: <b>{next.name}</b> voor je Gloop!</> : 'Je hebt alle spulletjes voor je Gloop vrijgespeeld!'}</p>
      <ul className="sticker-grid">
        {STICKERS.map((s) => {
          const got = Boolean(have[s.id]);
          return (
            <li key={s.id} className={'sticker-card' + (got ? ' got' : '')}>
              <span className="sticker-face" aria-hidden="true">{got ? s.emoji : '?'}</span>
              <b>{got ? s.name : 'Nog geheim'}</b>
              <small>{s.hint}</small>
              <span className="sr-only">{got ? 'Verdiend' : 'Nog niet verdiend'}</span>
            </li>
          );
        })}
      </ul>
      {!acc.user && <p className="muted small">Tip: met een account bewaar je je stickers op elk apparaat, en kun je je Gloop aankleden.</p>}
    </section>
  );
}
