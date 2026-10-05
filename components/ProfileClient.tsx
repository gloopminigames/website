'use client';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import Html from './Html';
import { blob } from '@/lib/blob';
import { data, save, wipe } from '@/lib/store';
import { toast } from '@/lib/toast';
import { logout, deleteAccount, setOnBoard } from '@/lib/account';
import { useAccount } from '@/lib/useAccount';

export default function ProfileClient() {
  const [name, setName] = useState('');
  const [total, setTotal] = useState(0);
  const [armed, setArmed] = useState(false);
  const [delArmed, setDelArmed] = useState(false);
  const acc = useAccount();
  const refresh = () => { setName(data.name || ''); setTotal(Object.values(data.played as Record<string, number>).reduce((a, b) => a + b, 0)); };
  // Opnieuw tellen zodra het account geladen is (records kunnen dan bijgewerkt zijn).
  useEffect(refresh, [acc.user]);
  useEffect(() => { if (!delArmed) return; const t = setTimeout(() => setDelArmed(false), 4000); return () => clearTimeout(t); }, [delArmed]);
  const doLogout = async () => { await logout(); refresh(); toast('Je bent uitgelogd. Tot snel!'); };
  const doDelete = async () => {
    if (!delArmed) { setDelArmed(true); return; }
    setDelArmed(false);
    try { await deleteAccount(); refresh(); toast('Je account is verwijderd'); } catch (e: any) { toast(e.message); }
  };
  useEffect(() => { if (!armed) return; const t = setTimeout(() => setArmed(false), 4000); return () => clearTimeout(t); }, [armed]);
  const saveName = () => { data.name = name.trim().slice(0, 20); save(); toast(data.name ? `Opgeslagen, ${data.name}!` : 'Naam gewist'); };
  const doWipe = () => { if (!armed) { setArmed(true); return; } setArmed(false); wipe(); refresh(); toast('Al je gegevens zijn gewist'); };
  return (
    <section className="page">
      <h1>Profiel</h1>
      <p className="lead">{acc.user ? 'Je records worden bewaard bij je account.' : 'Je gegevens blijven op dit apparaat.'}</p>
      <div className="profile-card">
        <Html html={blob('#6BE38A', 'happy', 'profile-blob')} />
        <div className="profile-form">
          {acc.user ? (
            <>
              <p className="lead" style={{ margin: 0 }}>Ingelogd als <b>{acc.user.name}</b></p>
              <p className="muted">Gespeelde potjes: <b>{total}</b></p>
              <p className="muted">Je records worden bewaard bij je account. Log op een ander apparaat in met dezelfde naam en pincode om verder te spelen.</p>
              <label className="check board-toggle"><input type="checkbox" checked={acc.user.onBoard !== false} onChange={async (e) => { const on = e.target.checked; try { await setOnBoard(on); toast(on ? 'Je staat op de wereldranglijst!' : 'Je staat niet meer op de wereldranglijst'); } catch (err: any) { toast(err.message); } }} /> <span>Zet mij op de <Link href="/ranglijst">wereldranglijst</Link> (alleen je spelersnaam en je records)</span></label>
              <div><button type="button" className="btn btn-plain btn-sm" onClick={doLogout}>Uitloggen</button></div>
            </>
          ) : (
            <>
              <label htmlFor="nick">Jouw spelersnaam</label>
              <div className="row">
                <input className="field" id="nick" maxLength={20} value={name} onChange={(e) => setName(e.target.value)} placeholder="Bijv. SlijmKoning" autoComplete="nickname" />
                <button type="button" className="btn btn-primary" onClick={saveName}>Opslaan</button>
              </div>
              <p className="muted">Gespeelde potjes: <b>{total}</b></p>
              <p className="muted">Kies geen echte volledige naam: een bijnaam is genoeg. Zie de <Link href="/voorwaarden">gebruiksvoorwaarden</Link>.</p>
              {acc.available !== false && <div className="account-box"><p className="muted">Wil je je records bewaren en op elk apparaat verder spelen? Maak een account met alleen een naam en een pincode.</p><div className="btns"><Link className="btn btn-sun btn-sm" href="/inloggen">Inloggen of account maken</Link></div></div>}
            </>
          )}
        </div>
      </div>
      <div className="prose" style={{ marginTop: 36 }}>
        <h2>Jouw gegevens</h2>
        {acc.user ? (
          <>
            <p>Bij je account bewaren we alleen je spelersnaam, een versleutelde versie van je pincode en je records. Geen e-mailadres en geen echte naam. Meer hierover lees je in de <Link href="/privacy">privacyverklaring</Link>.</p>
            <button type="button" className="btn danger btn-sm" onClick={doDelete}>{delArmed ? 'Zeker weten? Klik nogmaals' : 'Account verwijderen'}</button>
          </>
        ) : (
          <>
            <p>Je spelersnaam, records en aantal gespeelde potjes staan alleen in de opslag van deze browser. Wij ontvangen ze niet. Meer hierover lees je in de <Link href="/privacy">privacyverklaring</Link>.</p>
            <button type="button" className="btn danger btn-sm" onClick={doWipe}>{armed ? 'Zeker weten? Klik nogmaals' : 'Alle gegevens wissen'}</button>
          </>
        )}
      </div>
    </section>
  );
}
