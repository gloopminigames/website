// Gloop game-module. Wordt alleen geladen als iemand deze game speelt.
import {data} from '../store';
import {blob} from '../blob';
import {finishCommon} from './common';
import {sfx,note} from '../sfx';
/* ---------- Gloopfusie ---------- */
// Laat Gloops in de pot vallen. Raken twee dezelfde elkaar, dan smelten ze samen tot een grotere Gloop.
// Komt de stapel te lang boven de stippellijn, dan is het afgelopen.
// Niveau: Makkelijk = kleinere Gloops en meer tijd boven de lijn; Moeilijk = grotere Gloops en minder tijd.
export const TIERS=[
  {n:'Druppel',c:'#B9A8FF',f:'sleepy',r:13},
  {n:'Spetter',c:'#5CC8FF',f:'wink',r:17},
  {n:'Bolletje',c:'#6BE38A',f:'happy',r:22},
  {n:'Blubber',c:'#B8F25A',f:'grin',r:28},
  {n:'Gloopje',c:'#FFD84A',f:'surprised',r:35},
  {n:'Gloop',c:'#FF9F5A',f:'tongue',r:43},
  {n:'Grote Gloop',c:'#FF7AC6',f:'love',r:52},
  {n:'Mega Gloop',c:'#8B6CFF',f:'cool',r:62},
  {n:'Reuzegloop',c:'#7DF2D0',f:'grin',r:74},
  {n:'Koning Gloop',c:'#F7C531',f:'happy',r:88,crown:true}
];
const PTS=TIERS.map((_,k)=>(k+1)*(k+2)/2);  // samensmelten tot niveau k levert dit op
const IMG=[];
function img(k){
  if(IMG[k])return IMG[k];
  const t=TIERS[k],im=new Image();
  im.src='data:image/svg+xml;charset=utf-8,'+encodeURIComponent(blob(t.c,t.f,'',t.crown).replace('<svg ','<svg xmlns="http://www.w3.org/2000/svg" '));
  return IMG[k]=im;
}

