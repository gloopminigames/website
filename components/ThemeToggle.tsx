'use client';
import { useEffect, useState } from 'react';

// Licht of donker thema. Zonder keuze volgt Gloop de instelling van je apparaat.
// De keuze staat in localStorage ('gloop:theme') en wordt al vóór het tekenen toegepast (zie THEME_SCRIPT in layout).
export const THEME_KEY = 'gloop:theme';
const isDark = () => {
  const t = document.documentElement.dataset.theme;
  return t ? t === 'dark' : matchMedia('(prefers-color-scheme: dark)').matches;
};

export default function ThemeToggle() {
  const [dark, setDark] = useState<boolean | null>(null);
  useEffect(() => setDark(isDark()), []);
  const toggle = () => {
    const next = !isDark();
    document.documentElement.dataset.theme = next ? 'dark' : 'light';
    try { localStorage.setItem(THEME_KEY, next ? 'dark' : 'light'); } catch (e) {}
    setDark(next);
  };
  // Het icoontje kiest CSS (geen flits); de tekst voor schermlezers volgt na het laden.
  return (
    <button type="button" className="theme-btn" onClick={toggle}
      aria-label={dark === null ? 'Licht of donker thema' : dark ? 'Zet licht thema aan' : 'Zet donker thema aan'}
      title={dark === null ? 'Licht of donker' : dark ? 'Licht thema' : 'Donker thema'}>
      <span className="ic-moon" aria-hidden="true">🌙</span><span className="ic-sun" aria-hidden="true">☀️</span>
    </button>
  );
}
