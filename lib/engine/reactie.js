// Gloop game-module. Wordt alleen geladen als iemand deze game speelt.
import {data,save} from '../store';
import {blob,ICON} from '../blob';
import {finishCommon} from './common';
import {sfx} from '../sfx';
import {toast} from '../toast';
/* ---------- Reactie Rush ---------- */
export default function start(stage,g,restart){
  const ROUNDS=5;let state='idle',times=[],timer=null,t0=0;
  stage.innerHTML=`<button type="button" class="react-area state-idle" id="ra"><span class="ra-big" id="raBig">Tik om te starten</span><span class="ra-small" id="raSmall">${ROUNDS} rondes. Tik zodra het vlak groen wordt.</span></button><div class="rounds" id="rounds"></div>`;
  const ra=document.getElementById('ra'),big=document.getElementById('raBig'),small=document.getElementById('raSmall'),rounds=document.getElementById('rounds');
  function set(s,b,sm){ra.className='react-area state-'+s;big.textContent=b;small.textContent=sm}
  function drawRounds(){let h='';for(let i=0;i<ROUNDS;i++)h+=times[i]!=null?`<span class="round">${times[i]} ms</span>`:`<span class="round empty-r">–</span>`;rounds.innerHTML=h}
  function next(){
    state='wait';set('wait','Wacht op groen…','Nog niet tikken!');
    timer=setTimeout(()=>{state='go';set('go','TIK!','Nu!');t0=performance.now()},1200+Math.random()*2800);
  }
  function hit(){
    if(state==='idle'||state==='result'||state==='early'){next();return}
    if(state==='wait'){clearTimeout(timer);state='early';sfx('oops');set('early','Te vroeg!','Tik om deze ronde opnieuw te doen.');return}
    if(state==='go'){
      const ms=Math.round(performance.now()-t0);times.push(ms);drawRounds();
      if(times.length>=ROUNDS)finish();
      else{state='result';set('result',ms+' ms',`Ronde ${times.length} van ${ROUNDS}. Tik voor de volgende.`)}
    }
  }
  function finish(){
    state='done';
    const avg=Math.round(times.reduce((a,b)=>a+b,0)/times.length),best=Math.min(...times);
    const prev=data.records[g.rk];const isRec=!prev||avg<prev;
    if(isRec)data.records[g.rk]=avg;
    const face=isRec?'grin':avg>400?'sad':'happy';
    stage.innerHTML=finishCommon(g,{avg},isRec,[`Gemiddeld <b>${avg} ms</b>`,`Snelste tik <b>${best} ms</b>`,`Jouw record <b>${data.records[g.rk]} ms</b>`],face);
    document.getElementById('again').addEventListener('click',()=>restart());
  }
  ra.addEventListener('pointerdown',e=>{e.preventDefault();hit()});
  ra.addEventListener('keydown',e=>{if(e.key===' '||e.key==='Enter'){e.preventDefault();if(!e.repeat)hit()}});
  drawRounds();
  // Pauze: een ronde die bezig was (wachten of meten) telt niet en begint opnieuw. Zo valt er niets te winnen met pauzeren.
  return {cleanup:()=>clearTimeout(timer),
    pause(){if(state==='wait'||state==='go'){clearTimeout(timer);state='early';set('result','Pauze','Tik om deze ronde opnieuw te doen.');}},
    resume(){}};
}
