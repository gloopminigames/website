'use client';
import { useEffect, useRef, useState } from 'react';
import Html from './Html';
import { blob } from '@/lib/blob';
import { TUTORIALS } from '@/lib/tutorials';
import { data, save } from '@/lib/store';
import { sfx } from '@/lib/sfx';

type Step = { say: string; scene: string; action: 'tap' | 'taps' | 'drag' | 'next'; ok?: string; wrong?: string; early?: string; armAfter?: number; taps?: number };

// Interactieve uitleg voor de eerste keer spelen: bewegende plaatjes en zelf doen.
export default function GameTutorial({ id, color, level = 'normaal', onDone }: { id: string; color: string; level?: string; onDone: () => void }) {
  const steps: Step[] = [...(TUTORIALS as Record<string, Step[]>)[id] || [], { say: 'Klaar? Nu ben jij aan de beurt. Veel plezier!', scene: '', action: 'next' }];
  const [i, setI] = useState(0);
  const [done, setDone] = useState(false);
  const [msg, setMsg] = useState('');
  const [armed, setArmed] = useState(false);
  const [count, setCount] = useState(0);
  const [shake, setShake] = useState(false);
  const sceneRef = useRef<HTMLDivElement>(null);
  const drag = useRef<{ x: number; y: number } | null>(null);
  // Tempo: langzamer maakt alle animaties en wachttijden 1,6× zo lang. Standaard aan bij niveau Makkelijk.
  const [slow, setSlow] = useState(false);
  const tf = slow ? 1.6 : 1;
  const step = steps[i];
  const last = i === steps.length - 1;

  const boxRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    setSlow(typeof data.tutSlow === 'boolean' ? data.tutSlow : level === 'rustig');
    if (window.matchMedia('(max-width:760px)').matches) boxRef.current?.scrollIntoView({ block: 'start' });
  }, []);
  // Nieuwe stap: alles terugzetten.
  useEffect(() => {
    setDone(step.action === 'next'); setMsg(''); setCount(0); setArmed(!step.armAfter);
    sceneRef.current?.style.removeProperty('--p');
    const t = step.armAfter ? setTimeout(() => setArmed(true), step.armAfter * tf) : undefined;
    return () => { if (t) clearTimeout(t); };
  }, [i, slow]); // eslint-disable-line react-hooks/exhaustive-deps

  const say = (t: string) => setMsg(t);
  const success = () => { setDone(true); sfx('good'); say(step.ok || 'Goed zo!'); };
  const oops = (t: string) => { sfx('oops'); say(t); setShake(true); setTimeout(() => setShake(false), 450); };
  const next = () => { if (last) finish(); else setI(i + 1); };
  const finish = () => { data.tutorials = { ...(data.tutorials || {}), [id]: true }; save(); onDone(); };

  function onClick(e: React.MouseEvent) {
    if (done || step.action === 'drag') return;
    const el = e.target as HTMLElement;
    if (el.closest('.tut-wrong')) return oops(step.wrong || 'Probeer het nog eens!');
    if (!el.closest('.tut-target')) return;
    if (!armed) return oops(step.early || 'Nog even wachten!');
    if (step.action === 'taps') {
      const c = count + 1; setCount(c); sfx('tap');
      sceneRef.current?.style.setProperty('--p', String(c / (step.taps || 5)));
      if (c >= (step.taps || 5)) success();
      return;
    }
    success();
  }
  function onPointerDown(e: React.PointerEvent) {
    if (step.action !== 'drag' || done || !(e.target as HTMLElement).closest('.tut-target')) return;
    drag.current = { x: e.clientX, y: e.clientY };
    (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
  }
  function onPointerUp(e: React.PointerEvent) {
    if (!drag.current) return;
    const d = Math.hypot(e.clientX - drag.current.x, e.clientY - drag.current.y);
    drag.current = null;
    if (d > 35) success(); else oops('Houd vast en sleep een stukje naar achteren. Laat dan los!');
  }
  // Toetsenbord: Enter/spatie op de stap doet de actie, zodat het ook zonder muis kan.
  function onKey(e: React.KeyboardEvent) {
    if (step.action === 'drag' && !done && (e.key === 'Enter' || e.key === ' ')) { e.preventDefault(); success(); }
  }

  return (
    <div ref={boxRef} className="tut" role="region" aria-label="Uitleg van het spel" style={{ ['--tf' as string]: tf } as React.CSSProperties}>
      <div className="tut-top">
        <div className="tut-dots" role="img" aria-label={`Stap ${i + 1} van ${steps.length}`}>{steps.map((_, k) => <span key={k} className={k <= i ? 'on' : ''} />)}</div>
        <div className="tut-top-btns">
          <button type="button" className="tut-tempo" aria-pressed={slow} onClick={() => { const v = !slow; setSlow(v); data.tutSlow = v; save(); sfx('click'); }}>🐢 Langzamer</button>
          <button type="button" className="tut-skip" onClick={finish}>Overslaan ⏭</button>
        </div>
      </div>
      {last
        ? <div className="tut-scene tut-final"><Html html={blob(color, 'grin', 'tut-final-blob', true)} /></div>
        : <div ref={sceneRef} className={'tut-scene' + (done ? ' tut-done' : '') + (armed ? ' armed' : '') + (shake ? ' shake' : '')}
            onClick={onClick} onPointerDown={onPointerDown} onPointerUp={onPointerUp} onKeyDown={onKey}
            dangerouslySetInnerHTML={{ __html: step.scene }} />}
      <div className="tut-say">
        <p aria-live="polite">{msg || step.say}</p>
      </div>
      <div className="tut-bottom">
        <span />
        <button type="button" className={'btn btn-primary tut-next' + (done ? ' ready' : '')} onClick={next} disabled={!done}>
          {last ? 'Speel! ▶' : 'Verder ▶'}
        </button>
      </div>
    </div>
  );
}
