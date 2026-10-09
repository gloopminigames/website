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

// Spullen die je Gloop kan dragen (zie lib/stickers.js voor wanneer ze vrijkomen).
const ACC={
  // Hoedjes steken boven de tekening uit (negatieve y); de svg krijgt dan overflow:visible.
  pet:`<path d="M24 66 C20 12 62 -10 100 -10 C138 -10 180 12 176 66 Q100 50 24 66 Z" fill="#FF4FA8" stroke="${INK}" stroke-width="5" stroke-linejoin="round"/><path d="M60 8 Q100 -4 140 8" fill="none" stroke="#fff" stroke-width="5" stroke-linecap="round" opacity=".45"/><path d="M138 58 Q194 48 216 70 Q178 80 134 70 Z" fill="#FF4FA8" stroke="${INK}" stroke-width="5" stroke-linejoin="round"/><circle cx="100" cy="-12" r="8" fill="#FFD84A" stroke="${INK}" stroke-width="4"/>`,
  strik:`<path d="M142 22 L98 -6 L102 52 Z" fill="#FF4FA8" stroke="${INK}" stroke-width="5" stroke-linejoin="round"/><path d="M142 22 L186 -6 L182 52 Z" fill="#FF4FA8" stroke="${INK}" stroke-width="5" stroke-linejoin="round"/><circle cx="142" cy="22" r="13" fill="#FF7AC6" stroke="${INK}" stroke-width="5"/>`,
  feest:`<g transform="rotate(-10 100 34)"><path d="M58 38 L100 -50 L142 38 Z" fill="#5CC8FF" stroke="${INK}" stroke-width="5" stroke-linejoin="round"/><path d="M84 -14 L116 -14 M72 12 L128 12" stroke="#FFD84A" stroke-width="7" stroke-linecap="round"/><circle cx="100" cy="-52" r="12" fill="#FF7AC6" stroke="${INK}" stroke-width="5"/></g>`,
  koptelefoon:`<path d="M30 100 Q26 6 100 6 Q174 6 170 100" fill="none" stroke="${INK}" stroke-width="12" stroke-linecap="round"/><path d="M30 100 Q26 6 100 6 Q174 6 170 100" fill="none" stroke="#8B6CFF" stroke-width="5" stroke-linecap="round"/><rect x="10" y="78" width="34" height="54" rx="15" fill="#8B6CFF" stroke="${INK}" stroke-width="5"/><rect x="156" y="78" width="34" height="54" rx="15" fill="#8B6CFF" stroke="${INK}" stroke-width="5"/>`,
  bloem:`<g transform="translate(148 24)" stroke="${INK}" stroke-width="5"><circle cx="0" cy="-20" r="15" fill="#FF7AC6"/><circle cx="19" cy="-6" r="15" fill="#FF7AC6"/><circle cx="12" cy="17" r="15" fill="#FF7AC6"/><circle cx="-12" cy="17" r="15" fill="#FF7AC6"/><circle cx="-19" cy="-6" r="15" fill="#FF7AC6"/><circle r="11" fill="#FFD84A"/></g>`,
  kroon:`<path d="M48 42 L58 -12 L80 20 L100 -24 L120 20 L142 -12 L152 42 Z" fill="#FFD84A" stroke="${INK}" stroke-width="5" stroke-linejoin="round"/><circle cx="100" cy="26" r="7" fill="#FF4FA8" stroke="${INK}" stroke-width="3"/><circle cx="70" cy="30" r="5" fill="#5CC8FF" stroke="${INK}" stroke-width="3"/><circle cx="130" cy="30" r="5" fill="#6BE38A" stroke="${INK}" stroke-width="3"/>`,
  // Ruimtehelm: een glazen bol om de hele Gloop, met antenne. Heksenhoed: voor het Halloween-album.
  helm:`<ellipse cx="100" cy="98" rx="98" ry="92" fill="#BDEBFF" fill-opacity=".22" stroke="${INK}" stroke-width="5"/><path d="M34 70 Q46 30 86 18" fill="none" stroke="#fff" stroke-width="7" stroke-linecap="round" opacity=".8"/><path d="M40 92 Q40 84 44 78" fill="none" stroke="#fff" stroke-width="6" stroke-linecap="round" opacity=".7"/><path d="M100 6 L100 -24" stroke="${INK}" stroke-width="5" stroke-linecap="round"/><circle cx="100" cy="-30" r="10" fill="#FF7AC6" stroke="${INK}" stroke-width="5"/>`,
  heks:`<path d="M58 38 L88 -26 Q98 -54 136 -60 Q114 -40 116 -20 L142 38 Z" fill="#3A2C6B" stroke="${INK}" stroke-width="5" stroke-linejoin="round"/><path d="M68 18 Q100 10 134 18 L138 32 Q100 24 64 32 Z" fill="#FF9F5A" stroke="${INK}" stroke-width="4" stroke-linejoin="round"/><rect x="92" y="13" width="16" height="16" rx="3" fill="#FFD84A" stroke="${INK}" stroke-width="3"/><ellipse cx="100" cy="40" rx="78" ry="14" fill="#3A2C6B" stroke="${INK}" stroke-width="5"/><path d="M128 -38 l3 6 6 1 -5 4 1 6 -5 -3 -5 3 1 -6 -5 -4 6 -1 z" fill="#FFD84A"/>`,
  mijter:`<path d="M62 40 L62 -6 Q66 -44 100 -66 Q134 -44 138 -6 L138 40 Z" fill="#D6304A" stroke="${INK}" stroke-width="5" stroke-linejoin="round"/><path d="M100 -64 L100 40" stroke="#FFD84A" stroke-width="7"/><path d="M62 24 L138 24 L138 40 L62 40 Z" fill="#FFD84A" stroke="${INK}" stroke-width="4" stroke-linejoin="round"/><path d="M90 -14 H110 M100 -26 V0" stroke="#FFD84A" stroke-width="7" stroke-linecap="round"/><path d="M90 -14 H110 M100 -26 V0" stroke="${INK}" stroke-width="2" stroke-linecap="round" opacity=".35"/>`,
  tovenaar:`<path d="M54 36 L122 -62 L148 36 Z" fill="#6A4BEB" stroke="${INK}" stroke-width="5" stroke-linejoin="round"/><ellipse cx="100" cy="38" rx="70" ry="13" fill="#6A4BEB" stroke="${INK}" stroke-width="5"/><path d="M104 -8 l4 9 9 1 -7 6 2 9 -8 -5 -8 5 2 -9 -7 -6 9 -1 z" fill="#FFD84A"/><circle cx="126" cy="14" r="4" fill="#FFD84A"/><circle cx="86" cy="18" r="3" fill="#FFD84A"/>`
};
export function blob(color,face,cls,crown,acc){
  const f=FACES[face]||FACES.happy;
  const eyes=f[0]==='cool'?GLASSES:eye(78,f[0])+eye(122,f[1]);
  const hasAcc=acc&&ACC[acc];
  return `<svg class="${cls||''}${hasAcc?' has-acc':''}" viewBox="0 0 200 200" aria-hidden="true" focusable="false"${hasAcc?' style="overflow:visible"':''}><path d="${BODY}" fill="${color}" stroke="${INK}" stroke-width="5" stroke-linejoin="round"/><ellipse cx="64" cy="58" rx="17" ry="10" transform="rotate(-32 64 58)" fill="#fff" opacity=".75"/><circle cx="90" cy="44" r="5" fill="#fff" opacity=".75"/><ellipse cx="54" cy="128" rx="10" ry="6" fill="#FF4FA8" opacity=".35"/><ellipse cx="146" cy="128" rx="10" ry="6" fill="#FF4FA8" opacity=".35"/>${eyes}${MOUTH[f[2]]}${crown?CROWN:''}${hasAcc?ACC[acc]:''}</svg>`;
}

export const ICON={
  check:'<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12l5 5 9-10"/></svg>',
  play:'<svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true"><path d="M8 5v14l11-7z" fill="#fff" stroke="#fff" stroke-width="2" stroke-linejoin="round"/></svg>',
  search:'<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" aria-hidden="true"><circle cx="11" cy="11" r="7"/><path d="M20 20l-4-4"/></svg>',
  share:'<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 3v12M7 8l5-5 5 5"/><path d="M5 13v6a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-6"/></svg>',
  back:'<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M15 5l-7 7 7 7"/></svg>'
};

