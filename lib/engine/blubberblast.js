// Gloop game-module. Wordt alleen geladen als iemand deze game speelt.
import {data,save} from '../store';
import {blob,ICON} from '../blob';
import {finishCommon} from './common';
import {sfx} from '../sfx';
import {toast} from '../toast';
/* ---------- Blubber Blast ---------- */
export default function start(stage,g,restart){
  stage.innerHTML=`<div class="blast-modes"><button type="button" class="mode-card" data-mode="solo">${blob('#FFD84A','cool','mode-blob')}<b>Tegen Gloopie</b><span>Speel alleen. Gloopie wordt elke ronde sneller.</span></button>
    <button type="button" class="mode-card" data-mode="duo">${blob('#FF7AC6','love','mode-blob')}<b>2 spelers</b><span>Samen op één scherm. Ieder tikt op zijn eigen helft.</span></button></div>`;
  let inner=null;
  stage.querySelectorAll('.mode-card').forEach(b=>b.addEventListener('click',()=>{inner=runBlast(stage,g,b.dataset.mode==='solo',restart);}));
  return ()=>{if(inner)inner();};
}
function runBlast(stage,g,solo,restart){
  const LW=360,LH=560,GT=46,GB=LH-46,MID=LH/2,IMP=62,DAMP=2.4,BR=44;
  stage.innerHTML=`<div class="stapel-wrap"><canvas class="stapel blast" id="blc" tabindex="0" role="application" aria-label="Blubber Blast: tik zo snel mogelijk op jouw helft"></canvas>
    <p class="stapel-help">${solo?'Tik zo snel als je kunt om de blubber naar Gloopie bovenin te blazen. Of druk heel vaak op spatie.':'Speler 1 tikt op de onderste helft, speler 2 op de bovenste. Op een toetsenbord: speler 1 de L, speler 2 de A.'} Tik op een gouden bel voor een extra zet. Wie eerst 2 rondes wint, wint de wedstrijd.</p></div>`;
  const cv=document.getElementById('blc'),ctx=cv.getContext('2d');let sc=1,dpr=1;
  function size(){const wrapW=cv.parentElement.clientWidth;let w=Math.min(wrapW,460),h=w*LH/LW;const maxH=Math.max(380,window.innerHeight*.72);if(h>maxH){h=maxH;w=h*LW/LH;}
    dpr=Math.min(2,window.devicePixelRatio||1);cv.style.width=w+'px';cv.style.height=h+'px';cv.width=Math.round(w*dpr);cv.height=Math.round(h*dpr);sc=w/LW;}
  size();window.addEventListener('resize',size);
  const BODY=new Path2D('M100 20 C152 20 180 58 180 106 C180 134 174 152 166 162 C160 170 158 184 150 184 C142 184 142 170 134 170 C126 170 126 180 118 180 C110 180 110 168 100 168 C90 168 90 188 80 188 C70 188 72 170 62 170 C52 170 48 180 40 176 C28 168 20 144 20 106 C20 58 48 20 100 20 Z');
  let y=MID,v=0,state='count',cdown=3.2,wins=[0,0],streak=0,level=0,taps=[0,0],ripples=[],golds=[],goldT=3,cpuT=.5,msg='',msgT=0,raf=0,last=0,wob=0;
  function cpuRate(){return (4.2+level*.75)*(g.speed||1);}
  function push(p,mult){if(state!=='play')return;v+=(p===0?-1:1)*IMP*(mult||1);taps[p]++;wob=1;}
  function newRound(){y=MID;v=0;golds=[];goldT=2+Math.random()*3;state='count';cdown=3.2;}
  function endRound(winner){state='between';wins[winner]++,sfx('good');msgT=1.6;
    if(solo){if(winner===0){streak++;level++;msg=`Ronde gewonnen! (${streak} op rij)`;}else msg='Gloopie wint deze ronde!';}
    else msg=`Speler ${winner+1} wint de ronde!`;}
  function after(){if(solo){if(wins[1]>0){finish();return;}newRound();return;}
    if(wins[0]>=2||wins[1]>=2){finish();return;}newRound();}
  function rr(x,yy,w,h,r){ctx.beginPath();ctx.moveTo(x+r,yy);ctx.arcTo(x+w,yy,x+w,yy+h,r);ctx.arcTo(x+w,yy+h,x,yy+h,r);ctx.arcTo(x,yy+h,x,yy,r);ctx.arcTo(x,yy,x+w,yy,r);ctx.closePath();}
  function label(txt,yy,flip){ctx.save();ctx.translate(LW/2,yy);if(flip)ctx.rotate(Math.PI);ctx.textAlign='center';ctx.fillStyle='#221A48';ctx.font='700 17px Fredoka, Nunito, sans-serif';ctx.fillText(txt,0,6);ctx.restore();}
  function dots(n,yy,flip){for(let i=0;i<(solo?0:2);i++){ctx.beginPath();ctx.arc(LW/2+(i-.5)*26*(flip?-1:1),yy,8,0,7);ctx.fillStyle=i<n?'#FFD84A':'#FFFFFF';ctx.fill();ctx.lineWidth=3;ctx.strokeStyle='#221A48';ctx.stroke();}}
  function draw(){ctx.setTransform(sc*dpr,0,0,sc*dpr,0,0);
    ctx.fillStyle='#FFE3F3';ctx.fillRect(0,0,LW,MID);ctx.fillStyle='#E3FBEA';ctx.fillRect(0,MID,LW,LH-MID);
    ctx.fillStyle='#FF7AC6';ctx.fillRect(0,0,LW,GT);ctx.fillStyle='#6BE38A';ctx.fillRect(0,GB,LW,LH-GB);
    ctx.strokeStyle='#221A48';ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(0,GT);ctx.lineTo(LW,GT);ctx.moveTo(0,GB);ctx.lineTo(LW,GB);ctx.stroke();
    ctx.setLineDash([10,10]);ctx.lineWidth=2.5;ctx.strokeStyle='rgba(34,26,72,.3)';ctx.beginPath();ctx.moveTo(0,MID);ctx.lineTo(LW,MID);ctx.stroke();ctx.setLineDash([]);
    label(solo?`Gloopie · ronde ${level+1}`:'Speler 2 · tik hier!',GT/2,!solo);label(solo?'Jij · tik zo snel je kan!':'Speler 1 · tik hier!',GB+(LH-GB)/2,false);
    dots(wins[1],GT+20,true);dots(wins[0],GB-20,false);
    for(const r of ripples){ctx.globalAlpha=Math.max(0,1-r.t);ctx.strokeStyle=r.c;ctx.lineWidth=4;ctx.beginPath();ctx.arc(r.x,r.y,10+r.t*36,0,7);ctx.stroke();ctx.globalAlpha=1;}
    for(const gb of golds){const pu=1+Math.sin(performance.now()/140)*.1;ctx.beginPath();ctx.arc(gb.x,gb.y,18*pu,0,7);ctx.fillStyle='#FFD84A';ctx.fill();ctx.lineWidth=3;ctx.strokeStyle='#221A48';ctx.stroke();
      ctx.fillStyle='#221A48';ctx.font='700 13px Fredoka, sans-serif';ctx.textAlign='center';ctx.fillText('×5',gb.x,gb.y+5);}
    const sx=1+wob*.12,sy=1-wob*.1;ctx.save();ctx.translate(LW/2,y);ctx.scale(sx*.5,sy*.5);ctx.translate(-100,-104);
    ctx.fillStyle='#8B6CFF';ctx.fill(BODY);ctx.lineWidth=10;ctx.strokeStyle='#221A48';ctx.stroke(BODY);
    ctx.beginPath();ctx.ellipse(64,58,17,10,-.55,0,7);ctx.fillStyle='rgba(255,255,255,.7)';ctx.fill();
    const look=Math.max(-1,Math.min(1,v/90))*6;for(const ex of[78,122]){ctx.beginPath();ctx.ellipse(ex,100,15,18,0,0,7);ctx.fillStyle='#fff';ctx.fill();ctx.lineWidth=7;ctx.stroke();ctx.beginPath();ctx.arc(ex+3,100+look,8,0,7);ctx.fillStyle='#221A48';ctx.fill();}
    ctx.beginPath();ctx.ellipse(100,136,10,12,0,0,7);ctx.fillStyle='#221A48';ctx.fill();ctx.restore();
    if(state==='count'){const n=Math.ceil(cdown-.2);ctx.fillStyle='rgba(34,26,72,.55)';rr(90,MID-46,180,92,26);ctx.fill();ctx.fillStyle='#fff';ctx.textAlign='center';ctx.font='700 44px Fredoka, Nunito, sans-serif';ctx.fillText(n>0?n:'Blast!',LW/2,MID+15);}
    if(state==='between'){ctx.fillStyle='rgba(34,26,72,.7)';rr(20,MID-40,LW-40,80,24);ctx.fill();ctx.fillStyle='#fff';ctx.textAlign='center';ctx.font='700 22px Fredoka, Nunito, sans-serif';ctx.fillText(msg,LW/2,MID+8);}}
  function toLogic(e){const b=cv.getBoundingClientRect();return {x:(e.clientX-b.left)/b.width*LW,y:(e.clientY-b.top)/b.height*LH};}
  cv.addEventListener('pointerdown',e=>{e.preventDefault();const p=toLogic(e);if(state!=='play')return;
    for(const gb of golds){if((gb.x-p.x)**2+(gb.y-p.y)**2<26*26){const pl=gb.y>MID?0:1;if(solo&&pl===1)continue;golds.splice(golds.indexOf(gb),1);push(pl,5);ripples.push({x:gb.x,y:gb.y,c:'#FFD84A',t:0});return;}}
    const pl=solo?0:(p.y>MID?0:1);push(pl);ripples.push({x:p.x,y:p.y,c:pl===0?'#2FB463':'#E04CA2',t:0});});
  cv.addEventListener('keydown',e=>{if(e.repeat)return;const k=e.key.toLowerCase();
    if(solo&&(k===' '||k==='enter'||k==='l'||k==='arrowup')){e.preventDefault();push(0);}
    else if(!solo&&(k==='l'||k==='arrowup')){e.preventDefault();push(0);}
    else if(!solo&&(k==='a'||k==='q')){e.preventDefault();push(1);}});
  function loop(now){raf=requestAnimationFrame(loop);const dt=Math.min(.033,(now-(last||now))/1000);last=now;
    if(state==='count'){cdown-=dt;if(cdown<=0){state='play';cpuT=.4;}}
    else if(state==='play'){
      if(solo){cpuT-=dt;if(cpuT<=0){push(1);cpuT=1/cpuRate()*(.6+Math.random()*.8);}}
      goldT-=dt;if(goldT<=0&&golds.length<2){const top=solo?false:Math.random()<.5;golds.push({x:40+Math.random()*(LW-80),y:top?GT+40+Math.random()*(MID-GT-90):MID+50+Math.random()*(GB-MID-90),t:0});goldT=3+Math.random()*4;}
      for(const gb of golds)gb.t+=dt;golds=golds.filter(gb=>gb.t<3.5);
      v*=Math.exp(-DAMP*dt);y+=v*dt;
      if(y-BR*.6<=GT){y=GT+BR*.6;endRound(0);}else if(y+BR*.6>=GB){y=GB-BR*.6;endRound(1);}}
    else if(state==='between'){msgT-=dt;if(msgT<=0)after();}
    for(const r of ripples)r.t+=dt*2.6;ripples=ripples.filter(r=>r.t<1);wob=Math.max(0,wob-dt*5);
    if(state!=='done')draw();}
  function finish(){state='done';cancelAnimationFrame(raf);raf=0;
    if(solo){const prev=data.records[g.rk];const isRec=streak>0&&(!prev||streak>prev);if(isRec)data.records[g.rk]=streak;
      stage.innerHTML=finishCommon(g,{score:streak,solo:true},isRec,[`Rondes op rij gewonnen <b>${streak}</b>`,`Jouw tikken <b>${taps[0]}</b>`,`Jouw record <b>${data.records[g.rk]||0}</b>`],isRec?'grin':streak?'happy':'sad');}
    else{const w=wins[0]>wins[1]?1:2;
      stage.innerHTML=finishCommon(g,{score:0,solo:false},false,[`Winnaar <b>Speler ${w}</b>`,`Stand <b>${wins[0]} – ${wins[1]}</b>`,`Tikken <b>${taps[0]} – ${taps[1]}</b>`],'grin');}
    document.getElementById('again').addEventListener('click',()=>restart());}
  newRound();raf=requestAnimationFrame(loop);setTimeout(()=>{try{cv.focus({preventScroll:true})}catch(e){}},50);
  return ()=>{cancelAnimationFrame(raf);window.removeEventListener('resize',size);};
}
