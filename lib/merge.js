// Samenvoegen van spelersdata (bijv. dit apparaat + account). Gebruikt door browser én server.
import {PLAYABLE} from './games';
const IDS=PLAYABLE.map(g=>g.id);
export const LOWER_BETTER=['reactie','gloopiegolf','memo'];
const num=x=>typeof x==='number'&&isFinite(x)&&x>0&&x<1e9;
// Grenzen van wat in het spel mogelijk is, tegen nep-scores op de wereldranglijst.
const LIMITS={
  reactie:{min:100,max:5000},        // gemiddelde reactietijd in ms
  gloopiegolf:{min:9,max:400},       // 9 holes, minstens 1 slag per hole
  memo:{min:8,max:999},              // 8 paartjes, minstens 8 zetten
  mepdeblob:{max:2000},stapelslijm:{max:2000},klikkerklok:{max:2000},
  blubberblast:{max:500},bubbelbots:{max:10000000}
};
const inRange=(id,x)=>num(x)&&x>=(LIMITS[id]?.min??1)&&x<=(LIMITS[id]?.max??1e9);
function validRec(id,r){return id==='memo'?(r&&inRange(id,r.moves)&&num(r.time)&&r.time>=4):inRange(id,r);}
export function better(id,a,b){
  if(!validRec(id,a))return validRec(id,b)?b:undefined;
  if(!validRec(id,b))return a;
  if(id==='memo')return (b.moves<a.moves||(b.moves===a.moves&&b.time<a.time))?b:a;
  return LOWER_BETTER.includes(id)?Math.min(a,b):Math.max(a,b);
}
// Alleen bekende velden met geldige waarden overhouden.
export function sanitize(d){
  const out={records:{},played:{},challengeDone:'',lastGame:''};
  if(!d||typeof d!=='object')return out;
  for(const id of IDS){
    const r=d.records&&d.records[id];
    if(validRec(id,r))out.records[id]=id==='memo'?{moves:Math.round(r.moves),time:Math.round(r.time)}:Math.round(r);
    const p=d.played&&d.played[id];
    if(Number.isInteger(p)&&p>0&&p<1e7)out.played[id]=p;
  }
  if(typeof d.challengeDone==='string'&&/^\d{4}-\d{1,2}-\d{1,2}$/.test(d.challengeDone))out.challengeDone=d.challengeDone;
  if(typeof d.lastGame==='string'&&IDS.includes(d.lastGame))out.lastGame=d.lastGame;
  return out;
}
const dayNum=s=>{if(!s)return 0;const [y,m,d]=s.split('-').map(Number);return y*10000+m*100+d;};
export function mergeData(a,b){
  a=sanitize(a);b=sanitize(b);
  const out=sanitize({});
  for(const id of IDS){
    const r=better(id,a.records[id],b.records[id]);if(r!==undefined)out.records[id]=r;
    const p=Math.max(a.played[id]||0,b.played[id]||0);if(p)out.played[id]=p;
  }
  out.challengeDone=dayNum(a.challengeDone)>=dayNum(b.challengeDone)?a.challengeDone:b.challengeDone;
  out.lastGame=b.lastGame||a.lastGame;
  return out;
}

// Records omzetten naar rijen voor de wereldranglijst (Memo: zetten + tijd).
export function scoreRows(records){
  return Object.entries(records||{}).map(([game,r])=>game==='memo'?{game,score:r.moves,extra:r.time}:{game,score:r,extra:null});
}
