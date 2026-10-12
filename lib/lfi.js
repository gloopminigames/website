// Little Farm Island (Gloop Plus, 12+): opschonen en kiezen van de eilandsave.
// Gebruikt door de browser én de server (lib/merge.js). Het spel zelf staat in public/plus/little-farm-island/.
// Dezelfde kiesregel staat ook (kort) in het spel; pas die mee aan als je hier iets verandert.

const CROPS=['strawberry','carrot','sunflower','blueberry','pumpkin','starfruit'];
const DECOR=['path','fence','flowers','torch','lantern','lamppost','shrooms','tree','bench','cherry','sprinkler','scarecrow','beehive','windmill','lighthouse','fountain','statue','gazebo','balloon'];
const FISH=['sardine','snapper','koi','moonfish'];
const TOOLS=['cart','wrake','scythe','seeder'];   // gekocht gereedschap uit de Schuur
const TILE_TYPES=['grass','soil'];
// Instellingen en tellers: [soort, maximum] (getallen 0..max, teksten uit een vaste lijst).
const FIELDS={
  coins:['n',1e9],harvests:['i',1e8],bestCombo:['i',1e5],fishTotal:['i',1e7],golden:['i',1e6],tonic:['n',1e5],
  time:['n',24],h:['i',8],expansions:['i',4],level:['i',5],tier:['i',4],hint:['i',10],last:['i',4e12],gen:['i',1e6],
  musicVol:['n',1],sfxVol:['n',1],
  useGolden:['b'],rod:['b'],amb:['b'],haptics:['b'],hints:['b'],music:['b'],sound:['b'],shopHint:['b'],_fishHint:['b'],_tilledOnce:['b'],_zoomTip:['b'],farmerPicked:['b'],shedHint:['b'],
  farmer:['s',['man','woman']],quality:['s',['high','low']],dayMode:['s',['cycle','day','night']],sel:['s',CROPS]
};
const num=(x,max)=>typeof x==='number'&&isFinite(x)&&x>=0&&x<=max;

export function cleanLfi(s){
  if(!s||typeof s!=='object'||s.v!==1)return null;
  const out={v:1};
  for(const [k,[t,max]] of Object.entries(FIELDS)){
    const x=s[k];
    if(t==='b'){if(typeof x==='boolean')out[k]=x;}
    else if(t==='s'){if(max.includes(x))out[k]=x;}
    else if(num(x,max))out[k]=t==='i'?Math.round(x):x;
  }
  out.fish={};
  if(s.fish&&typeof s.fish==='object')for(const f of FISH)if(num(s.fish[f],1e7))out.fish[f]=Math.round(s.fish[f]);
  out.tools={};
  if(s.tools&&typeof s.tools==='object')for(const t of TOOLS)if(s.tools[t]===true)out.tools[t]=true;
  out.tiles={};
  if(s.tiles&&typeof s.tiles==='object'){
    for(const [key,t] of Object.entries(s.tiles).slice(0,400)){
      if(!/^-?\d{1,2},-?\d{1,2}$/.test(key)||!t||typeof t!=='object'||!TILE_TYPES.includes(t.t))continue;
      const o={t:t.t};
      const c=t.c;
      if(c&&typeof c==='object'&&CROPS.includes(c.id))o.c={id:c.id,p:num(c.p,1e6)?c.p:0,g:c.g?1:0,w:num(c.w,1e6)?c.w:0,r:num(c.r,1e6)?c.r:0};
      if(DECOR.includes(t.d)){o.d=t.d;o.r=num(t.r,3)?Math.round(t.r):0;}
      out.tiles[key]=o;
    }
  }
  return out;
}

// Welke save wint als er twee zijn (dit apparaat en het account)?
// 1. Hoogste "generatie": na Opnieuw beginnen telt het nieuwe eiland, niet het oude.
// 2. De meeste voortgang (oogsten + gevangen vissen): die telling gaat alleen omhoog,
//    dus een oud apparaat overschrijft nooit een eiland dat verder is.
// 3. Gelijk? Dan de laatst bewaarde.
export const lfiProgress=s=>(s.harvests||0)+(s.fishTotal||0);
export function pickLfi(a,b){
  a=cleanLfi(a);b=cleanLfi(b);
  if(!a)return b;if(!b)return a;
  const ga=a.gen||0,gb=b.gen||0;
  if(ga!==gb)return gb>ga?b:a;
  const pa=lfiProgress(a),pb=lfiProgress(b);
  if(pa!==pb)return pb>pa?b:a;
  return (b.last||0)>(a.last||0)?b:a;
}
