'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { data, onSave } from '@/lib/store';
import { balance } from '@/lib/shop';
import Logo from './Logo';
import Html from './Html';
import { avatarSvg } from '@/lib/avatar';
import { blob } from '@/lib/blob';
import { useAccount } from '@/lib/useAccount';

export function navKey(path: string) {
  const p = path.split('/')[1] || 'home';
  return p;
}

export default function Header() {
  const path = usePathname() || '/';
  const cur = navKey(path);
  const acc = useAccount();
  // Gloopmunten: bijwerken na elk potje of elke aankoop.
  const [coins, setCoins] = useState<number | null>(null);
  useEffect(() => { const upd = () => setCoins(balance(data)); upd(); return onSave(upd); }, [acc.user]);
  useEffect(() => {
    const logo = document.getElementById('logoWord');
    if (!logo) return;
    let raf = 0;
    const onMove = (e: PointerEvent) => {
      if (raf) return;
      raf = requestAnimationFrame(() => {
        raf = 0;
        const r = logo.getBoundingClientRect();
        const dx = Math.max(-1, Math.min(1, (e.clientX - (r.left + r.width / 2)) / 400));
        const dy = Math.max(-1, Math.min(1, (e.clientY - (r.top + r.height / 2)) / 300));
        logo.style.setProperty('--px', (dx * 0.08).toFixed(3) + 'em');
        logo.style.setProperty('--py', (dy * 0.08).toFixed(3) + 'em');
      });
    };
    window.addEventListener('pointermove', onMove, { passive: true });
    return () => window.removeEventListener('pointermove', onMove);
  }, []);
  const link = (href: string, key: string, label: string) => (
    <Link href={href} aria-current={cur === key ? 'page' : undefined}>{label}</Link>
  );
  return (
    <header className="topbar">
      <div className="wrap topbar-in">
        <Link href="/" className="logo" aria-label="Gloop, naar home"><Logo id="logoWord" /></Link>
        <nav className="topnav" aria-label="Hoofdmenu">
          {link('/games', 'games', 'Games')}
          {link('/ranglijst', 'ranglijst', 'Ranglijst')}
          {link('/profiel', 'profiel', 'Profiel')}
        </nav>
        {coins !== null && <Link href="/winkel" className="coin-pill" aria-current={cur === 'winkel' ? 'page' : undefined} aria-label={`Gloop-winkel: je hebt ${coins} Gloopmunten`}><span aria-hidden="true">🪙</span> {coins}</Link>}
        <Link href={acc.user ? '/profiel' : '/inloggen'} className="btn btn-plain btn-sm login">{acc.user ? <><Html html={avatarSvg(acc.user.avatar, 'login-mini')} />{acc.user.name}</> : 'Inloggen'}</Link>
      </div>
    </header>
  );
}
