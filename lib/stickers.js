// Stickerboek: verdien stickers door te spelen. Met meer stickers speel je spullen voor je Gloop vrij.
import {PLAYABLE} from './games';
import {data} from './store';
import {recKey} from './levels';

// Beste record over Normaal en Moeilijk (Makkelijk telt niet mee voor de knappe-score-stickers).
function best(id,lower){
  const vals=[data.records[recKey(id,'normaal')],data.records[recKey(id,'snel')]].filter(v=>v!=null);
  if(!vals.length)return null;
  if(id==='memo')return vals.reduce((a,b)=>b.moves<a.moves?b:a);
  return lower?Math.min(...vals):Math.max(...vals);
}
const total=()=>Object.values(data.played||{}).reduce((a,b)=>a+b,0);
const T=id=>PLAYABLE.find(g=>g.id===id)?.title||id;

const FAN={mepdeblob:'🔨',reactie:'⚡',memo:'🃏',bubbelbots:'🤖',stapelslijm:'🧱',klikkerklok:'⏰',blubberblast:'💨',gloopiegolf:'⛳',gloopiezegt:'🎶',ruimte:'🚀'};
const TOP=[
  ['mepdeblob','💥','Meppermeester','Haal 40 punten in Mep de Blob',()=>best('mepdeblob')>=40],
  ['reactie','🚀','Bliksemsnel','Haal gemiddeld 300 ms of sneller in Reactie Rush',()=>best('reactie',true)!=null&&best('reactie',true)<=300],
  ['memo','🧠','Geheugenkampioen','Vind alle paartjes in Memo Mania in 12 zetten',()=>{const b=best('memo');return b&&b.moves<=12;}],
  ['bubbelbots','🎆','Botknaller','Haal 1.000 punten in Bubbel Bots',()=>best('bubbelbots')>=1000],
  ['stapelslijm','🗼','Torenbouwer','Bouw een toren van 20 lagen in Stapelslijm',()=>best('stapelslijm')>=20],
  ['klikkerklok','⏱️','Precisieprof','Haal 20 klikken in Klikkerklok',()=>best('klikkerklok')>=20],
  ['blubberblast','🌪️','Blaaskaak','Win 2 rondes op rij tegen Gloopie in Blubber Blast',()=>best('blubberblast')>=2],
  ['ruimte','🪐','Ruimtevaarder','Haal 1.000 punten in Gloop in de Ruimte',()=>best('ruimte')>=1000],
  ['gloopiezegt','🎵','Geheugenheld','Onthoud een rij van 10 in Gloopie Zegt',()=>best('gloopiezegt')>=10],
  ['gloopiegolf','🏌️','Golfkanjer','Speel Gloopie Golf in 32 slagen of minder',()=>best('gloopiegolf',true)!=null&&best('gloopiegolf',true)<=32]
];

// ============================================================
// THEMA'S (albums in het stickerboek)
//   from/to : 'MM-DD' -> seizoensthema, alleen dan te verdienen (komt elk jaar terug). Zonder: altijd.
//   reward  : spulletje voor je Gloop als het album vol is (zie ACCESSORIES en lib/blob.js).
// Nieuwe sticker in een thema? Geef hem theme:'<id>'. Een test krijgt het potje mee: e={game,level,r} (r = resultaat).
// ============================================================
export const THEMES=[
  {id:'basis',name:'Basis',emoji:'⭐',color:'#6A4BEB'},
  {id:'ruimte',name:'Ruimte',emoji:'🚀',color:'#3B2D8F',reward:'helm'},
  {id:'halloween',name:'Halloween',emoji:'🎃',color:'#FF9F5A',text:'#221A48',from:'10-01',to:'11-03',reward:'heks',season:'1 oktober t/m 3 november'}
];
const md=d=>String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0');
// Is een seizoensthema nu bezig? (werkt ook als het over de jaarwisseling loopt, bijv. 12-15 t/m 01-06)
export function themeActive(t,d=new Date()){
  if(!t.from)return true;
  const m=md(d);
  return t.from<=t.to?(m>=t.from&&m<=t.to):(m>=t.from||m<=t.to);
}
// Teller per seizoen per jaar, bijv. 'halloween-2026'.
export function seasonKey(t,d=new Date()){return t.id+'-'+(t.from>t.to&&md(d)<=t.to?d.getFullYear()-1:d.getFullYear());}
const TH=id=>THEMES.find(t=>t.id===id);
const inSeason=id=>themeActive(TH(id));
const seasonPlays=id=>(data.counts||{})[seasonKey(TH(id))]||0;
const planetsIn=(e,game='ruimte')=>e&&e.game===game&&e.r?e.r.planets||0:0;

