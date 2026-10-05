'use client';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import Html from './Html';
import { blob } from '@/lib/blob';
import { data, save, wipe } from '@/lib/store';
import { toast } from '@/lib/toast';

export default function ProfileClient() {
  const [name, setName] = useState('');
  const [total, setTotal] = useState(0);
  const [armed, setArmed] = useState(false);
  const refresh = () => { setName(data.name || ''); setTotal(Object.values(data.played as Record<string, number>).reduce((a, b) => a + b, 0)); };
  useEffect(refresh, []);
  useEffect(() => { if (!armed) return; const t = setTimeout(() => setArmed(false), 4000); return () => clearTimeout(t); }, [armed]);
  const saveName = () => { data.name = name.trim().slice(0, 20); save(); toast(data.name ? `Opgeslagen, ${data.name}!` : 'Naam gewist'); };
  const doWipe = () => { if (!armed) { setArmed(true); return; } setArmed(false); wipe(); refresh(); toast('Al je gegevens zijn gewist'); };
  return (
    <section className="page">
      <h1>Profiel</h1>
      <p className="lead">Je gegevens blijven op dit apparaat.</p>
      <div className="profile-card">
        <Html html={blob('#6BE38A', 'happy', 'profile-blob')} />
        <div className="profile-form">
          <label htmlFor="nick">Jouw spelersnaam</label>
          <div className="row">
            <input className="field" id="nick" maxLength={20} value={name} onChange={(e) => setName(e.target.value)} placeholder="Bijv. SlijmKoning" autoComplete="nickname" />
            <button type="button" className="btn btn-primary" onClick={saveName}>Opslaan</button>
          </div>
          <p className="muted">Gespeelde potjes: <b>{total}</b></p>
          <p className="muted">Accounts om je voortgang overal te bewaren komen binnenkort.</p>
          <p className="muted">Kies geen echte volledige naam: een bijnaam is genoeg. Zie de <Link href="/voorwaarden">gebruiksvoorwaarden</Link>.</p>
        </div>
      </div>
      <div className="prose" style={{ marginTop: 36 }}>
        <h2>Jouw gegevens</h2>
        <p>Je spelersnaam, records en aantal gespeelde potjes staan alleen in de opslag van deze browser. Wij ontvangen ze niet. Meer hierover lees je in de <Link href="/privacy">privacyverklaring</Link>.</p>
        <button type="button" className="btn danger btn-sm" onClick={doWipe}>{armed ? 'Zeker weten? Klik nogmaals' : 'Alle gegevens wissen'}</button>
      </div>
    </section>
  );
}