export default function start(stage,g,restart){
  const LW=360,LH=560,L=18,R=342,B=546,JAR_TOP=128,DANGER=142,SPD=g.speed||1;
  const GRACE=SPD<1?4:SPD>1?1.6:2.6;
  const SPAWN=SPD<1?[[0,5],[1,4],[2,3],[3,1]]:[[0,4],[1,3],[2,3],[3,2],[4,1]];
  stage.innerHTML=`<div class="stapel-wrap"><canvas class="stapel fusie" id="fsc" tabindex="0" role="application" aria-label="Gloopfusie: schuif met je vinger, de muis of de pijltjes en laat de Gloop vallen met loslaten, klikken of de spatiebalk."></canvas>
    <ol class="fusie-ladder" aria-label="Van klein naar groot">${TIERS.map(t=>`<li title="${t.n}">${blob(t.c,t.f,'fl-blob',t.crown)}</li>`).join('')}</ol>
    <p class="stapel-help">Schuif de Gloop naar links of rechts en laat hem vallen. Raken twee dezelfde Gloops elkaar, dan smelten ze samen tot een grotere! Pas op dat de stapel niet boven de stippellijn blijft. Op een toetsenbord: pijltjes en spatie.</p></div>`;
  const cv=document.getElementById('fsc'),ctx=cv.getContext('2d');let sc=1,dpr=1;
  function size(){const wrapW=cv.parentElement.clientWidth;let w=Math.min(wrapW,460),h=w*LH/LW;const maxH=Math.max(380,window.innerHeight*.7);if(h>maxH){h=maxH;w=h*LW/LH;}
    dpr=Math.min(2,window.devicePixelRatio||1);cv.style.width=w+'px';cv.style.height=h+'px';cv.width=Math.round(w*dpr);cv.height=Math.round(h*dpr);sc=w/LW;}
  size();window.addEventListener('resize',size);
  TIERS.forEach((_,k)=>img(k));
  const toLogic=e=>{const r=cv.getBoundingClientRect();return (e.clientX-r.left)/r.width*LW;};
  const pick=()=>{const tot=SPAWN.reduce((a,b)=>a+b[1],0);let r=Math.random()*tot;for(const [k,w] of SPAWN){if((r-=w)<0)return k;}return 0;};

  let state='ready',balls=[],fx=[],score=0,biggest=0,merges=0,cur=pick(),next=pick(),hx=LW/2,cool=0,danger=0,t=0,raf=0,last=0,keys={l:false,r:false},msg='',msgT=0,id=0;
  const clampX=(x,k)=>Math.max(L+TIERS[k].r,Math.min(R-TIERS[k].r,x));

  function drop(){
    if(state==='ready'){state='play';}
    if(state!=='play'||cool>0)return;
    const k=cur;balls.push({id:id++,k,x:clampX(hx,k),y:JAR_TOP-TIERS[k].r-2,vx:0,vy:60,r:TIERS[k].r,m:TIERS[k].r**2,age:0,pop:0});
    cur=next;next=pick();cool=.55;sfx('tap');
  }
  function merge(a,b){
    a.dead=b.dead=true;
    const k=a.k+1,x=(a.x*a.m+b.x*b.m)/(a.m+b.m),y=(a.y*a.m+b.y*b.m)/(a.m+b.m);
    merges++;
    if(k>=TIERS.length){ // twee Koningen: allebei weg, groot feest
      score+=500;sfx('record');msg='WAUW! Dubbele Koning!';msgT=2;burst(x,y,'#F7C531',24);fx.push({x,y,t:0,txt:'+500'});return;
    }
    const nb={id:id++,k,x,y,vx:(a.vx+b.vx)/2,vy:Math.min(a.vy,b.vy)/2-40,r:TIERS[k].r,m:TIERS[k].r**2,age:1,pop:1};
    nb.x=clampX(nb.x,k);balls.push(nb);
    score+=PTS[k];note(k%8);
    if(k>biggest){biggest=k;if(k>=4){msg=`Nieuw: ${TIERS[k].n}!`;msgT=1.6;if(k>=6)sfx('good');}}
    burst(x,y,TIERS[k].c,10);fx.push({x,y,t:0,txt:'+'+PTS[k]});
  }
  function burst(x,y,c,n){for(let i=0;i<n;i++){const a=i/n*6.283;fx.push({x,y,vx:Math.cos(a)*140,vy:Math.sin(a)*140,t:0,c});}}

  // Natuurkunde: zwaartekracht, wanden en botsende rondjes (een paar keer per frame voor een stabiele stapel)
  function physics(dt){
    const G=900;
    for(const b of balls){b.vy+=G*dt;b.vx*=.995;b.x+=b.vx*dt;b.y+=b.vy*dt;b.age+=dt;b.pop=Math.max(0,b.pop-dt*4);}
    for(let it=0;it<3;it++){
      for(let i=0;i<balls.length;i++){const a=balls[i];if(a.dead)continue;
        for(let j=i+1;j<balls.length;j++){const b=balls[j];if(b.dead)continue;
          let dx=b.x-a.x,dy=b.y-a.y,d=Math.hypot(dx,dy);const min=a.r+b.r;
          if(d>=min)continue;
          if(a.k===b.k){merge(a,b);break;}
          if(d<.01){dx=.01;dy=0;d=.01;}
          const nx=dx/d,ny=dy/d,ov=min-d,tot=a.m+b.m;
          a.x-=nx*ov*b.m/tot;a.y-=ny*ov*b.m/tot;b.x+=nx*ov*a.m/tot;b.y+=ny*ov*a.m/tot;
          const rv=(b.vx-a.vx)*nx+(b.vy-a.vy)*ny;
          if(rv<0){const jn=-(1.1)*rv/(1/a.m+1/b.m);a.vx-=jn*nx/a.m;a.vy-=jn*ny/a.m;b.vx+=jn*nx/b.m;b.vy+=jn*ny/b.m;}
          // een beetje wrijving langs elkaar, zodat de stapel tot rust komt
          const tx=-ny,ty=nx,rt=(b.vx-a.vx)*tx+(b.vy-a.vy)*ty,f=rt*.08;a.vx+=tx*f;a.vy+=ty*f;b.vx-=tx*f;b.vy-=ty*f;
        }
      }
      for(const b of balls){if(b.dead)continue;
        if(b.x-b.r<L){b.x=L+b.r;b.vx=Math.abs(b.vx)*.3;}
        if(b.x+b.r>R){b.x=R-b.r;b.vx=-Math.abs(b.vx)*.3;}
        if(b.y+b.r>B){b.y=B-b.r;if(b.vy>0)b.vy=-b.vy*.15;b.vx*=.96;}
      }
      balls=balls.filter(b=>!b.dead);
    }
  }

  // Besturing
  let down=false;
  cv.addEventListener('pointerdown',e=>{e.preventDefault();cv.focus({preventScroll:true});down=true;hx=toLogic(e);cv.setPointerCapture?.(e.pointerId);});
  cv.addEventListener('pointermove',e=>{if(down||e.pointerType==='mouse')hx=toLogic(e);});
  cv.addEventListener('pointerup',e=>{if(!down)return;down=false;hx=toLogic(e);drop();});
  cv.addEventListener('pointercancel',()=>{down=false;});
  const kd=e=>{const k=e.key;
    if(k==='ArrowLeft'||k==='a'){keys.l=true;e.preventDefault();}
    else if(k==='ArrowRight'||k==='d'){keys.r=true;e.preventDefault();}
    else if((k===' '||k==='Enter'||k==='ArrowDown')&&!e.repeat){e.preventDefault();drop();}};
  const ku=e=>{if(e.key==='ArrowLeft'||e.key==='a')keys.l=false;if(e.key==='ArrowRight'||e.key==='d')keys.r=false;};
  cv.addEventListener('keydown',kd);cv.addEventListener('keyup',ku);

  function drawGloop(k,x,y,s=1,alpha=1){
    const r=TIERS[k].r*s,im=img(k);ctx.globalAlpha=alpha;
    if(im.complete&&im.naturalWidth){const w=r*2.5;ctx.drawImage(im,x-w/2,y-w*.53,w,w);}
    else{ctx.fillStyle=TIERS[k].c;ctx.beginPath();ctx.arc(x,y,r,0,7);ctx.fill();}
    ctx.globalAlpha=1;
  }
  function draw(){
    ctx.setTransform(sc*dpr,0,0,sc*dpr,0,0);
    ctx.fillStyle='#F4F2FF';ctx.fillRect(0,0,LW,LH);
    // pot
    ctx.fillStyle='#E4DDFF';ctx.beginPath();ctx.roundRect?ctx.roundRect(L,JAR_TOP-8,R-L,B-JAR_TOP+8,[6,6,22,22]):ctx.rect(L,JAR_TOP-8,R-L,B-JAR_TOP+8);ctx.fill();
    ctx.lineWidth=4;ctx.strokeStyle='#221A48';ctx.beginPath();ctx.moveTo(L-2,JAR_TOP-12);ctx.lineTo(L-2,B-18);ctx.quadraticCurveTo(L-2,B+2,L+18,B+2);ctx.lineTo(R-18,B+2);ctx.quadraticCurveTo(R+2,B+2,R+2,B-18);ctx.lineTo(R+2,JAR_TOP-12);ctx.stroke();
    // gevarenlijn
    ctx.setLineDash([8,8]);ctx.lineWidth=3;ctx.strokeStyle=danger>0&&Math.floor(t*8)%2?'#E0304E':'rgba(34,26,72,.35)';ctx.beginPath();ctx.moveTo(L,DANGER);ctx.lineTo(R,DANGER);ctx.stroke();ctx.setLineDash([]);
    // richtlijn en vasthouden
    if(state==='play'||state==='ready'){
      const x=clampX(hx,cur);
      ctx.strokeStyle='rgba(34,26,72,.18)';ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(x,JAR_TOP);ctx.lineTo(x,B);ctx.stroke();
      drawGloop(cur,x,JAR_TOP-TIERS[cur].r-2,1,cool>0?.45:1);
    }
    for(const b of balls)drawGloop(b.k,b.x,b.y,1+b.pop*.18);
    for(const q of fx){
      if(q.txt){ctx.globalAlpha=Math.max(0,1-q.t);ctx.font='700 20px Fredoka, Nunito, sans-serif';ctx.textAlign='center';ctx.lineWidth=5;ctx.strokeStyle='#fff';ctx.strokeText(q.txt,q.x,q.y-q.t*34);ctx.fillStyle='#221A48';ctx.fillText(q.txt,q.x,q.y-q.t*34);}
      else{ctx.globalAlpha=Math.max(0,1-q.t*1.6);ctx.fillStyle=q.c;ctx.beginPath();ctx.arc(q.x+q.vx*q.t*.5,q.y+q.vy*q.t*.5,5,0,7);ctx.fill();}
    }
    ctx.globalAlpha=1;
    // bovenbalk: punten en de volgende Gloop
    ctx.fillStyle='rgba(255,255,255,.95)';ctx.beginPath();ctx.roundRect?ctx.roundRect(10,6,LW-20,46,16):ctx.rect(10,6,LW-20,46);ctx.fill();ctx.lineWidth=3;ctx.strokeStyle='#221A48';ctx.stroke();
    ctx.fillStyle='#221A48';ctx.textAlign='left';ctx.textBaseline='alphabetic';ctx.font='700 24px Fredoka, Nunito, sans-serif';ctx.fillText(score,24,33);
    ctx.font='700 12px Nunito, sans-serif';ctx.fillStyle='#4A4270';ctx.fillText('punten',24,47);
    ctx.textAlign='right';ctx.font='700 13px Nunito, sans-serif';ctx.fillText('Volgende',LW-62,34);
    drawGloop(next,LW-38,30,Math.min(1,15/TIERS[next].r));
    if(msgT>0||state==='ready'){
      const big=state==='ready'||state==='over',txt=state==='ready'?'Tik om een Gloop te laten vallen!':msg;
      ctx.globalAlpha=big?1:Math.min(1,msgT*2);
      const bx=big?24:50,by=big?LH/2-60:72,bw=big?LW-48:LW-100,bh=state==='ready'?92:big?60:34;
      ctx.fillStyle=big?'rgba(34,26,72,.82)':'rgba(34,26,72,.62)';ctx.beginPath();ctx.roundRect?ctx.roundRect(bx,by,bw,bh,16):ctx.rect(bx,by,bw,bh);ctx.fill();
      ctx.fillStyle='#fff';ctx.textAlign='center';ctx.font=big?'700 19px Fredoka, Nunito, sans-serif':'700 15px Fredoka, Nunito, sans-serif';ctx.fillText(txt,LW/2,big?LH/2-24:by+22);
      if(state==='ready'){ctx.font='600 14px Nunito, sans-serif';ctx.fillText('Twee dezelfde? Die smelten samen!',LW/2,LH/2+4);}
      ctx.globalAlpha=1;
    }
  }
  function loop(now){raf=requestAnimationFrame(loop);const dt=Math.min(.033,(now-(last||now))/1000);last=now;t+=dt;
    if(keys.l)hx-=260*dt;if(keys.r)hx+=260*dt;hx=Math.max(L,Math.min(R,hx));
    if(state==='play'||state==='over'){
      const h=dt/2;physics(h);physics(h);
      cool=Math.max(0,cool-dt);
      if(state==='play'){
        // te lang boven de stippellijn? Dan is het afgelopen.
        const over=balls.some(b=>b.age>1.2&&b.y-b.r<DANGER&&Math.abs(b.vy)<120);
        danger=over?danger+dt:Math.max(0,danger-dt*2);
        if(danger>GRACE){state='over';msg='De pot is vol!';msgT=2;sfx('oops');}
      }
    }
    for(const q of fx)q.t+=dt*1.5;fx=fx.filter(q=>q.t<1);
    if(msgT>0){msgT-=dt;if(msgT<=0&&state==='over')finish();}
    if(state!=='done')draw();
  }
  function finish(){
    state='done';cancelAnimationFrame(raf);raf=0;
    const prev=data.records[g.rk];const isRec=score>0&&(!prev||score>prev);if(isRec)data.records[g.rk]=score;
    stage.innerHTML=finishCommon(g,{score,biggest,merges},isRec,[`Punten <b>${score}</b>`,`Grootste Gloop <b>${TIERS[biggest].n}</b>`,`Keer samengesmolten <b>${merges}</b>`,`Jouw record <b>${data.records[g.rk]||0}</b>`],isRec?'grin':biggest>=5?'happy':'sad');
    document.getElementById('again').addEventListener('click',()=>restart());
  }
  raf=requestAnimationFrame(loop);
  // Pauze (tandwiel): alles staat stil; geen tijd om stiekem te 'denken' nodig, want er loopt geen klok.
  let wasRunning=false;
  return {cleanup:()=>{cancelAnimationFrame(raf);window.removeEventListener('resize',size);},
    pause(){wasRunning=Boolean(raf);cancelAnimationFrame(raf);raf=0;keys.l=keys.r=false;down=false;},
    resume(){if(wasRunning&&!raf){last=0;raf=requestAnimationFrame(loop);}}};
}
