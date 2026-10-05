'use client';
import { useEffect, useRef, useState } from 'react';
import { initPwa, installMode, promptInstall, subscribeInstall } from '@/lib/pwa';
import { toast } from '@/lib/toast';

// Knop "Gloop als app": op Chrome/Edge/Android de echte installatie, op iPhone/iPad en Mac een korte uitleg.
export default function InstallApp({ variant = 'button' }: { variant?: 'button' | 'banner' }) {
  const [mode, setMode] = useState<string | null>(null);
  const [hidden, setHidden] = useState(false);
  const dlg = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    initPwa();
    const upd = () => setMode(installMode());
    upd();
    try { if (variant === 'banner' && localStorage.getItem('gloop:installBanner') === 'weg') setHidden(true); } catch (e) {}
    return subscribeInstall(upd);
  }, [variant]);
  if (!mode || hidden) return null;

  const go = async () => {
    if (mode === 'prompt') { if (await promptInstall()) toast('Gloop staat nu als app op je apparaat!'); }
    else dlg.current?.showModal();
  };
  const close = () => { setHidden(true); try { localStorage.setItem('gloop:installBanner', 'weg'); } catch (e) {} };

  const howTo = (
    <dialog ref={dlg} className="install-dlg" onClick={(e) => { if (e.target === dlg.current) dlg.current?.close(); }}>
      <h2>Gloop als app</h2>
      {mode === 'ios' ? (
        <ol>
          <li>Tik onderin (of bovenin) op <b>Deel</b> <span className="ios-share" aria-hidden="true">⬆️</span></li>
          <li>Kies <b>Zet op beginscherm</b> ➕</li>
          <li>Tik op <b>Voeg toe</b>. Klaar!</li>
        </ol>
      ) : (
        <ol>
          <li>Klik bovenin op <b>Archief</b> (of op <b>Deel</b> <span aria-hidden="true">⬆️</span>)</li>
          <li>Kies <b>Voeg toe aan Dock</b></li>
          <li>Klik op <b>Voeg toe</b>. Klaar!</li>
        </ol>
      )}
      <p className="muted">Gloop staat dan tussen je andere apps, met Gloopie als icoontje.</p>
      <form method="dialog"><button className="btn btn-primary">Oké!</button></form>
    </dialog>
  );

  if (variant === 'banner') {
    return (
      <div className="install-banner">
        <img src="/icons/icon-192.png" alt="" width={56} height={56} />
        <div><b>Zet Gloop op je {mode === 'mac' ? 'computer' : 'telefoon of tablet'}</b><span>Speel met één tik, ook zonder internet.</span></div>
        <button type="button" className="btn btn-sun btn-sm" onClick={go}>Installeren</button>
        <button type="button" className="install-x" onClick={close} aria-label="Niet nu">✕</button>
        {howTo}
      </div>
    );
  }
  return (
    <>
      <button type="button" className="btn btn-plain btn-sm install-btn" onClick={go}><span aria-hidden="true">📲</span> Gloop als app</button>
      {howTo}
    </>
  );
}
