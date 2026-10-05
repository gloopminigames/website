'use client';
import { useEffect } from 'react';
import { initPwa, isStandalone } from '@/lib/pwa';
import { LOADERS } from '@/lib/engine';

// Start de service worker. In de app (geïnstalleerd) halen we alle games alvast op, zodat ze ook offline werken.
export default function PwaInit() {
  useEffect(() => {
    initPwa();
    if (!isStandalone()) return;
    const run = () => Object.values(LOADERS).forEach((load: () => Promise<unknown>) => load().catch(() => {}));
    const w = window as any;
    const id = w.requestIdleCallback ? w.requestIdleCallback(run, { timeout: 8000 }) : setTimeout(run, 4000);
    return () => { if (w.cancelIdleCallback) w.cancelIdleCallback(id); else clearTimeout(id); };
  }, []);
  return null;
}