const RUIMTE=[
  {id:'rt_maan',emoji:'🌙',name:'Maanlander',hint:'Vlieg tot de Maan in Gloop in de Ruimte',test:e=>planetsIn(e)>=1},
  {id:'rt_mars',emoji:'🔴',name:'Marsreiziger',hint:'Vlieg tot Mars',test:e=>planetsIn(e)>=2},
  {id:'rt_jupiter',emoji:'🌀',name:'Reuzenspotter',hint:'Vlieg tot Jupiter',test:e=>planetsIn(e)>=3},
  {id:'rt_saturnus',emoji:'💫',name:'Ringenrijder',hint:'Vlieg tot Saturnus',test:e=>planetsIn(e)>=4},
  {id:'rt_neptunus',emoji:'🔵',name:'Verre verkenner',hint:'Vlieg helemaal tot Neptunus',test:e=>planetsIn(e)>=6},
  {id:'rt_sterren',emoji:'🌟',name:'Sterrenvanger',hint:'Pak 15 sterren in één vlucht',test:e=>e&&e.game==='ruimte'&&(e.r?.stars||0)>=15},
  {id:'rt_aliens',emoji:'👽',name:'Hallo aliens!',hint:'Vlieg nog verder dan Neptunus…',secret:true,test:e=>planetsIn(e)>=7}
];
const HALLOWEEN=[
  {id:'hw_pompoen',emoji:'🎃',name:'Pompoenplukker',hint:'Speel een potje tijdens Halloween',test:()=>inSeason('halloween')&&seasonPlays('halloween')>=1},
  {id:'hw_spook',emoji:'👻',name:'Spokenjager',hint:'Haal 30 punten in Mep de Blob tijdens Halloween',test:e=>inSeason('halloween')&&e&&e.game==='mepdeblob'&&(e.r?.score||0)>=30},
  {id:'hw_vleermuis',emoji:'🦇',name:'Vleermuisvlucht',hint:'Vlieg tot Mars in Gloop in de Ruimte tijdens Halloween',test:e=>inSeason('halloween')&&planetsIn(e)>=2},
  {id:'hw_spin',emoji:'🕸️',name:'Griezelgeheugen',hint:'Speel Memo Mania uit tijdens Halloween',test:e=>inSeason('halloween')&&e&&e.game==='memo'},
  {id:'hw_snoep',emoji:'🍬',name:'Snoepverzamelaar',hint:'Speel 15 potjes tijdens Halloween',test:()=>inSeason('halloween')&&seasonPlays('halloween')>=15},
  {id:'hw_heks',emoji:'🧙',name:'Kleine heks',hint:'Haal een dagelijkse uitdaging tijdens Halloween',secret:true,test:e=>inSeason('halloween')&&Boolean(e&&e.challenge)}
];

