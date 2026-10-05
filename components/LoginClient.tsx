'use client';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import Html from './Html';
import PinInput from './PinInput';
import { blob } from '@/lib/blob';
import { nameError, pinError, randomName } from '@/lib/accountRules';
import { login, register } from '@/lib/account';
import { useAccount } from '@/lib/useAccount';
import { toast } from '@/lib/toast';

type Mode = 'login' | 'new';

export default function LoginClient() {
  const router = useRouter();
  const acc = useAccount();
  const [mode, setMode] = useState<Mode>('login');
  const [name, setName] = useState('');
  const [pin, setPin] = useState('');
  const [pin2, setPin2] = useState('');
  const [show, setShow] = useState(false);
  const [ok, setOk] = useState(false);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const isNew = mode === 'new';

  const switchMode = (m: Mode) => { setMode(m); setPin(''); setPin2(''); setError(''); };

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    if (isNew) {
      const err = nameError(name) || pinError(pin);
      if (err) return setError(err);
      if (pin2 !== pin) return setError('De twee pincodes zijn niet hetzelfde. Probeer het nog een keer.');
      if (!ok) return setError('Zet eerst het vinkje hieronder aan.');
    } else {
      if (!name.trim()) return setError('Vul je naam in.');
      if (pin.length !== 4 && pin.length !== 6) return setError('Vul je pincode van 4 of 6 cijfers in.');
    }
    setBusy(true);
    try {
      if (isNew) { await register(name, pin); toast(`Welkom bij Gloop, ${name.trim()}!`); }
      else { await login(name, pin); toast(`Hoi ${name.trim()}! Je bent ingelogd.`); }
      router.push('/profiel');
    } catch (err: any) {
      setError(err.message);
      if (!isNew) setPin('');
    } finally { setBusy(false); }
  }

  if (acc.user) {
    return (
      <section className="page login-page">
        <div className="login-card" style={{ textAlign: 'center' }}>
          <Html html={blob('#6BE38A', 'grin', 'login-blob')} />
          <h1>Hoi {acc.user.name}!</h1>
          <p className="lead">Je bent al ingelogd.</p>
          <Link className="btn btn-primary" href="/games">Ga spelen</Link>
        </div>
      </section>
    );
  }

  return (
    <section className="page login-page">
      <div className="login-card">
        <Html html={blob(isNew ? '#FF7AC6' : '#8B6CFF', isNew ? 'love' : 'happy', 'login-blob')} />
        <h1>{isNew ? 'Maak een account' : 'Inloggen'}</h1>
        <div className="chips login-tabs" role="group" aria-label="Kies">
          <button type="button" className="chip" aria-pressed={!isNew} onClick={() => switchMode('login')}>Inloggen</button>
          <button type="button" className="chip" aria-pressed={isNew} onClick={() => switchMode('new')}>Nieuw account</button>
        </div>
        {acc.available === false && <p className="login-error" role="alert">Inloggen is nog niet beschikbaar. Je kunt wel gewoon spelen!</p>}
        <form onSubmit={submit} noValidate>
          <label htmlFor="acc-name" className="login-label"><span className="lstep">1</span> {isNew ? 'Kies een spelersnaam' : 'Jouw spelersnaam'}</label>
          <div className="row">
            <input className="field" id="acc-name" value={name} maxLength={16} autoComplete="username" autoCapitalize="off" spellCheck={false}
              onChange={(e) => setName(e.target.value)} placeholder={isNew ? 'Bijv. SnelleKikker42' : 'Je naam'} />
            {isNew && <button type="button" className="btn btn-sun btn-sm" onClick={() => setName(randomName())}>Verzin er een</button>}
          </div>
          {isNew && <p className="muted small">Gebruik niet je echte naam. Een grappige bijnaam is veel leuker!</p>}

          <label htmlFor="acc-pin" className="login-label"><span className="lstep">2</span> {isNew ? 'Kies een pincode van 4 of 6 cijfers' : 'Jouw pincode'}</label>
          <div className="row">
            <PinInput id="acc-pin" value={pin} onChange={(v) => { setPin(v); setError(''); }} show={show} autoComplete={isNew ? 'new-password' : 'current-password'} />
            <button type="button" className="btn btn-plain btn-sm" aria-pressed={show} onClick={() => setShow(!show)}>{show ? 'Verberg' : 'Toon'}</button>
          </div>

          {isNew && (
            <>
              <label htmlFor="acc-pin2" className="login-label"><span className="lstep">3</span> Typ je pincode nog een keer</label>
              <div className="row"><PinInput id="acc-pin2" value={pin2} onChange={(v) => { setPin2(v); setError(''); }} show={show} autoComplete="new-password" /></div>
              <p className="muted small">Onthoud je pincode goed! Zonder e-mailadres kunnen we hem niet voor je terughalen. Tip: vraag je ouder om hem op te schrijven. Kies geen makkelijke code zoals 1234 of 0000.</p>
              <label className="check"><input type="checkbox" checked={ok} onChange={(e) => setOk(e.target.checked)} /> <span>Ik ben 16 jaar of ouder, of mijn ouder of verzorger vindt het goed dat ik een account maak. (<Link href="/privacy">privacy</Link>)</span></label>
            </>
          )}

          {error && <p className="login-error" role="alert">{error}</p>}
          <button type="submit" className="btn btn-primary login-go" disabled={busy || acc.available === false}>
            {busy ? 'Even geduld…' : isNew ? 'Account maken' : 'Inloggen'}
          </button>
        </form>
        <p className="muted small" style={{ textAlign: 'center' }}>Een account is niet nodig om te spelen. Met een account bewaar je je records en speel je op elk apparaat verder.</p>
      </div>
    </section>
  );
}
