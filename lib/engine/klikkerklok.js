// Gloop game-module. Wordt alleen geladen als iemand deze game speelt.
import {data,save} from '../store';
import {blob,ICON} from '../blob';
import {finishCommon} from './common';
import {sfx} from '../sfx';
import {toast} from '../toast';
/* ---------- Klikkerklok ---------- */
export default function start(stage,g,restart){
  const LW=360,LH=560,CX=180,CY=290,RAD=132,TAU=Math.PI*2;
  stage.innerHTML=`<div class="stapel-wrap"><canvas class="stapel klok" id="klc" tabindex="0" role="button" aria-label="Klikkerklok: tik of druk op spatie zodra de wijzer de bol raakt"></canvas>
    <p class="stapel-help">De wijzer draait rond. Tik (of druk op spatie) precies als hij de gele bol raakt. Na elke klik draait hij de andere kant op en gaat hij iets sneller. Te vroeg of te laat? Dan is het voorbij!</p></div>`;
  const cv=document.getElementById('klc'),ctx=cv.getContext('2d');let sc=1,dpr=1;
  function size(){const wrapW=cv.parentElement.clientWidth;let w=Math.min(wrapW,460),h=w*LH/LW;const maxH=Math.max(380,window.innerHeight*.7);if(h>maxH){h=maxH;w=h*LW/LH;}
    dpr=Math.min(2,window.devicePixelRatio||1);cv.style.width=w+'px';cv.style.height=h+'px';cv.width=Math.round(w*dpr);cv.height=Math.round(h*dpr);sc=w/LW;}
  size();window.addEventListener('resize',size);
  const BODY=new Path2D('M100 20 C152 20 180 58 180 106 C180 134 174 152 166 162 C160 170 158 184 150 184 C142 184 142 170 134 170 C126 170 126 180 118 180 C110 180 110 168 100 168 C90 168 90 188 80 188 C70 188 72 170 62 170 C52 170 48 180 40 176 C28 168 20 144 20 106 C20 58 48 20 100 20 Z');
  const TOL=.15,PERF=.045;
  let state='ready',a=-Math.PI/2,dir=1,w=1.7*(g.speed||1),tgt=0,gold=false,score=0,hits=0,perfects=0,streak=0,pops=[],shake=0,flash=0,happy=0,raf=0,last=0,overT=0,why='';
  const norm=x=>{x=(x+Math.PI)%TAU;if(x<0)x+=TAU;return x-Math.PI;};
  function newTarget(){tgt=norm(a+dir*(1+Math.random()*1.9));gold=hits>0&&hits%10===9;}
  newTarget();
  function rr(x,y,w,h,r){ctx.beginPath();ctx.moveTo(x+r,y);ctx.arcTo(x+w,y,x+w,y+h,r);ctx.arcTo(x+w,y+h,x,y+h,r);ctx.arcTo(x,y+h,x,y,r);ctx.arcTo(x,y,x+w,y,r);ctx.closePath();}
  function gloopie(){ctx.save();ctx.translate(CX,CY+38);const sq=1+happy*.15;ctx.scale(.42*sq,.42/sq);ctx.translate(-100,-140);
    ctx.fillStyle=state==='over'||state==='done'?'#B3ABE0':'#FFD84A';ctx.fill(BODY);ctx.lineWidth=11;ctx.strokeStyle='#221A48';ctx.stroke(BODY);
    const lx=Math.cos(a)*5,ly=Math.sin(a)*5;
    for(const ex of[78,122]){ctx.beginPath();ctx.ellipse(ex,100,15,18,0,0,7);ctx.fillStyle='#fff';ctx.fill();ctx.lineWidth=8;ctx.stroke();ctx.beginPath();ctx.arc(ex+lx,100+ly+2,8,0,7);ctx.fillStyle='#221A48';ctx.fill();}
    ctx.beginPath();if(state==='over'||state==='done'){ctx.moveTo(88,142);ctx.quadraticCurveTo(100,128,112,142);ctx.lineWidth=9;ctx.lineCap='round';ctx.stroke();}
    else if(happy>.2){ctx.moveTo(86,127);ctx.quadraticCurveTo(100,150,114,127);ctx.closePath();ctx.fillStyle='#221A48';ctx.fill();}
    else{ctx.moveTo(88,130);ctx.quadraticCurveTo(100,144,112,130);ctx.lineWidth=9;ctx.lineCap='round';ctx.stroke();}
    ctx.restore();}
  function draw(){ctx.setTransform(sc*dpr,0,0,sc*dpr,0,0);
    ctx.fillStyle=flash>0?`rgba(255,${state==='over'?184:241},${state==='over'?184:250},1)`:'#FFF1FA';ctx.fillRect(0,0,LW,LH);
    ctx.fillStyle='rgba(255,122,198,.09)';for(let y=0;y<LH;y+=24)for(let x=(y/24)%2*12;x<LW;x+=24){ctx.beginPath();ctx.arc(x,y,2.5,0,7);ctx.fill();}
    const sx=shake?(Math.random()-.5)*shake*14:0;ctx.save();ctx.translate(sx,0);
    ctx.textAlign='center';ctx.fillStyle='#221A48';ctx.strokeStyle='#fff';ctx.lineWidth=6;ctx.font='700 58px Fredoka, Nunito, sans-serif';ctx.strokeText(score,CX,92);ctx.fillText(score,CX,92);
    ctx.beginPath();ctx.arc(CX,CY+7,RAD+26,0,TAU);ctx.fillStyle='#221A48';ctx.fill();
    ctx.beginPath();ctx.arc(CX,CY,RAD+26,0,TAU);ctx.fillStyle='#FFFFFF';ctx.fill();ctx.lineWidth=4;ctx.strokeStyle='#221A48';ctx.stroke();
    ctx.beginPath();ctx.arc(CX,CY,RAD,0,TAU);ctx.lineWidth=28;ctx.strokeStyle='#E9E4FF';ctx.stroke();
    for(let i=0;i<12;i++){const an=i/12*TAU;ctx.beginPath();ctx.moveTo(CX+Math.cos(an)*(RAD+20),CY+Math.sin(an)*(RAD+20));ctx.lineTo(CX+Math.cos(an)*(RAD+(i%3?14:10)),CY+Math.sin(an)*(RAD+(i%3?14:10)));ctx.lineWidth=i%3?2.5:4;ctx.lineCap='round';ctx.strokeStyle='#B3ABE0';ctx.stroke();}
    if(state!=='ready'||true){const tx=CX+Math.cos(tgt)*RAD,ty=CY+Math.sin(tgt)*RAD,pu=1+Math.sin(performance.now()/160)*.08;
      ctx.beginPath();ctx.arc(tx,ty,14*pu,0,TAU);ctx.fillStyle=gold?'#FF7AC6':'#FFD84A';ctx.fill();ctx.lineWidth=3.5;ctx.strokeStyle='#221A48';ctx.stroke();
      ctx.beginPath();ctx.ellipse(tx-4,ty-5,4,2.5,-.6,0,TAU);ctx.fillStyle='rgba(255,255,255,.7)';ctx.fill();
      if(gold){ctx.fillStyle='#221A48';ctx.font='700 12px Fredoka, sans-serif';ctx.fillText('×3',tx,ty+4);}}
    const hx=CX+Math.cos(a)*RAD,hy=CY+Math.sin(a)*RAD;
    ctx.beginPath();ctx.moveTo(CX+Math.cos(a)*(RAD-60),CY+Math.sin(a)*(RAD-60));ctx.lineTo(hx,hy);ctx.lineWidth=9;ctx.lineCap='round';ctx.strokeStyle='#221A48';ctx.stroke();
    ctx.beginPath();ctx.arc(hx,hy,9,0,TAU);ctx.fillStyle='#8B6CFF';ctx.fill();ctx.lineWidth=3;ctx.strokeStyle='#221A48';ctx.stroke();
    gloopie();
    for(const p of pops){ctx.globalAlpha=Math.max(0,1-p.t);if(p.txt){ctx.font='700 22px Fredoka, Nunito, sans-serif';ctx.lineWidth=5;ctx.strokeStyle='#fff';ctx.strokeText(p.txt,p.x,p.y-p.t*30);ctx.fillStyle='#FF4FA8';ctx.fillText(p.txt,p.x,p.y-p.t*30);}
      else for(let k=0;k<7;k++){const an=k/7*TAU;ctx.beginPath();ctx.arc(p.x+Math.cos(an)*30*p.t,p.y+Math.sin(an)*30*p.t,4,0,TAU);ctx.fillStyle=p.c;ctx.fill();}ctx.globalAlpha=1;}
    ctx.restore();
    ctx.fillStyle='#4A4270';ctx.font='700 15px Nunito, sans-serif';ctx.textAlign='center';
    ctx.fillText(state==='over'||state==='done'?why:`Snelheid ${(w/1.7).toFixed(1)}×   ·   Perfect ${perfects}`,CX,LH-46);
    if(state==='ready'){ctx.fillStyle='rgba(34,26,72,.6)';rr(40,LH-130,LW-80,64,22);ctx.fill();ctx.fillStyle='#fff';ctx.font='700 26px Fredoka, Nunito, sans-serif';ctx.fillText('Tik om te starten',CX,LH-92);}}
  function click(){
    if(state==='ready'){state='play';newTarget();return;}
    if(state!=='play')return;
    const d=Math.abs(norm(a-tgt));
    if(d<=TOL){const pf=d<=PERF;const pts=(gold?3:1)+(pf?1:0);score+=pts;sfx('tap');hits++;streak=pf?streak+1:0;if(pf)perfects++;
      const tx=CX+Math.cos(tgt)*RAD,ty=CY+Math.sin(tgt)*RAD;pops.push({x:tx,y:ty,c:gold?'#FF7AC6':'#FFD84A',t:0});
      if(pf||gold)pops.push({x:CX,y:150,txt:gold?`Goud! +${pts}`:streak>1?`Perfect! ×${streak}`:'Perfect! +1',t:0});
      dir=-dir;w=Math.min(5*(g.speed||1),w+.07*(g.speed||1));happy=1;flash=.15;newTarget();}
    else fail(norm(a-tgt)*dir<0?'Te vroeg geklikt!':'Mis! Net ernaast.');}
  function fail(msg){state='over';why=msg;sfx('oops');overT=0;shake=1;flash=.3;}
  function loop(now){raf=requestAnimationFrame(loop);const dt=Math.min(.033,(now-(last||now))/1000);last=now;
    if(state==='play'){const prevRel=norm(a-tgt)*dir;a=norm(a+dir*w*dt);const rel=norm(a-tgt)*dir;if(prevRel<=TOL&&rel>TOL&&prevRel>-1)fail('Te laat! De wijzer was al voorbij.');}
    else if(state==='ready'){a=norm(a+.9*dt);}
    for(const p of pops)p.t+=dt*(p.txt?.9:2.4);pops=pops.filter(p=>p.t<1);
    happy=Math.max(0,happy-dt*3);shake=Math.max(0,shake-dt*2.5);flash=Math.max(0,flash-dt);
    if(state==='over'){overT+=dt;if(overT>1.2){state='done';finish();}}
    draw();}
  function finish(){cancelAnimationFrame(raf);raf=0;
    const prev=data.records[g.rk];const isRec=score>0&&(!prev||score>prev);if(isRec)data.records[g.rk]=score;
    const face=isRec?'grin':score<10?'sad':'happy';
    stage.innerHTML=finishCommon(g,{score},isRec,[`Klikken <b>${score}</b>`,`Perfecte klikken <b>${perfects}</b>`,`Jouw record <b>${data.records[g.rk]||0}</b>`],face);
    document.getElementById('again').addEventListener('click',()=>restart());}
  cv.addEventListener('pointerdown',e=>{e.preventDefault();click();});
  cv.addEventListener('keydown',e=>{if(e.key===' '||e.key==='Enter'){e.preventDefault();if(!e.repeat)click();}});
  raf=requestAnimationFrame(loop);setTimeout(()=>{try{cv.focus({preventScroll:true})}catch(e){}},50);
  // Pauze (tandwiel): de spellus stopt; bij verder gaat de tijd verder waar hij was.
  let wasRunning=false;
  return {cleanup:()=>{cancelAnimationFrame(raf);window.removeEventListener('resize',size);},
    pause(){wasRunning=Boolean(raf);cancelAnimationFrame(raf);raf=0;},
    resume(){if(wasRunning&&!raf){last=0;raf=requestAnimationFrame(loop);}}};
}
