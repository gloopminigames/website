// Gloop game-module. Wordt alleen geladen als iemand deze game speelt.
import {data} from '../store';
import {blob} from '../blob';
import {finishCommon} from './common';
import {sfx,note} from '../sfx';
/* ---------- Gloopie Zegt ---------- */
// Gloopies lichten op in een rij; doe de rij na. Elke ronde komt er één bij.
// Niveau: Makkelijk = 3 Gloopies en rustig, Normaal = 4, Moeilijk = 6 en sneller.
const PADS=[
  {c:'#6BE38A',f:'happy',n:'groen'},{c:'#FF7AC6',f:'love',n:'roze'},{c:'#FFD84A',f:'grin',n:'geel'},
  {c:'#5CC8FF',f:'cool',n:'blauw'},{c:'#8B6CFF',f:'wink',n:'paars'},{c:'#FF9F5A',f:'tongue',n:'oranje'}
];
export default function start(stage,g,restart){
  stage.innerHTML=`<div class="blast-modes"><button type="button" class="mode-card" data-mode="solo">${blob('#6BE38A','wink','mode-blob')}<b>Alleen</b><span>Hoe lange rij kun jij onthouden?</span></button>
    <button type="button" class="mode-card" data-mode="duo">${blob('#FF7AC6','love','mode-blob')}<b>2 spelers</b><span>Om de beurt: doe de rij na en voeg er één aan toe.</span></button></div>`;
  let inner=null;
  stage.querySelectorAll('.mode-card').forEach(b=>b.addEventListener('click',()=>{inner=run(stage,g,b.dataset.mode==='solo',restart);}));
  return ()=>{if(inner)inner();};
}
function run(stage,g,solo,restart){
  const SPD=g.speed||1,N=SPD<1?3:SPD>1?6:4,pads=PADS.slice(0,N);
  stage.innerHTML=`<div class="zegt">
    <div class="zegt-bar"><div class="stat"><span>${solo?'Rij':'Rij'}</span><b id="zLen">0</b></div><p class="zegt-msg" id="zMsg" aria-live="polite"></p></div>
    <div class="zegt-pads n${N}" id="zPads">${pads.map((p,i)=>`<button type="button" class="zpad" data-i="${i}" style="--pc:${p.c}" aria-label="${p.n} Gloopie (toets ${i+1})" disabled>${blob(p.c,p.f,'zpad-blob')}</button>`).join('')}</div>
    <p class="stapel-help">${solo?'Kijk welke Gloopies oplichten en tik ze daarna na, in dezelfde volgorde. Elke ronde komt er één bij.':'Speler 1 tikt een Gloopie. Daarna doet speler 2 de rij na en voegt er één toe. Wie een fout maakt, verliest.'} Op een toetsenbord kun je ook de cijfers 1 tot ${N} gebruiken.</p>
  </div>`;
  const btns=[...stage.querySelectorAll('.zpad')],msg=stage.querySelector('#zMsg'),lenEl=stage.querySelector('#zLen');
  let seq=[],pos=0,state='watch',player=0,timers=[],gone=false;
  const later=(fn,ms)=>{const t=setTimeout(()=>{if(!gone)fn();},ms);timers.push(t);};
  const say=t=>{msg.textContent=t;};
  const lock=on=>btns.forEach(b=>{b.disabled=on;});
  function flash(i,ms){const b=btns[i];b.classList.add('lit');note(i);later(()=>b.classList.remove('lit'),ms);}
  // Rij laten zien: steeds iets sneller naarmate de rij langer wordt.
  function play(){
    state='watch';lock(true);say(solo?'Kijk goed…':'');
    const on=Math.max(260,(620-seq.length*18))/SPD,gap=Math.max(200,260/SPD);  // genoeg pauze, zodat twee keer dezelfde Gloopie opvalt
    seq.forEach((p,k)=>later(()=>flash(p,on),600+k*(on+gap)));
    later(()=>{state='input';pos=0;lock(false);say(solo?'Nu jij!':'');btns[seq[0]]?.focus({preventScroll:true});},600+seq.length*(on+gap));
  }
  function nextSolo(){seq.push(Math.floor(Math.random()*N));lenEl.textContent=seq.length-1;play();}
  function press(i){
    if(state!=='input'&&state!=='add')return;
    flash(i,220);
    if(state==='add'){ // 2 spelers: na het nadoen voegt de speler er één toe
      seq.push(i);lenEl.textContent=seq.length;player=1-player;state='watch';lock(true);sfx('good');
      say(`Speler ${player+1}: doe de rij na en voeg er één toe!`);later(()=>{state='input';pos=0;lock(false);},700);return;
    }
    if(i!==seq[pos]){wrong();return;}
    pos++;
    if(pos<seq.length)return;
    lock(true);
    if(solo){lenEl.textContent=seq.length;say(['Goed zo!','Super!','Knap!','Wauw!'][seq.length%4]);sfx('good');later(nextSolo,800);}
    else{state='add';lock(false);say(`Goed! Speler ${player+1}, tik nu er één bij.`);}
  }
  function wrong(){
    state='done';lock(true);sfx('oops');
    btns[seq[pos]]?.classList.add('hint');say('Oeps! Dat was een andere.');
    later(finish,1300);
  }
  function finish(){
    const score=solo?seq.length-1:seq.length;
    if(solo){
      const prev=data.records[g.rk];const isRec=score>0&&(!prev||score>prev);if(isRec)data.records[g.rk]=score;
      stage.innerHTML=finishCommon(g,{score,solo:true},isRec,[`Langste rij <b>${score}</b>`,`Jouw record <b>${data.records[g.rk]||0}</b>`],isRec?'grin':score>2?'happy':'sad');
    }else{
      stage.innerHTML=finishCommon(g,{score:0,solo:false},false,[`Winnaar <b>Speler ${2-player}</b>`,`Lengte van de rij <b>${seq.length}</b>`],'grin');
    }
    document.getElementById('again').addEventListener('click',()=>restart());
  }
  btns.forEach(b=>b.addEventListener('pointerdown',e=>{e.preventDefault();if(!b.disabled)press(+b.dataset.i);}));
  btns.forEach(b=>b.addEventListener('keydown',e=>{if((e.key==='Enter'||e.key===' ')&&!e.repeat){e.preventDefault();if(!b.disabled)press(+b.dataset.i);}}));
  const onKey=e=>{const k=+e.key;if(k>=1&&k<=N&&!e.repeat&&!btns[k-1].disabled){e.preventDefault();press(k-1);}};
  window.addEventListener('keydown',onKey);
  if(solo){say('Klaar? Kijk goed!');later(nextSolo,700);}
  else{state='add';lock(false);lenEl.textContent=0;say('Speler 1: tik een Gloopie om te beginnen!');}
  return ()=>{gone=true;timers.forEach(clearTimeout);window.removeEventListener('keydown',onKey);};
}
