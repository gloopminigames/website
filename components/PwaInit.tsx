'use client';
import { useEffect, useState } from 'react';
import { initPwa, isStandalone, hasUpdate, subscribeInstall } from '@/lib/pwa';
import { LOADERS } from '@/lib/engine';

// Start de service worker. In de app (geïnstalleerd) halen we alle games alvast op, zodat ze ook offline werken.
export default function PwaInit() {
  const [update, setUpdate] = useState(false);
  useEffect(() => subscribeInstall(() => setUpdate(hasUpdate())), []);
  useEffect(() => {
    initPwa();
    if (!isStandalone()) return;
    const run = () => Object.values(LOADERS).forEach((load: () => Promise<unknown>) => load().catch(() => {}));
    const w = window as any;
    const id = w.requestIdleCallback ? w.requestIdleCallback(run, { timeout: 8000 }) : setTimeout(run, 4000);
    return () => { if (w.cancelIdleCallback) w.cancelIdleCallback(id); else clearTimeout(id); };
  }, []);
  if (!update) return null;
  // Melding in plaats van zelf herladen: zo raakt niemand midden in een potje zijn spel kwijt.
  return (
    <div className="update-bar" role="status">
      <span><span aria-hidden="true">✨</span> Er is een nieuwe versie van Gloop</span>
      <button type="button" className="btn btn-sun btn-sm" onClick={() => location.reload()}>Vernieuwen</button>
      <button type="button" className="update-x" onClick={() => setUpdate(false)} aria-label="Later">✕</button>
    </div>
  );
}
