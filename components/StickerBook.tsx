'use client';
import { useEffect, useState } from 'react';
import Html from './Html';
import { blob } from '@/lib/blob';
import { STICKERS as ALL, ACCESSORIES, THEMES as ALL_THEMES, themeActive, themeSoon } from '@/lib/stickers';
import { data } from '@/lib/store';
import { useAccount } from '@/lib/useAccount';

type Sticker = { id: string; emoji: string; name: string; hint: string; theme: string; secret?: boolean };
type Theme = { id: string; name: string; emoji: string; color: string; text?: string; reward?: string; from?: string; season?: string; starts?: string };
const STICKERS = ALL as Sticker[];
const THEMES = ALL_THEMES as Theme[];
const ACCS = ACCESSORIES as { id: string; name: string; need?: number; theme?: string }[];

// Stickerboek met albums per thema. Verdiende stickers in kleur, de rest als grijs vraagteken met een hint.
export default function StickerBook() {
  const acc = useAccount();
  const [have, setHave] = useState<Record<string, string>>({});
  // Begin bij een seizoensthema dat nu bezig is (zoals Halloween), anders bij Basis.
  const [tab, setTab] = useState(() => (THEMES.find((t) => t.from && themeActive(t)) || THEMES[0]).id);
  useEffect(() => { setHave({ ...(data.stickers || {}) }); }, [acc.user]);
  const n = STICKERS.filter((s) => have[s.id]).length;
  const next = ACCS.find((a) => !a.theme && (a.need || 0) > n);
  const theme = THEMES.find((t) => t.id === tab)!;
  const list = STICKERS.filter((s) => s.theme === tab);
  const got = list.filter((s) => have[s.id]).length;
  const done = got === list.length;
  const reward = theme.reward ? ACCS.find((a) => a.id === theme.reward) : null;
  const active = themeActive(theme);
  const soon = themeSoon(theme);
  // Seizoen nog niet bezig: stickers die je nog niet hebt blijven een verrassing.
  const teaser = Boolean(theme.from) && !active;
  return (
    <section className="stickerbook" id="stickers" aria-labelledby="sbTitle">
      <h2 id="sbTitle">Stickerboek <span className="count">{n} / {STICKERS.length}</span></h2>
      <p className="muted">Speel games en verdien stickers. {next ? <>Nog <b>{next.need! - n}</b> {next.need! - n === 1 ? 'sticker' : 'stickers'} voor: <b>{next.name}</b> voor je Gloop!</> : 'Je hebt alle spulletjes voor je Gloop vrijgespeeld!'}</p>
      <div className="album-tabs" role="tablist" aria-label="Albums">
        {THEMES.map((t) => {
          const all = STICKERS.filter((s) => s.theme === t.id), g = all.filter((s) => have[s.id]).length;
          return (
            <button key={t.id} type="button" role="tab" id={'album-' + t.id} aria-selected={t.id === tab} aria-controls="albumPanel" className={'album-tab' + (g === all.length ? ' full' : '')} style={{ '--ac': t.color, '--at': t.text || '#fff' } as React.CSSProperties} onClick={() => setTab(t.id)}>
              <span className="at-emoji" aria-hidden="true">{t.emoji}</span>
              <span className="at-name">{t.name}</span>
              <span className="at-count">{g}/{all.length}</span>
              {t.from && themeActive(t) && <span className="at-live">Nu!</span>}
              {themeSoon(t) && <span className="at-live soon">Binnenkort</span>}
            </button>
          );
        })}
      </div>
      <div id="albumPanel" role="tabpanel" aria-labelledby={'album-' + tab} className={'album' + (done ? ' full' : '')} style={{ '--ac': theme.color } as React.CSSProperties}>
        <div className="album-head">
          <div>
            <h3><span aria-hidden="true">{theme.emoji}</span> {theme.name}-album</h3>
            <div className="album-bar" role="progressbar" aria-label={`${theme.name}-album`} aria-valuemin={0} aria-valuemax={list.length} aria-valuenow={got}><span style={{ width: (got / list.length) * 100 + '%' }} /></div>
            {theme.from && <p className="album-season">{active ? <>🗓️ Nu te verdienen! ({theme.season})</> : soon ? <>⏳ Binnenkort! Vanaf {theme.starts} kun je deze stickers verdienen.</> : <>🗓️ Deze stickers komen elk jaar terug, van {theme.season}.</>}</p>}
          </div>
          {reward && (
            <div className={'album-reward' + (done ? ' got' : '')}>
              <Html html={blob('#6BE38A', 'happy', 'reward-blob', false, reward.id)} />
              <small>{done ? <>🎉 <b>{reward.name}</b> vrijgespeeld!</> : <>Album vol? Dan krijg je de <b>{reward.name}</b>!</>}</small>
            </div>
          )}
        </div>
        <ul className="sticker-grid">
          {list.map((s) => {
            const g = Boolean(have[s.id]);
            return (
              <li key={s.id} className={'sticker-card' + (g ? ' got' : '')}>
                <span className="sticker-face" aria-hidden="true">{g ? s.emoji : '?'}</span>
                <b>{g ? s.name : teaser ? 'Verrassing!' : s.secret ? 'Geheime sticker' : 'Nog geheim'}</b>
                <small>{g ? s.hint : teaser ? `Vanaf ${theme.starts}` : s.secret ? 'Een verrassing… blijf spelen! 🤫' : s.hint}</small>
                <span className="sr-only">{g ? 'Verdiend' : 'Nog niet verdiend'}</span>
              </li>
            );
          })}
        </ul>
      </div>
      {!acc.user && <p className="muted small">Tip: met een account bewaar je je stickers op elk apparaat, en kun je je Gloop aankleden.</p>}
    </section>
  );
}
