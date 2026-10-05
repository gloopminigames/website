// Lokale opslag van de speler (alleen in de browser)
export const KEY='gloop:v1';
export const OLD_FARM_KEY='sproutisle.save.v1';
const empty=()=>({records:{},played:{},name:'',challengeDone:''});
function load(){if(typeof window==='undefined')return {};try{return JSON.parse(localStorage.getItem(KEY))||{}}catch(e){return {}}}
export const data=Object.assign(empty(),load());
if(!data.records||typeof data.records!=='object')data.records={};
if(!data.played||typeof data.played!=='object')data.played={};
// Andere modules (bijv. het account) kunnen meeluisteren als er iets wordt opgeslagen.
const saveHooks=[];
export function onSave(fn){saveHooks.push(fn)}
export function save(){try{localStorage.setItem(KEY,JSON.stringify(data))}catch(e){}saveHooks.forEach(f=>f())}
export function wipe(){Object.assign(data,empty());delete data.lastGame;try{localStorage.removeItem(KEY);localStorage.removeItem(OLD_FARM_KEY)}catch(e){}}
export function today(){const d=new Date();return d.getFullYear()+'-'+(d.getMonth()+1)+'-'+d.getDate()}
export function challenge(){
  const d=new Date();const i=Math.floor(new Date(d.getFullYear(),d.getMonth(),d.getDate()).getTime()/864e5)%9;
  return i===0
    ?{game:'reactie',text:'Haal een gemiddelde onder de 320 ms in Reactie Rush.',check:r=>r.avg<320}
    :i===1?{game:'memo',text:'Vind alle paartjes in Memo Mania in 14 zetten of minder.',check:r=>r.moves<=14}
    :i===2?{game:'stapelslijm',text:'Bouw een slijmtoren van 25 lagen in Stapelslijm.',check:r=>r.score>=25}
    :i===3?{game:'bubbelbots',text:'Haal 1.500 punten in Bubbel Bots.',check:r=>r.score>=1500}
    :i===4?{game:'klikkerklok',text:'Haal 30 klikken in Klikkerklok.',check:r=>r.score>=30}
    :i===5?{game:'blubberblast',text:'Win 3 rondes op rij tegen Gloopie in Blubber Blast.',check:r=>r.solo&&r.score>=3}
    :i===7?{game:'gloopiezegt',text:'Onthoud een rij van 8 in Gloopie Zegt.',check:r=>r.solo&&r.score>=8}
    :i===6?{game:'gloopiegolf',text:'Speel alle 9 holes van Gloopie Golf in 30 slagen of minder.',check:r=>r.score<=30}
    :{game:'mepdeblob',text:'Haal 60 punten in Mep de Blob.',check:r=>r.score>=60};
}
// Score als tekst; voor Memo Mania is score = zetten en extra = tijd in seconden.
export function fmtScore(id,score,extra){
  if(id==='reactie')return `${score} ms gemiddeld`;
  if(id==='memo')return `${score} zetten in ${extra} s`;
  if(id==='stapelslijm')return `${score} lagen hoog`;
  if(id==='mepdeblob')return `${score} punten`;
  if(id==='gloopiegolf')return `${score} slagen (9 holes)`;
  if(id==='blubberblast')return `${score} rondes op rij gewonnen`;
  if(id==='klikkerklok')return `${score} klikken`;
  if(id==='bubbelbots')return `${Number(score).toLocaleString('nl-NL')} punten`;
  if(id==='gloopiezegt')return `rij van ${score}`;
  return String(score);
}
// Record als tekst. `key` mag een niveau bevatten, bijv. "mepdeblob@snel".
export function fmtRec(key){
  const id=String(key).split('@')[0],r=data.records[key];
  if(!r)return 'Nog geen record';
  return id==='memo'?fmtScore(id,r.moves,r.time):fmtScore(id,r);
}

// Compacte regel boven de game: record en aantal keer gespeeld.
export function statsHtml(id,key=id){
  const played=data.played[id]||0;
  return `<span class="gb-stat" title="Record"><span aria-hidden="true">🏆</span> <span class="sr-only">Record: </span>${fmtRec(key)}</span><span class="gb-stat" title="Gespeeld"><span aria-hidden="true">🎮</span> <span class="sr-only">Gespeeld: </span>${played}×</span>`;
}
