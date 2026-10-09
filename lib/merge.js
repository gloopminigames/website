// Samenvoegen van spelersdata (bijv. dit apparaat + account). Gebruikt door browser én server.
import {PLAYABLE} from './games';
import {ALL_KEYS,baseId} from './levels';
import {STICKER_IDS} from './stickers';
import {SHOP_IDS,shopItem} from './shop';
const IDS=PLAYABLE.map(g=>g.id);
export const LOWER_BETTER=['reactie','gloopiegolf','memo'];
const num=x=>typeof x==='number'&&isFinite(x)&&x>0&&x<1e9;
// Grenzen van wat in het spel mogelijk is, tegen nep-scores op de wereldranglijst.
const LIMITS={
  reactie:{min:100,max:5000},        // gemiddelde reactietijd in ms
  gloopiegolf:{min:9,max:400},       // 9 holes, minstens 1 slag per hole
  memo:{min:6,max:999},              // 6 of 8 paartjes, minstens 1 zet per paartje
  mepdeblob:{max:2000},stapelslijm:{max:2000},klikkerklok:{max:2000},
  blubberblast:{max:500},bubbelbots:{max:10000000},
  gloopiezegt:{max:200},              // lengte van de langste rij
  ruimte:{max:200000},
  popper:{max:100000}
};
const inRange=(id,x)=>num(x)&&x>=(LIMITS[id]?.min??1)&&x<=(LIMITS[id]?.max??1e9);
function validRec(key,r){const id=baseId(key);return id==='memo'?(r&&inRange(id,r.moves)&&num(r.time)&&r.time>=4):inRange(id,r);}
export function better(key,a,b){
  const id=baseId(key);
  if(!validRec(id,a))return validRec(id,b)?b:undefined;
  if(!validRec(id,b))return a;
  if(id==='memo')return (b.moves<a.moves||(b.moves===a.moves&&b.time<a.time))?b:a;
  return LOWER_BETTER.includes(id)?Math.min(a,b):Math.max(a,b);
}
// Alleen bekende velden met geldige waarden overhouden.
export function sanitize(d){
  const out={records:{},played:{},challengeDone:'',lastGame:'',stickers:{},recordCount:0,challengeCount:0,counts:{},coins:0,owned:[]};
  if(!d||typeof d!=='object')return out;
  for(const k of ALL_KEYS){
    const r=d.records&&d.records[k];
    if(validRec(k,r))out.records[k]=baseId(k)==='memo'?{moves:Math.round(r.moves),time:Math.round(r.time)}:Math.round(r);
  }
  for(const id of IDS){
    const p=d.played&&d.played[id];
    if(Number.isInteger(p)&&p>0&&p<1e7)out.played[id]=p;
  }
  if(typeof d.challengeDone==='string'&&/^\d{4}-\d{1,2}-\d{1,2}$/.test(d.challengeDone))out.challengeDone=d.challengeDone;
  if(typeof d.lastGame==='string'&&IDS.includes(d.lastGame))out.lastGame=d.lastGame;
  if(d.stickers&&typeof d.stickers==='object')for(const k of STICKER_IDS){const v=d.stickers[k];if(typeof v==='string'&&/^\d{4}-\d{1,2}-\d{1,2}$/.test(v))out.stickers[k]=v;}
  for(const k of ['recordCount','challengeCount']){const v=d[k];if(Number.isInteger(v)&&v>0&&v<1e6)out[k]=v;}
  // Tellers per seizoen (bijv. 'halloween-2026': aantal potjes), voor de thema-stickers.
  if(d.counts&&typeof d.counts==='object')for(const [k,v] of Object.entries(d.counts).slice(0,60))if(/^[a-z]{2,20}-\d{4}$/.test(k)&&Number.isInteger(v)&&v>0&&v<1e6)out.counts[k]=v;
  // Gloopmunten: totaal verdiend, en gekochte dingen (nooit meer dan je kunt betalen).
  if(Number.isInteger(d.coins)&&d.coins>0&&d.coins<1e7)out.coins=d.coins;
  if(Array.isArray(d.owned)){let left=out.coins;for(const id of new Set(d.owned)){const it=SHOP_IDS.includes(id)&&shopItem(id);if(it&&it.price<=left){out.owned.push(id);left-=it.price;}}}
  return out;
}
const dayNum=s=>{if(!s)return 0;const [y,m,d]=s.split('-').map(Number);return y*10000+m*100+d;};
export function mergeData(a,b){
  a=sanitize(a);b=sanitize(b);
  const out=sanitize({});
  for(const k of ALL_KEYS){const r=better(k,a.records[k],b.records[k]);if(r!==undefined)out.records[k]=r;}
  for(const id of IDS){const p=Math.max(a.played[id]||0,b.played[id]||0);if(p)out.played[id]=p;}
  out.challengeDone=dayNum(a.challengeDone)>=dayNum(b.challengeDone)?a.challengeDone:b.challengeDone;
  out.lastGame=b.lastGame||a.lastGame;
  // Stickers: alles wat je ergens hebt verdiend, met de vroegste datum.
  for(const k of new Set([...Object.keys(a.stickers),...Object.keys(b.stickers)])){
    const x=a.stickers[k],y=b.stickers[k];out.stickers[k]=!x?y:!y?x:(dayNum(x)<=dayNum(y)?x:y);
  }
  out.recordCount=Math.max(a.recordCount,b.recordCount);
  out.challengeCount=Math.max(a.challengeCount,b.challengeCount);
  out.coins=Math.max(a.coins,b.coins);
  out.owned=[...new Set([...a.owned,...b.owned])];
  for(const k of new Set([...Object.keys(a.counts),...Object.keys(b.counts)]))out.counts[k]=Math.max(a.counts[k]||0,b.counts[k]||0);
  return sanitize(out);  // nog één keer: gekochte dingen moeten betaalbaar blijven
}

// Records omzetten naar rijen voor de wereldranglijst (Memo: zetten + tijd).
export function scoreRows(records){
  return Object.entries(records||{}).map(([game,r])=>baseId(game)==='memo'?{game,score:r.moves,extra:r.time}:{game,score:r,extra:null});
}
