// Gloop game-module. Wordt alleen geladen als iemand deze game speelt.
import {data,save} from '../store';
import {blob,ICON} from '../blob';
import {finishCommon} from './common';
import {sfx} from '../sfx';
import {toast} from '../toast';
/* ---------- Stapelslijm ---------- */
export default function start(stage,g,restart){
  const LW=360,LH=560,BH=28,BASEW=200,PAL=['#6BE38A','#FFD84A','#FF7AC6','#8B6CFF','#5CC8FF','#FF9F5A'];
  stage.innerHTML=`<div class="stapel-wrap"><canvas class="stapel" id="stc" tabindex="0" role="button" aria-label="Stapelslijm: tik of druk op spatie om het blok te laten vallen"></canvas>
    <p class="stapel-help">Tik op het scherm (of druk op spatie) om het slijmblok te laten vallen. Mis je de rand, dan wordt het blok kleiner. Precies erop? Dan groeit het weer een beetje!</p></div>`;
  const cv=document.getElementById('stc'),ctx=cv.getContext('2d');let sc=1,dpr=1;
  function size(){const wrapW=cv.parentElement.clientWidth;let w=Math.min(wrapW,460),h=w*LH/LW;const maxH=Math.max(380,window.innerHeight*.7);if(h>maxH){h=maxH;w=h*LW/LH;}
    dpr=Math.min(2,window.devicePixelRatio||1);cv.style.width=w+'px';cv.style.height=h+'px';cv.width=Math.round(w*dpr);cv.height=Math.round(h*dpr);sc=w/LW;}
  size();window.addEventListener('resize',size);
  const BODY=new Path2D('M100 20 C152 20 180 58 180 106 C180 134 174 152 166 162 C160 170 158 184 150 184 C142 184 142 170 134 170 C126 170 126 180 118 180 C110 180 110 168 100 168 C90 168 90 188 80 188 C70 188 72 170 62 170 C52 170 48 180 40 176 C28 168 20 144 20 106 C20 58 48 20 100 20 Z');
  let state='ready',stack,cur,falling,pops,camY,score,perfects,combo,squish,t0,raf=0,last=0,overT=0;
  function reset(){stack=[{x:(LW-BASEW)/2,w:BASEW,c:'#B3ABE0',drips:[]}];falling=[];pops=[];camY=0;score=0;perfects=0;combo=0;squish=0;newBlock();}
  function speed(){return Math.min(430,150+score*7)*(g.speed||1);}
  function newBlock(){const top=stack[stack.length-1],dir=score%2===0?1:-1;cur={w:top.w,x:dir>0?-top.w*.15:LW-top.w*.85,dir,c:PAL[(score)%PAL.length]};}
  function rr(x,y,w,h,r){ctx.beginPath();ctx.moveTo(x+r,y);ctx.arcTo(x+w,y,x+w,y+h,r);ctx.arcTo(x+w,y+h,x,y+h,r);ctx.arcTo(x,y+h,x,y,r);ctx.arcTo(x,y,x+w,y,r);ctx.closePath();}
  function block(x,y,w,c,drips){const r=Math.min(9,w/2);
    if(drips)for(const d of drips){ctx.fillStyle=c;rr(x+d.x*w-4,y+BH-6,8,6+d.l,4);ctx.fill();ctx.strokeStyle='#221A48';ctx.lineWidth=2.5;ctx.stroke();}
    ctx.fillStyle=c;rr(x,y,w,BH,r);ctx.fill();ctx.lineWidth=3;ctx.strokeStyle='#221A48';ctx.stroke();
    ctx.fillStyle='rgba(255,255,255,.45)';rr(x+6,y+5,Math.max(0,w-12),5,3);ctx.fill();}
  function gloopie(cx,by,c){const s=.24,sq=1-squish*.3;ctx.save();ctx.translate(cx,by);ctx.scale(s*(1+squish*.2),s*sq);ctx.translate(-100,-188);
    ctx.fillStyle=c;ctx.fill(BODY);ctx.lineWidth=12;ctx.strokeStyle='#221A48';ctx.stroke(BODY);
    for(const ex of[78,122]){ctx.beginPath();ctx.ellipse(ex,100,15,18,0,0,7);ctx.fillStyle='#fff';ctx.fill();ctx.lineWidth=8;ctx.stroke();ctx.beginPath();ctx.arc(ex+4,104,8,0,7);ctx.fillStyle='#221A48';ctx.fill();}
    ctx.beginPath();if(state==='over'){ctx.moveTo(88,142);ctx.quadraticCurveTo(100,128,112,142);}else{ctx.moveTo(88,130);ctx.quadraticCurveTo(100,146,112,130);}ctx.lineWidth=9;ctx.lineCap='round';ctx.stroke();ctx.restore();}
  function bg(){const k=Math.min(1,score/60);const a=[233,247,255],b=[42,31,92];const col=a.map((v,i)=>Math.round(v+(b[i]-v)*k));
    ctx.fillStyle=`rgb(${col})`;ctx.fillRect(0,0,LW,LH);
    if(k>.35){ctx.fillStyle=`rgba(255,255,255,${(k-.35)*1.4})`;for(let i=0;i<40;i++){const x=(i*97)%LW,y=((i*53)+camY*.3)%LH;ctx.fillRect(x,y,2,2);}}
    ctx.fillStyle='rgba(255,255,255,.7)';for(const [x,y,w] of[[40,90,70],[250,180,90],[120,300,60]]){const yy=(y+camY*.5)%(LH+60)-30;rr(x,yy,w,20,10);ctx.fill();}}
  function scrY(i){return LH-110-(i*BH-camY);}
  function draw(){ctx.setTransform(sc*dpr,0,0,sc*dpr,0,0);bg();
    const top=stack.length-1;for(let i=Math.max(0,top-24);i<=top;i++){const b=stack[i];const y=scrY(i);if(y>LH+BH)continue;block(b.x,y,b.w,b.c,b.drips);}
    if(state!=='over'&&cur){block(cur.x,scrY(stack.length),cur.w,cur.c,null);}
    const tb=stack[top];gloopie(tb.x+tb.w/2,scrY(top),state==='over'?'#B3ABE0':'#6BE38A');
    for(const f of falling){ctx.save();ctx.translate(f.x+f.w/2,f.y+BH/2);ctx.rotate(f.r);block(-f.w/2,-BH/2,f.w,f.c,null);ctx.restore();}
    ctx.textAlign='center';ctx.fillStyle='#221A48';ctx.strokeStyle='#FFFFFF';ctx.lineWidth=6;ctx.font='700 54px Fredoka, Nunito, sans-serif';ctx.strokeText(score,LW/2,70);ctx.fillText(score,LW/2,70);
    for(const p of pops){ctx.globalAlpha=Math.max(0,1-p.t);ctx.font='700 24px Fredoka, Nunito, sans-serif';ctx.lineWidth=5;ctx.strokeText(p.txt,LW/2,p.y);ctx.fillStyle='#FF4FA8';ctx.fillText(p.txt,LW/2,p.y);ctx.fillStyle='#221A48';ctx.globalAlpha=1;}
    if(state==='ready'){ctx.fillStyle='rgba(34,26,72,.55)';ctx.fillRect(0,LH/2-46,LW,92);ctx.fillStyle='#fff';ctx.font='700 30px Fredoka, Nunito, sans-serif';ctx.fillText('Tik om te starten',LW/2,LH/2+4);ctx.font='600 15px Nunito, sans-serif';ctx.fillText('Bouw de hoogste slijmtoren',LW/2,LH/2+30);}}
  function drop(){
    if(state==='ready'){state='play';return;}
    if(state!=='play')return;
    const top=stack[stack.length-1],y=scrY(stack.length);
    const L=Math.max(cur.x,top.x),R=Math.min(cur.x+cur.w,top.x+top.w),ov=R-L;
    if(ov<=0){falling.push({x:cur.x,y,w:cur.w,c:cur.c,vy:0,r:0,vr:cur.dir*.06});cur=null;state='over';overT=0;return;}
    let nb;
    if(Math.abs(cur.x-top.x)<=5){combo++;perfects++;sfx('good');const w=Math.min(BASEW,top.w+(combo>=2?8:4));nb={x:top.x-(w-top.w)/2,w,c:cur.c};pops.push({txt:combo>1?`Perfect! ×${combo}`:'Perfect!',y:120,t:0});}
    else{combo=0;nb={x:L,w:ov,c:cur.c};const cutL=cur.x<top.x;const fx=cutL?cur.x:R,fw=cur.w-ov;if(fw>0)falling.push({x:fx,y,w:fw,c:cur.c,vy:0,r:0,vr:(cutL?-1:1)*.08});}
    nb.drips=Array.from({length:nb.w>60?2:1},()=>({x:.15+Math.random()*.7,l:3+Math.random()*9}));
    stack.push(nb);sfx('pop');score++;squish=1;newBlock();}
  function loop(now){raf=requestAnimationFrame(loop);const dt=Math.min(.05,(now-(last||now))/1000);last=now;
    if(state==='play'&&cur){cur.x+=cur.dir*speed()*dt;const minX=-cur.w*.35,maxX=LW-cur.w*.65;if(cur.x>maxX){cur.x=maxX;cur.dir=-1;}if(cur.x<minX){cur.x=minX;cur.dir=1;}}
    const target=Math.max(0,(stack.length-9)*BH);camY+=(target-camY)*Math.min(1,dt*6);
    for(const f of falling){f.vy+=900*dt;f.y+=f.vy*dt;f.r+=f.vr;}falling=falling.filter(f=>f.y<LH+80);
    for(const p of pops){p.t+=dt*1.2;p.y-=30*dt;}pops=pops.filter(p=>p.t<1);
    squish=Math.max(0,squish-dt*4);
    if(state==='over'){overT+=dt;if(overT>1.1){state='done';finish();}}
    draw();}
  function finish(){cancelAnimationFrame(raf);raf=0;
    const prev=data.records[g.rk];const isRec=!prev||score>prev;if(isRec&&score>0)data.records[g.rk]=score;
    const face=isRec&&score>0?'grin':score<8?'sad':'happy';
    stage.innerHTML=finishCommon(g,{score},isRec&&score>0,[`Hoogte <b>${score} lagen</b>`,`Perfecte drops <b>${perfects}</b>`,`Jouw record <b>${data.records[g.rk]||0} lagen</b>`],face);
    document.getElementById('again').addEventListener('click',()=>restart());}
  const onDown=e=>{e.preventDefault();drop();};
  const onKey=e=>{if(e.key===' '||e.key==='Enter'){e.preventDefault();if(!e.repeat)drop();}};
  cv.addEventListener('pointerdown',onDown);cv.addEventListener('keydown',onKey);
  reset();raf=requestAnimationFrame(loop);setTimeout(()=>{try{cv.focus({preventScroll:true})}catch(e){}},50);
  return ()=>{cancelAnimationFrame(raf);window.removeEventListener('resize',size);};
}
