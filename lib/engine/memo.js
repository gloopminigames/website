// Gloop game-module. Wordt alleen geladen als iemand deze game speelt.
import {data,save} from '../store';
import {blob,ICON} from '../blob';
import {finishCommon} from './common';
import {sfx} from '../sfx';
import {toast} from '../toast';
/* ---------- Memo Mania ---------- */
export default function start(stage,g,restart){
  const COLORS=['#6BE38A','#FF7AC6','#8B6CFF','#FFD84A','#5CC8FF','#FF9F5A','#FFFFFF','#B8F25A'];
  const CN=['groen','roze','paars','geel','blauw','oranje','wit','limoen'];
  const FC=['happy','grin','wink','surprised','sleepy','tongue','cool','love'];
  const FN=['blij','lachend','knipogend','verrast','slaperig','tong uit','cool','verliefd'];
  const deck=[];for(let i=0;i<((g.speed||1)<1?6:8);i++){deck.push(i,i)}
  for(let i=deck.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[deck[i],deck[j]]=[deck[j],deck[i]]}
  let first=null,lock=false,moves=0,matched=0,start=0,iv=null,to=null;
  stage.innerHTML=`<div class="memo-bar"><div class="stat"><span>Zetten</span><b id="mv">0</b></div><div class="stat"><span>Tijd</span><b id="tm">0 s</b></div></div>
    <div class="memo" id="memo">${deck.map((k,i)=>`<button type="button" class="mcard" data-i="${i}" aria-label="Kaartje ${i+1}, verborgen"><span class="mcard-in"><span class="mface mback" aria-hidden="true">?</span><span class="mface mfront">${blob(COLORS[k],FC[k],'m-blob')}</span></span></button>`).join('')}</div>`;
  const btns=[...stage.querySelectorAll('.mcard')],mv=document.getElementById('mv'),tm=document.getElementById('tm');
  const secs=()=>Math.round((performance.now()-start)/1000);
  function show(i,up){const b=btns[i];b.classList.toggle('up',up);b.setAttribute('aria-label',up?`Kaartje ${i+1}, ${FN[deck[i]]} ${CN[deck[i]]} blobje`:`Kaartje ${i+1}, verborgen`)}
  btns.forEach((b,i)=>b.addEventListener('click',()=>{
    if(lock||b.classList.contains('up'))return;
    if(!start){start=performance.now();iv=setInterval(()=>{tm.textContent=secs()+' s'},250)}
    show(i,true);
    if(first===null){first=i;return}
    moves++;mv.textContent=moves;
    const a=first;first=null;
    if(deck[a]===deck[i]){
      btns[a].classList.add('matched');b.classList.add('matched');matched+=2;sfx('good');
      if(matched===deck.length){clearInterval(iv);to=setTimeout(()=>finish(secs()),500)}
    }else{
      lock=true;to=setTimeout(()=>{show(a,false);show(i,false);lock=false},800);
    }
  }));
  function finish(time){
    const prev=data.records[g.rk];
    const isRec=!prev||moves<prev.moves||(moves===prev.moves&&time<prev.time);
    if(isRec)data.records[g.rk]={moves,time};
    const r=data.records[g.rk];
    const face=isRec?'grin':moves>22?'sad':'happy';
    stage.innerHTML=finishCommon(g,{moves},isRec,[`Zetten <b>${moves}</b>`,`Tijd <b>${time} s</b>`,`Jouw record <b>${r.moves} zetten in ${r.time} s</b>`],face);
    document.getElementById('again').addEventListener('click',()=>restart());
  }
  // Pauze: de klok staat stil zolang het spel op pauze staat.
  let pausedAt=0;
  return {cleanup:()=>{clearInterval(iv);clearTimeout(to)},
    pause(){if(start&&matched<deck.length){pausedAt=performance.now();clearInterval(iv);iv=null;}},
    resume(){if(pausedAt){start+=performance.now()-pausedAt;pausedAt=0;iv=setInterval(()=>{tm.textContent=secs()+' s'},250);}}};
}