const BASIS=[
  {id:'eerste',emoji:'🎉',name:'Eerste potje',hint:'Speel je eerste potje',test:()=>total()>=1},
  {id:'ontdekker',emoji:'🧭',name:'Ontdekker',hint:'Speel elke game minstens één keer',test:()=>PLAYABLE.every(g=>(data.played||{})[g.id])},
  {id:'potjes25',emoji:'🎮',name:'Spelletjesfan',hint:'Speel 25 potjes',test:()=>total()>=25},
  {id:'potjes100',emoji:'🏅',name:'Echte Gloopster',hint:'Speel 100 potjes',test:()=>total()>=100},
  {id:'record5',emoji:'📈',name:'Recordbreker',hint:'Haal 5 keer een nieuw record',test:()=>(data.recordCount||0)>=5},
  {id:'uitdaging1',emoji:'🎯',name:'Uitdaging gehaald',hint:'Haal een dagelijkse uitdaging',test:()=>(data.challengeCount||0)>=1},
  {id:'uitdaging5',emoji:'🏆',name:'Uitdagingskampioen',hint:'Haal 5 dagelijkse uitdagingen',test:()=>(data.challengeCount||0)>=5},
  ...PLAYABLE.map(g=>({id:'fan_'+g.id,emoji:FAN[g.id]||'⭐',name:T(g.id)+'-fan',hint:`Speel ${T(g.id)} 10 keer`,test:()=>((data.played||{})[g.id]||0)>=10})),
  ...TOP.map(([id,emoji,name,hint,test])=>({id:'top_'+id,emoji,name,hint,test}))
];
// De Ruimte-stickers die er al waren (fan en topscore) horen nu in het Ruimte-album.
const RUIMTE_IDS=['fan_ruimte','top_ruimte'];
export const STICKERS=[
  ...BASIS.filter(s=>!RUIMTE_IDS.includes(s.id)).map(s=>({...s,theme:'basis'})),
  ...BASIS.filter(s=>RUIMTE_IDS.includes(s.id)).concat(RUIMTE).map(s=>({...s,theme:'ruimte'})),
  ...HALLOWEEN.map(s=>({...s,theme:'halloween'}))
];
export const STICKER_IDS=STICKERS.map(s=>s.id);
export const stickerCount=d=>Object.keys((d||data).stickers||{}).filter(k=>STICKER_IDS.includes(k)).length;
export const themeStickers=id=>STICKERS.filter(s=>s.theme===id);
export const themeDone=(id,d)=>themeStickers(id).every(s=>((d||data).stickers||{})[s.id]);

// Na elk potje: tellers bijwerken en kijken welke stickers er nu bij komen. Geeft de nieuwe stickers terug (en bewaart ze in data).
// e = {game, level, r, challenge} van het potje dat net klaar is (leeg = alleen de algemene stickers controleren).
export function checkStickers(e){
  data.stickers=data.stickers||{};
  if(e){
    data.counts=data.counts||{};
    for(const t of THEMES)if(t.from&&themeActive(t)){const k=seasonKey(t);data.counts[k]=(data.counts[k]||0)+1;}
  }
  const d=new Date(),day=d.getFullYear()+'-'+(d.getMonth()+1)+'-'+d.getDate();
  const fresh=[];
  for(const s of STICKERS){if(!data.stickers[s.id]&&s.test(e)){data.stickers[s.id]=day;fresh.push(s);}}
  return fresh;
}

// Spullen voor je Gloop, vrij te spelen met stickers.
// need: aantal stickers. theme: vrij als dat album helemaal vol is.
export const ACCESSORIES=[
  {id:'none',name:'Niets',need:0},{id:'pet',name:'Petje',need:2},{id:'strik',name:'Strik',need:4},{id:'feest',name:'Feesthoed',need:6},
  {id:'koptelefoon',name:'Koptelefoon',need:9},{id:'bloem',name:'Bloem',need:12},{id:'kroon',name:'Kroon',need:16},{id:'tovenaar',name:'Tovenaarshoed',need:22},
  {id:'helm',name:'Ruimtehelm',theme:'ruimte'},{id:'heks',name:'Heksenhoed',theme:'halloween'}
];
export const accUnlocked=(a,d)=>a.theme?themeDone(a.theme,d):stickerCount(d)>=a.need;
export function accLockText(a,d){
  if(a.theme){const t=TH(a.theme),left=themeStickers(a.theme).filter(s=>!((d||data).stickers||{})[s.id]).length;return `Maak het ${t.name}-album vol (nog ${left})`;}
  const left=a.need-stickerCount(d);return `Nog ${left} ${left===1?'sticker':'stickers'}`;
}
