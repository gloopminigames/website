'use client';
import Html from './Html';
import { blob } from '@/lib/blob';
import { AVATAR_COLORS, AVATAR_FACES, parseAvatar, makeAvatar } from '@/lib/accountRules';
import { ACCESSORIES, accUnlocked, accLockText, THEMES } from '@/lib/stickers';
import { data } from '@/lib/store';
import Link from 'next/link';
import { SHOP, owns } from '@/lib/shop';

// Kies je eigen Gloop: kleur, gezichtje en (met genoeg stickers) een spulletje. Grote knoppen, met een voorbeeld.
export default function AvatarPicker({ value, onChange, stickers = 0, admin = false }: { value: string; onChange: (v: string) => void; stickers?: number; admin?: boolean }) {
  const { color, face, acc, bg } = parseAvatar(value);
  // Gekocht in de Gloop-winkel? Dan staat het er ook tussen.
  const bought = (t: string) => (SHOP as { id: string; type: string; value: string; name: string }[]).filter((s) => s.type === t && owns(data, s.id)).map((s) => [s.value, s.name]);
  const colors = AVATAR_COLORS, faces = [...AVATAR_FACES, ...bought('face')], shopAccs = bought('acc'), bgs = bought('bg');
  const make = (c: string, f: string, a: string, b: string = bg) => makeAvatar(c, f, a, b);
  return (
    <div className="avatar-picker">
      <Html html={blob(color, face, 'avatar-preview', false, acc, bg)} />
      <div className="avatar-opts">
        <p className="avatar-q" id="av-color">Kleur</p>
        <div className="avatar-row" role="radiogroup" aria-labelledby="av-color">
          {colors.map(([c, label]) => (
            <button key={c} type="button" role="radio" aria-checked={c === color} aria-label={label}
              className="swatch" style={{ background: c }} onClick={() => onChange(make(c, face, acc))} />
          ))}
        </div>
        <p className="avatar-q" id="av-face">Gezichtje</p>
        <div className="avatar-row" role="radiogroup" aria-labelledby="av-face">
          {faces.map(([f, label]) => (
            <button key={f} type="button" role="radio" aria-checked={f === face} aria-label={label}
              className="face-opt" onClick={() => onChange(make(color, f, acc))}>
              <Html html={blob(color, f, 'face-blob')} />
            </button>
          ))}
        </div>
        <p className="avatar-q" id="av-acc">Spulletje <small>({stickers} {stickers === 1 ? 'sticker' : 'stickers'})</small></p>
        <div className="avatar-row" role="radiogroup" aria-labelledby="av-acc">
          {ACCESSORIES.map((a) => {
            const locked = !accUnlocked(a, data);
            const why = locked ? accLockText(a, data) : '';
            const th = a.theme ? THEMES.find((t) => t.id === a.theme) : null;
            return (
              <button key={a.id} type="button" role="radio" aria-checked={a.id === acc} disabled={locked}
                aria-label={locked ? `${a.name}, op slot: ${why}` : a.name}
                title={locked ? why : a.name}
                className={'face-opt acc-opt' + (locked ? ' locked' : '')} onClick={() => onChange(make(color, face, a.id))}>
                {a.id === 'none' ? <span className="acc-none" aria-hidden="true">✖</span> : <Html html={blob(color, face, 'face-blob', false, a.id)} />}
                {locked && <span className="lock" aria-hidden="true">🔒<b>{th ? th.emoji : a.need}</b></span>}
              </button>
            );
          })}
          {admin && (
            <button type="button" role="radio" aria-checked={acc === 'maker'} aria-label="Makershoed (alleen voor de maker van Gloop)" title="Makershoed: alleen voor jou als maker van Gloop"
              className="face-opt acc-opt maker-opt" onClick={() => onChange(make(color, face, 'maker'))}>
              <Html html={blob(color, face, 'face-blob', false, 'maker')} />
            </button>
          )}
          {shopAccs.map(([id, label]) => (
            <button key={id} type="button" role="radio" aria-checked={id === acc} aria-label={label} title={label}
              className="face-opt acc-opt" onClick={() => onChange(make(color, face, id))}>
              <Html html={blob(color, face, 'face-blob', false, id)} />
            </button>
          ))}
        </div>
        {bgs.length > 0 && <>
          <p className="avatar-q" id="av-bg">Achtergrond</p>
          <div className="avatar-row" role="radiogroup" aria-labelledby="av-bg">
            <button type="button" role="radio" aria-checked={!bg} aria-label="Geen achtergrond" className="face-opt acc-opt" onClick={() => onChange(make(color, face, acc, ''))}><span className="acc-none" aria-hidden="true">✖</span></button>
            {bgs.map(([id, label]) => (
              <button key={id} type="button" role="radio" aria-checked={id === bg} aria-label={label} title={label}
                className="face-opt acc-opt" onClick={() => onChange(make(color, face, acc, id))}>
                <Html html={blob(color, face, 'face-blob', false, 'none', id)} />
              </button>
            ))}
          </div>
        </>}
        <p className="shop-link"><Link href="/winkel">🪙 Meer gezichtjes, spulletjes en achtergronden in de Gloop-winkel</Link></p>
      </div>
    </div>
  );
}
