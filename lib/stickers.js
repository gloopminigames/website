// Stickerboek: verdien stickers door te spelen. Met meer stickers speel je spullen voor je Gloop vrij.
import {PLAYABLE} from './games';
import {data} from './store';
import {recKey} from './levels';

// Beste record over "normaal" en "snel" (rustig telt niet mee voor de knappe-score-stickers).
function best(id,lower){
  const vals=[data.records[recKey(id,'normaal')],data.records[recKey(id,'snel')]].filter(v=>v!=null);
  if(!vals.length)return null;
  if(id==='memo')return vals.reduce((a,b)=>b.moves<a.moves?b:a);
  return lower?Math.min(...vals):Math.max(...vals);
}
const total=()=>Object.values(data.played||{}).reduce((a,b)=>a+b,0);
const T=id=>PLAYABLE.find(g=>g.id===id)?.title||id;

const FAN={mepdeblob:'🔨',reactie:'⚡',memo:'🃏',bubbelbots:'🤖',stapelslijm:'🧱',klikkerklok:'⏰',blubberblast:'💨',gloopiegolf:'⛳'};
const TOP=[
  ['mepdeblob','💥','Meppermeester','Haal 40 punten in Mep de Blob',()=>best('mepdeblob')>=40],
  ['reactie','🚀','Bliksemsnel','Haal gemiddeld 300 ms of sneller in Reactie Rush',()=>best('reactie',true)!=null&&best('reactie',true)<=300],
  ['memo','🧠','Geheugenkampioen','Vind alle paartjes in Memo Mania in 12 zetten',()=>{const b=best('memo');return b&&b.moves<=12;}],
  ['bubbelbots','🎆','Botknaller','Haal 1.000 punten in Bubbel Bots',()=>best('bubbelbots')>=1000],
  ['stapelslijm','🗼','Torenbouwer','Bouw een toren van 20 lagen in Stapelslijm',()=>best('stapelslijm')>=20],
  ['klikkerklok','⏱️','Precisieprof','Haal 20 klikken in Klikkerklok',()=>best('klikkerklok')>=20],
  ['blubberblast','🌪️','Blaaskaak','Win 2 rondes op rij tegen Gloopie in Blubber Blast',()=>best('blubberblast')>=2],
  ['gloopiegolf','🏌️','Golfkanjer','Speel Gloopie Golf in 32 slagen of minder',()=>best('gloopiegolf',true)!=null&&best('gloopiegolf',true)<=32]
];

export const STICKERS=[
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
export const STICKER_IDS=STICKERS.map(s=>s.id);
export const stickerCount=d=>Object.keys((d||data).stickers||{}).filter(k=>STICKER_IDS.includes(k)).length;

// Kijk welke stickers er nu bij komen. Geeft de nieuwe stickers terug (en bewaart ze in data).
export function checkStickers(){
  data.stickers=data.stickers||{};
  const d=new Date(),day=d.getFullYear()+'-'+(d.getMonth()+1)+'-'+d.getDate();
  const fresh=[];
  for(const s of STICKERS){if(!data.stickers[s.id]&&s.test()){data.stickers[s.id]=day;fresh.push(s);}}
  return fresh;
}

// Spullen voor je Gloop, vrij te spelen met stickers.
export const ACCESSORIES=[
  {id:'none',name:'Niets',need:0},{id:'pet',name:'Petje',need:2},{id:'strik',name:'Strik',need:4},{id:'feest',name:'Feesthoed',need:6},
  {id:'koptelefoon',name:'Koptelefoon',need:9},{id:'bloem',name:'Bloem',need:12},{id:'kroon',name:'Kroon',need:16},{id:'tovenaar',name:'Tovenaarshoed',need:22}
];
