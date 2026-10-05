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
  const d=new Date();const i=Math.floor(new Date(d.getFullYear(),d.getMonth(),d.getDate()).getTime()/864e5)%8;
  return i===0
    ?{game:'reactie',text:'Haal een gemiddelde onder de 320 ms in Reactie Rush.',check:r=>r.avg<320}
    :i===1?{game:'memo',text:'Vind alle paartjes in Memo Mania in 14 zetten of minder.',check:r=>r.moves<=14}
    :i===2?{game:'stapelslijm',text:'Bouw een slijmtoren van 25 lagen in Stapelslijm.',check:r=>r.score>=25}
    :i===3?{game:'bubbelbots',text:'Haal 1.500 punten in Bubbel Bots.',check:r=>r.score>=1500}
    :i===4?{game:'klikkerklok',text:'Haal 30 klikken in Klikkerklok.',check:r=>r.score>=30}
    :i===5?{game:'blubberblast',text:'Win 3 rondes op rij tegen Gloopie in Blubber Blast.',check:r=>r.solo&&r.score>=3}
    :i===6?{game:'gloopiegolf',text:'Speel alle 9 holes van Gloopie Golf in 30 slagen of minder.',check:r=>r.score<=30}
    :{game:'mepdeblob',text:'Haal 60 punten in Mep de Blob.',check:r=>r.score>=60};
}
export function fmtRec(id){
  const r=data.records[id];
  if(id==='reactie')return r?`${r} ms gemiddeld`:'Nog geen record';
  if(id==='memo')return r?`${r.moves} zetten in ${r.time} s`:'Nog geen record';
  if(id==='stapelslijm')return r?`${r} lagen hoog`:'Nog geen record';
  if(id==='mepdeblob')return r?`${r} punten`:'Nog geen record';
  if(id==='gloopiegolf')return r?`${r} slagen (9 holes)`:'Nog geen record';
  if(id==='blubberblast')return r?`${r} rondes op rij gewonnen`:'Nog geen record';
  if(id==='klikkerklok')return r?`${r} klikken`:'Nog geen record';
  if(id==='bubbelbots')return r?`${r.toLocaleString('nl-NL')} punten`:'Nog geen record';
  return '';
}

export function statsHtml(id){
  const played=data.played[id]||0;
  return `<div class="stat"><span>Record</span><b>${fmtRec(id)}</b></div><div class="stat"><span>Gespeeld</span><b>${played}×</b></div>`;
}

