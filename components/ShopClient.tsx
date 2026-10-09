'use client';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import Html from './Html';
import { blob } from '@/lib/blob';
import { data, save, onSave } from '@/lib/store';
import { parseAvatar, makeAvatar } from '@/lib/accountRules';
import { SHOP, balance, owns } from '@/lib/shop';
import { setAvatar, syncAccount } from '@/lib/account';
import { useAccount } from '@/lib/useAccount';
import { toast } from '@/lib/toast';
import { sfx } from '@/lib/sfx';
import { confetti } from '@/lib/confetti';

type Item = { id: string; type: 'face' | 'acc' | 'bg'; value: string; name: string; price: number };
const ITEMS = SHOP as Item[];
const GROUPS: [Item['type'], string, string][] = [['bg', '🖼️', 'Achtergronden'], ['face', '😊', 'Gezichtjes'], ['acc', '🎩', 'Spulletjes']];

// De Gloop-winkel: koop met Gloopmunten (alleen te verdienen door te spelen) iets nieuws voor je Gloop.
export default function ShopClient() {
  const acc = useAccount();
  const [, setTick] = useState(0);
  const [armed, setArmed] = useState('');
  // Munten staan alleen in de browser: pas na het laden tonen (anders verschilt de eerste weergave van de server).
  const [ready, setReady] = useState(false);
  useEffect(() => setReady(true), []);
  const D = ready ? data : {};
  useEffect(() => onSave(() => setTick((n) => n + 1)), []);
  useEffect(() => { if (!armed) return; const t = setTimeout(() => setArmed(''), 4000); return () => clearTimeout(t); }, [armed]);
  const coins = balance(D);
  const me = parseAvatar(acc.user?.avatar || '');
  const wear = (it: Item) => {
    return makeAvatar(me.color, it.type === 'face' ? it.value : me.face, it.type === 'acc' ? it.value : me.acc, it.type === 'bg' ? it.value : me.bg);
  };
  const wearing = (it: Item) => (it.type === 'bg' ? me.bg : it.type === 'face' ? me.face : me.acc) === it.value;
  const preview = (it: Item) => { const p = parseAvatar(wear(it)); return blob(p.color, p.face, 'shop-blob', false, p.acc, p.bg); };

  const buy = async (it: Item) => {
    if (!acc.user || owns(data, it.id) || balance(data) < it.price) return;
    if (armed !== it.id) { setArmed(it.id); return; }
    setArmed('');
    data.owned = [...(data.owned || []), it.id];
    save();
    sfx('sticker'); confetti(90);
    toast(`Gekocht: ${it.name}! 🎉`);
    await syncAccount();
  };
  const putOn = async (it: Item) => {
    try { await setAvatar(wear(it)); sfx('good'); toast(`Je Gloop draagt nu: ${it.name}`); } catch (e: any) { toast(e.message); }
  };

  return (
    <section className="page shop">
      <div className="shop-hero">
        <Html html={blob(me.color, me.face, 'shop-hero-blob', false, me.acc, me.bg)} />
        <div>
          <h1>Gloop-winkel</h1>
          <p className="lead">Verdien Gloopmunten door te spelen en geef je Gloop iets bijzonders! Alles hier kun je alleen in de winkel krijgen.</p>
          <p className="wallet" aria-live="polite"><span aria-hidden="true">🪙</span> <b>{coins}</b> {coins === 1 ? 'Gloopmunt' : 'Gloopmunten'}</p>
        </div>
      </div>
      <details className="shop-how">
        <summary>Hoe verdien ik Gloopmunten?</summary>
        <ul>
          <li>🎮 Elk potje: <b>5</b> munten (op Moeilijk <b>7</b>)</li>
          <li>🏆 Nieuw record: <b>+10</b></li>
          <li>🎯 Dagelijkse uitdaging gehaald: <b>+20</b></li>
          <li>⭐ Nieuwe sticker: <b>+10</b> per sticker</li>
        </ul>
        <p className="muted">Munten kun je nooit kopen met echt geld. Alleen door te spelen!</p>
      </details>
      {acc.user === null && !acc.loading && (
        <div className="account-box shop-login">
          <p className="muted">Je spaart je munten nu al! Wil je iets kopen voor je eigen Gloop? Maak dan een account met alleen een naam en een pincode.</p>
          <div className="btns"><Link className="btn btn-sun btn-sm" href="/inloggen">Inloggen of account maken</Link></div>
        </div>
      )}
      {GROUPS.map(([type, icon, title]) => (
        <section key={type} className="shop-group" aria-labelledby={'sg-' + type}>
          <h2 id={'sg-' + type}><span aria-hidden="true">{icon}</span> {title}</h2>
          <ul className="shop-grid">
            {ITEMS.filter((i) => i.type === type).map((it) => {
              const have = owns(D, it.id), can = coins >= it.price;
              return (
                <li key={it.id} className={'shop-card' + (have ? ' owned' : '')}>
                  <Html html={preview(it)} />
                  <b>{it.name}</b>
                  {have ? (
                    acc.user && wearing(it)
                      ? <span className="shop-state">✓ Draagt je Gloop</span>
                      : <button type="button" className="btn btn-plain btn-sm" disabled={!acc.user} onClick={() => putOn(it)}>Aantrekken</button>
                  ) : (
                    <button type="button" className={'btn btn-sm ' + (can && acc.user ? 'btn-sun' : 'btn-plain')} disabled={!can || !acc.user}
                      aria-label={can ? `${it.name} kopen voor ${it.price} Gloopmunten` : `${it.name}: nog ${it.price - coins} Gloopmunten nodig`}
                      onClick={() => buy(it)}>
                      {armed === it.id ? 'Zeker? Tik nog eens' : can ? <>Kopen <span aria-hidden="true">🪙</span> {it.price}</> : <>🔒 Nog <span aria-hidden="true">🪙</span> {it.price - coins}</>}
                    </button>
                  )}
                </li>
              );
            })}
          </ul>
        </section>
      ))}
      <p className="muted" style={{ marginTop: 24 }}>Spulletjes die je met stickers vrijspeelt, zoals de kroon of de heksenhoed, vind je in je <Link href="/profiel#stickers">stickerboek</Link>.</p>
    </section>
  );
}
