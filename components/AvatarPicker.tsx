'use client';
import Html from './Html';
import { blob } from '@/lib/blob';
import { AVATAR_COLORS, AVATAR_FACES, parseAvatar } from '@/lib/accountRules';
import { ACCESSORIES } from '@/lib/stickers';

// Kies je eigen Gloop: kleur, gezichtje en (met genoeg stickers) een spulletje. Grote knoppen, met een voorbeeld.
export default function AvatarPicker({ value, onChange, stickers = 0 }: { value: string; onChange: (v: string) => void; stickers?: number }) {
  const { color, face, acc } = parseAvatar(value);
  const make = (c: string, f: string, a: string) => c + '|' + f + (a && a !== 'none' ? '|' + a : '');
  return (
    <div className="avatar-picker">
      <Html html={blob(color, face, 'avatar-preview', false, acc)} />
      <div className="avatar-opts">
        <p className="avatar-q" id="av-color">Kleur</p>
        <div className="avatar-row" role="radiogroup" aria-labelledby="av-color">
          {AVATAR_COLORS.map(([c, label]) => (
            <button key={c} type="button" role="radio" aria-checked={c === color} aria-label={label}
              className="swatch" style={{ background: c }} onClick={() => onChange(make(c, face, acc))} />
          ))}
        </div>
        <p className="avatar-q" id="av-face">Gezichtje</p>
        <div className="avatar-row" role="radiogroup" aria-labelledby="av-face">
          {AVATAR_FACES.map(([f, label]) => (
            <button key={f} type="button" role="radio" aria-checked={f === face} aria-label={label}
              className="face-opt" onClick={() => onChange(make(color, f, acc))}>
              <Html html={blob(color, f, 'face-blob')} />
            </button>
          ))}
        </div>
        <p className="avatar-q" id="av-acc">Spulletje <small>({stickers} {stickers === 1 ? 'sticker' : 'stickers'})</small></p>
        <div className="avatar-row" role="radiogroup" aria-labelledby="av-acc">
          {ACCESSORIES.map((a) => {
            const locked = stickers < a.need;
            return (
              <button key={a.id} type="button" role="radio" aria-checked={a.id === acc} disabled={locked}
                aria-label={locked ? `${a.name}, op slot: nog ${a.need - stickers} stickers` : a.name}
                title={locked ? `Nog ${a.need - stickers} stickers` : a.name}
                className={'face-opt acc-opt' + (locked ? ' locked' : '')} onClick={() => onChange(make(color, face, a.id))}>
                {a.id === 'none' ? <span className="acc-none" aria-hidden="true">✖</span> : <Html html={blob(color, face, 'face-blob', false, a.id)} />}
                {locked && <span className="lock" aria-hidden="true">🔒<b>{a.need}</b></span>}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
