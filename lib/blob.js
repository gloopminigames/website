const INK='#221A48';
const BODY='M100 20 C152 20 180 58 180 106 C180 134 174 152 166 162 C160 170 158 184 150 184 C142 184 142 170 134 170 C126 170 126 180 118 180 C110 180 110 168 100 168 C90 168 90 188 80 188 C70 188 72 170 62 170 C52 170 48 180 40 176 C28 168 20 144 20 106 C20 58 48 20 100 20 Z';

function eye(cx,t){
  if(t==='open') return `<ellipse cx="${cx}" cy="100" rx="15" ry="18" fill="#fff" stroke="${INK}" stroke-width="4"/><circle cx="${cx+4}" cy="104" r="8" fill="${INK}"/><circle cx="${cx+7}" cy="100" r="2.6" fill="#fff"/>`;
  if(t==='closed') return `<path d="M${cx-14} 100 Q${cx} 112 ${cx+14} 100" fill="none" stroke="${INK}" stroke-width="5" stroke-linecap="round"/>`;
  if(t==='happy') return `<path d="M${cx-14} 106 Q${cx} 88 ${cx+14} 106" fill="none" stroke="${INK}" stroke-width="5" stroke-linecap="round"/>`;
  if(t==='heart') return `<path d="M${cx} 114 C${cx-22} 100 ${cx-14} 82 ${cx} 94 C${cx+14} 82 ${cx+22} 100 ${cx} 114 Z" fill="#FF4FA8" stroke="${INK}" stroke-width="4" stroke-linejoin="round"/>`;
  return '';
}
const GLASSES=`<rect x="56" y="88" width="40" height="24" rx="10" fill="${INK}"/><rect x="104" y="88" width="40" height="24" rx="10" fill="${INK}"/><path d="M96 96 H104" stroke="${INK}" stroke-width="5"/><path d="M63 94 L73 94" stroke="#fff" stroke-width="3" stroke-linecap="round" opacity=".6"/><path d="M111 94 L121 94" stroke="#fff" stroke-width="3" stroke-linecap="round" opacity=".6"/>`;
const OPEN=`<path d="M86 127 Q100 150 114 127 Z" fill="${INK}" stroke="${INK}" stroke-width="4" stroke-linejoin="round"/>`;
const MOUTH={
  smile:`<path d="M88 130 Q100 144 112 130" fill="none" stroke="${INK}" stroke-width="5" stroke-linecap="round"/>`,
  open:OPEN,
  o:`<ellipse cx="100" cy="134" rx="8" ry="10" fill="${INK}"/>`,
  tongue:OPEN+`<path d="M92 136 Q100 132 108 136 L108 142 Q100 152 92 142 Z" fill="#FF7AC6" stroke="${INK}" stroke-width="3" stroke-linejoin="round"/>`,
  sad:`<path d="M88 140 Q100 127 112 140" fill="none" stroke="${INK}" stroke-width="5" stroke-linecap="round"/>`,
  small:`<path d="M92 132 Q100 138 108 132" fill="none" stroke="${INK}" stroke-width="5" stroke-linecap="round"/>`
};
const FACES={happy:['open','open','smile'],grin:['happy','happy','open'],wink:['open','happy','smile'],surprised:['open','open','o'],sleepy:['closed','closed','small'],tongue:['open','open','tongue'],cool:['cool','cool','smile'],love:['heart','heart','open'],sad:['open','open','sad']};
const CROWN=`<path d="M66 32 L76 8 L88 26 L100 4 L112 26 L124 8 L134 32 Z" fill="#FFD84A" stroke="${INK}" stroke-width="5" stroke-linejoin="round"/>`;

export function blob(color,face,cls,crown){
  const f=FACES[face]||FACES.happy;
  const eyes=f[0]==='cool'?GLASSES:eye(78,f[0])+eye(122,f[1]);
  return `<svg class="${cls||''}" viewBox="0 0 200 200" aria-hidden="true" focusable="false"><path d="${BODY}" fill="${color}" stroke="${INK}" stroke-width="5" stroke-linejoin="round"/><ellipse cx="64" cy="58" rx="17" ry="10" transform="rotate(-32 64 58)" fill="#fff" opacity=".75"/><circle cx="90" cy="44" r="5" fill="#fff" opacity=".75"/><ellipse cx="54" cy="128" rx="10" ry="6" fill="#FF4FA8" opacity=".35"/><ellipse cx="146" cy="128" rx="10" ry="6" fill="#FF4FA8" opacity=".35"/>${eyes}${MOUTH[f[2]]}${crown?CROWN:''}</svg>`;
}

export const ICON={
  check:'<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12l5 5 9-10"/></svg>',
  play:'<svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true"><path d="M8 5v14l11-7z" fill="#fff" stroke="#fff" stroke-width="2" stroke-linejoin="round"/></svg>',
  search:'<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" aria-hidden="true"><circle cx="11" cy="11" r="7"/><path d="M20 20l-4-4"/></svg>',
  share:'<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 3v12M7 8l5-5 5 5"/><path d="M5 13v6a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-6"/></svg>',
  back:'<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M15 5l-7 7 7 7"/></svg>'
};

