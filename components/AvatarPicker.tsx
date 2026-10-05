'use client';
import Html from './Html';
import { blob } from '@/lib/blob';
import { AVATAR_COLORS, AVATAR_FACES, parseAvatar } from '@/lib/accountRules';

// Kies je eigen Gloop: eerst een kleur, dan een gezichtje. Grote knoppen, met een voorbeeld.
export default function AvatarPicker({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const { color, face } = parseAvatar(value);
  return (
    <div className="avatar-picker">
      <Html html={blob(color, face, 'avatar-preview')} />
      <div className="avatar-opts">
        <p className="avatar-q" id="av-color">Kleur</p>
        <div className="avatar-row" role="radiogroup" aria-labelledby="av-color">
          {AVATAR_COLORS.map(([c, label]) => (
            <button key={c} type="button" role="radio" aria-checked={c === color} aria-label={label}
              className="swatch" style={{ background: c }} onClick={() => onChange(c + '|' + face)} />
          ))}
        </div>
        <p className="avatar-q" id="av-face">Gezichtje</p>
        <div className="avatar-row" role="radiogroup" aria-labelledby="av-face">
          {AVATAR_FACES.map(([f, label]) => (
            <button key={f} type="button" role="radio" aria-checked={f === face} aria-label={label}
              className="face-opt" onClick={() => onChange(color + '|' + f)}>
              <Html html={blob(color, f, 'face-blob')} />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
