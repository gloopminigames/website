'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { navKey } from './Header';

const I = (d: React.ReactNode) => (
  <svg viewBox="0 0 24 24" width="26" height="26" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{d}</svg>
);

export default function Tabbar() {
  const path = usePathname() || '/';
  const cur = navKey(path);
  // Tijdens het spelen geen menubalk over het speelveld.
  if (/^\/games\/./.test(path)) return null;
  const items: [string, string, string, React.ReactNode][] = [
    ['/', 'home', 'Home', <path key="h" d="M3 11l9-7 9 7v9a1 1 0 0 1-1 1h-5v-6h-6v6H4a1 1 0 0 1-1-1z" />],
    ['/games', 'games', 'Games', <g key="g"><rect x="3" y="3" width="7" height="7" rx="2" /><rect x="14" y="3" width="7" height="7" rx="2" /><rect x="3" y="14" width="7" height="7" rx="2" /><rect x="14" y="14" width="7" height="7" rx="2" /></g>],
    ['/ranglijst', 'ranglijst', 'Ranglijst', <g key="r"><path d="M8 21h8M12 17v4M7 4h10v5a5 5 0 0 1-10 0z" /><path d="M17 5h3v2a3 3 0 0 1-3 3M7 5H4v2a3 3 0 0 0 3 3" /></g>],
    ['/profiel', 'profiel', 'Profiel', <g key="p"><circle cx="12" cy="8" r="4" /><path d="M4 21c0-4 4-6 8-6s8 2 8 6" /></g>],
  ];
  return (
    <nav className="tabbar" aria-label="Menu onderin">
      {items.map(([href, key, label, icon]) => (
        <Link key={key} href={href} aria-current={cur === key ? 'page' : undefined}>{I(icon)}{label}</Link>
      ))}
    </nav>
  );
}
