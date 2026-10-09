// Gloop game-module. Wordt alleen geladen als iemand deze game speelt.
import {data} from '../store';
import {blob} from '../blob';
import {finishCommon} from './common';
import {sfx} from '../sfx';
/* ---------- Gloop Popper ---------- */
// Bubbels met een Gloop erin stijgen op. Tik ze kapot voordat ze bovenaan ontsnappen.
// Pas op voor onweerswolken; pak sterren, ijs (alles even langzaam), knallers (alles knapt) en hartjes.
// Niveau: Makkelijk = 4 banen, 5 hartjes en rustiger; Normaal = 5 banen; Moeilijk = sneller en meer wolken.
const EMO='"Apple Color Emoji","Segoe UI Emoji","Noto Color Emoji",sans-serif';
const GLOOPS=[['#6BE38A','happy'],['#FF7AC6','love'],['#FFD84A','grin'],['#5CC8FF','cool'],['#8B6CFF','wink'],['#FF9F5A','tongue']];
const SPECIAL={star:{e:'⭐',c:'#FFE27A'},cloud:{e:'⛈️',c:'#7D7896'},ice:{e:'❄️',c:'#BDEBFF'},mega:{e:'💥',c:'#FFB0D9'},heart:{e:'❤️',c:'#FFC2CF'}};
const pick=list=>{const tot=list.reduce((a,b)=>a+b[1],0);let r=Math.random()*tot;for(const [k,w] of list){if((r-=w)<0)return k;}return list[0][0];};

// Gloop-plaatjes één keer omzetten naar afbeeldingen voor het canvas.
const IMG={};
function gloopImg(i){
  if(IMG[i])return IMG[i];
  const im=new Image();
  im.src='data:image/svg+xml;charset=utf-8,'+encodeURIComponent(blob(GLOOPS[i][0],GLOOPS[i][1],'').replace('<svg ','<svg xmlns="http://www.w3.org/2000/svg" '));
  return IMG[i]=im;
}

export default function start(stage,g,restart){
  const LW=360,LH=560,TOP=76,SPD=g.speed||1,N=SPD<1?4:5,MAXH=SPD<1?5:3,R=30;
  stage.innerHTML=`<div class="stapel-wrap"><canvas class="stapel popper" id="ppc" tabindex="0" role="application" aria-label="Gloop Popper: tik op de bubbels voordat ze bovenaan ontsnappen. Op een toetsenbord: cijfertoetsen 1 tot ${N} voor elke baan."></canvas>
    <p class="stapel-help">Tik (of klik) op de bubbels voordat ze bovenaan ontsnappen. Niet op de onweerswolken ⛈️ tikken! Pak ⭐ voor extra punten, ❄️ om alles langzamer te maken, 💥 om alles te laten knallen en ❤️ voor een extra hartje. Op een toetsenbord: cijfertoetsen 1 tot ${N} knallen de bovenste bubbel in die baan.</p></div>`;
  const cv=document.getElementById('ppc'),ctx=cv.getContext('2d');let sc=1,dpr=1;
  function size(){const wrapW=cv.parentElement.clientWidth;let w=Math.min(wrapW,460),h=w*LH/LW;const maxH=Math.max(380,window.innerHeight*.72);if(h>maxH){h=maxH;w=h*LW/LH;}
    dpr=Math.min(2,window.devicePixelRatio||1);cv.style.width=w+'px';cv.style.height=h+'px';cv.width=Math.round(w*dpr);cv.height=Math.round(h*dpr);sc=w/LW;}
  size();window.addEventListener('resize',size);
  for(let i=0;i<GLOOPS.length;i++)gloopImg(i);
  const toLogic=e=>{const r=cv.getBoundingClientRect();return {x:(e.clientX-r.left)/r.width*LW,y:(e.clientY-r.top)/r.height*LH};};
  const laneX=i=>LW*(i+.5)/N;

  let state='ready',t=0,el=0,score=0,popped=0,combo=0,best=0,hearts=MAXH,freeze=0,shake=0,spawnT=.6,bubbles=[],fx=[],msg='',msgT=0,raf=0,last=0,kbd=false,lastLane=-1;
  const mult=()=>Math.min(5,1+Math.floor(combo/5));
  const rise=()=>Math.min(260,70+el*1.6)*SPD*(freeze>0?.35:1);

  function spawn(){
    // Niet twee keer achter elkaar in dezelfde baan, zodat bubbels niet op elkaar liggen.
    let lane=Math.floor(Math.random()*N);if(lane===lastLane)lane=(lane+1+Math.floor(Math.random()*(N-1)))%N;lastLane=lane;
    const clouds=el<8?0:SPD>1?14:SPD<1?6:10;
    const k=pick([['gloop',80],['star',6],['cloud',clouds],['ice',el>15?2:0],['mega',el>25?2:0],['heart',hearts<MAXH&&el>20?1.2:0]].filter(x=>x[1]>0));
    bubbles.push({k,g:Math.floor(Math.random()*GLOOPS.length),lane,x:laneX(lane),y:LH+R+4,ph:Math.random()*6.3,sp:.85+Math.random()*.3,s:1});
  }
  function burst(b,txt,col){
    for(let i=0;i<10;i++){const a=i/10*6.283;fx.push({x:b.x,y:b.y,vx:Math.cos(a)*120,vy:Math.sin(a)*120,t:0,c:col});}
    if(txt)fx.push({x:b.x,y:b.y,t:0,txt});
  }
  function pop(b,chain){
    b.dead=true;
    if(b.k==='cloud'){ // au! onweer
      hearts--;combo=0;shake=.4;sfx('oops');burst(b,'Au!','#7D7896');
      if(hearts<=0)over('Oei! Te veel onweer.');return;
    }
    combo++;best=Math.max(best,combo);popped++;
    const m=mult(),pts=(b.k==='star'?5:1)*m;score+=pts;
    if(combo%5===0&&m<=5&&combo<=20&&!chain){sfx('good');msg=`Combo x${m}!`;msgT=1;}else sfx('pop');
    burst(b,'+'+pts,b.k==='gloop'?GLOOPS[b.g][0]:SPECIAL[b.k].c);
    if(b.k==='ice'){freeze=4;msg='Brrr! Alles gaat langzaam.';msgT=1.4;}
    if(b.k==='heart'){hearts=Math.min(MAXH,hearts+1);msg='Extra hartje!';msgT=1.2;}
    if(b.k==='mega'){msg='KNAL!';msgT=1;shake=.25;for(const o of bubbles)if(!o.dead&&o.k!=='cloud'&&o.y<LH+R)pop(o,true);}
  }
  function escape(b){
    b.dead=true;if(b.k==='cloud')return;  // een wolk mag gewoon wegvliegen
    hearts--;combo=0;sfx('oops');fx.push({x:b.x,y:TOP+14,t:0,txt:'Ontsnapt!'});
    if(hearts<=0)over('Oei! Te veel bubbels ontsnapt.');
  }
  function over(text){state='over';msg=text;msgT=1.8;}
  function begin(){if(state!=='ready')return;state='play';msg='Pop de bubbels!';msgT=1.2;sfx('good');}

  // Besturing: tikken/klikken, of cijfertoetsen per baan
  cv.addEventListener('pointerdown',e=>{
    e.preventDefault();cv.focus({preventScroll:true});kbd=false;
    if(state==='ready'){begin();return;}
    if(state!=='play')return;
    const p=toLogic(e);let hit=null,d=1e9;
    for(const b of bubbles){if(b.dead)continue;const dd=((b.dx??b.x)-p.x)**2+(b.y-p.y)**2;if(dd<(R*b.s+10)**2&&dd<d){d=dd;hit=b;}}
    if(hit)pop(hit);
  });
  const kd=e=>{
    if(state==='ready'&&(e.key===' '||e.key==='Enter'||/^[1-9]$/.test(e.key))){e.preventDefault();kbd=true;begin();return;}
    const k=+e.key;if(state!=='play'||!(k>=1&&k<=N)||e.repeat)return;
    e.preventDefault();kbd=true;
    // de bovenste bubbel in die baan (die het eerst zou ontsnappen)
    const b=bubbles.filter(o=>!o.dead&&o.lane===k-1&&o.y<LH+R).sort((a,c)=>a.y-c.y)[0];
    if(b)pop(b);
  };
  cv.addEventListener('keydown',kd);

  function drawBubble(b){
    const x=b.x+Math.sin(t*1.6+b.ph)*7,y=b.y,r=R*b.s;b.dx=x;
    ctx.save();
    const sp=SPECIAL[b.k];
    ctx.beginPath();ctx.arc(x,y,r,0,7);
    ctx.fillStyle=sp?sp.c:'rgba(255,255,255,.55)';ctx.globalAlpha=sp?.95:1;ctx.fill();ctx.globalAlpha=1;
    if(b.k==='gloop'){const im=gloopImg(b.g);if(im.complete&&im.naturalWidth)ctx.drawImage(im,x-r*.72,y-r*.7,r*1.44,r*1.44);else{ctx.fillStyle=GLOOPS[b.g][0];ctx.beginPath();ctx.arc(x,y+2,r*.6,0,7);ctx.fill();}}
    else{ctx.font=`${Math.round(r*1.05)}px ${EMO}`;ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillStyle='#221A48';ctx.fillText(sp.e,x,y+2);}
    // glans en rand
    ctx.lineWidth=3;ctx.strokeStyle=b.k==='cloud'?'#221A48':'rgba(34,26,72,.85)';ctx.beginPath();ctx.arc(x,y,r,0,7);ctx.stroke();
    ctx.strokeStyle='rgba(255,255,255,.9)';ctx.lineWidth=4;ctx.lineCap='round';ctx.beginPath();ctx.arc(x,y,r-7,3.6,4.4);ctx.stroke();
    if(b.k==='star'||b.k==='mega'){ctx.strokeStyle='#FFD84A';ctx.lineWidth=3;ctx.globalAlpha=.6+Math.sin(t*8)*.3;ctx.beginPath();ctx.arc(x,y,r+4,0,7);ctx.stroke();}
    ctx.restore();
  }
  function draw(){
    ctx.setTransform(sc*dpr,0,0,sc*dpr,0,0);
    const sx=shake?(Math.random()-.5)*shake*18:0;ctx.save();ctx.translate(sx,0);
    // lucht met zachte strepen per baan
    const gr=ctx.createLinearGradient(0,0,0,LH);gr.addColorStop(0,freeze>0?'#CFEFFF':'#BDE6FF');gr.addColorStop(1,freeze>0?'#EAF8FF':'#F4F2FF');
    ctx.fillStyle=gr;ctx.fillRect(-20,0,LW+40,LH);
    ctx.fillStyle='rgba(106,75,235,.05)';for(let i=0;i<N;i+=2)ctx.fillRect(LW*i/N,0,LW/N,LH);
    // wolkjes op de achtergrond
    ctx.fillStyle='rgba(255,255,255,.7)';for(const [cx,cy] of [[60,170],[290,260],[120,420]]){const yy=(cy+t*8)%(LH+60)-30;ctx.beginPath();ctx.arc(cx,yy,22,0,7);ctx.arc(cx+24,yy+4,18,0,7);ctx.arc(cx-22,yy+6,16,0,7);ctx.fill();}
    for(const b of bubbles)if(!b.dead)drawBubble(b);
    for(const q of fx){
      if(q.txt){ctx.globalAlpha=Math.max(0,1-q.t);ctx.font='700 20px Fredoka, Nunito, sans-serif';ctx.textAlign='center';ctx.lineWidth=5;ctx.strokeStyle='#fff';ctx.strokeText(q.txt,q.x,q.y-q.t*34);ctx.fillStyle='#221A48';ctx.fillText(q.txt,q.x,q.y-q.t*34);}
      else{ctx.globalAlpha=Math.max(0,1-q.t*1.6);ctx.fillStyle=q.c;ctx.beginPath();ctx.arc(q.x+q.vx*q.t*.5,q.y+q.vy*q.t*.5,5,0,7);ctx.fill();}
    }
    ctx.globalAlpha=1;
    // baannummers onderin als je met het toetsenbord speelt
    if(kbd){ctx.font='700 16px Fredoka, Nunito, sans-serif';ctx.textAlign='center';for(let i=0;i<N;i++){ctx.fillStyle='rgba(34,26,72,.55)';ctx.fillText(String(i+1),laneX(i),LH-12);}}
    // bovenbalk: punten, combo en hartjes
    ctx.fillStyle='rgba(255,255,255,.94)';ctx.beginPath();ctx.roundRect?ctx.roundRect(10,10,LW-20,58,18):ctx.rect(10,10,LW-20,58);ctx.fill();ctx.lineWidth=3;ctx.strokeStyle='#221A48';ctx.stroke();
    ctx.fillStyle='#221A48';ctx.textAlign='left';ctx.textBaseline='alphabetic';ctx.font='700 24px Fredoka, Nunito, sans-serif';ctx.fillText(score,24,40);
    ctx.font='700 12px Nunito, sans-serif';ctx.fillStyle='#4A4270';ctx.fillText('punten',24,56);
    if(mult()>1){ctx.fillStyle='#FF7AC6';ctx.beginPath();ctx.roundRect?ctx.roundRect(LW/2-34,22,68,30,15):ctx.rect(LW/2-34,22,68,30);ctx.fill();ctx.strokeStyle='#221A48';ctx.lineWidth=3;ctx.stroke();
      ctx.fillStyle='#221A48';ctx.textAlign='center';ctx.font='700 18px Fredoka, Nunito, sans-serif';ctx.fillText('x'+mult(),LW/2,43);}
    ctx.textAlign='right';ctx.font=`18px ${EMO}`;ctx.fillStyle='#221A48';ctx.fillText('💜'.repeat(Math.max(0,hearts))+'🤍'.repeat(Math.max(0,MAXH-hearts)),LW-22,46);
    if(msgT>0||state==='ready'){
      const big=state==='ready'||state==='over',txt=state==='ready'?'Tik om te beginnen!':msg;
      ctx.globalAlpha=big?1:Math.min(1,msgT*2);
      const bx=big?30:60,by=big?LH/2-60:86,bw=big?LW-60:LW-120,bh=state==='ready'?96:big?60:36;
      ctx.fillStyle=big?'rgba(34,26,72,.8)':'rgba(34,26,72,.6)';ctx.beginPath();ctx.roundRect?ctx.roundRect(bx,by,bw,bh,16):ctx.rect(bx,by,bw,bh);ctx.fill();
      ctx.fillStyle='#fff';ctx.textAlign='center';ctx.font=big?'700 22px Fredoka, Nunito, sans-serif':'700 16px Fredoka, Nunito, sans-serif';ctx.fillText(txt,LW/2,big?LH/2-24:by+24);
      if(state==='ready'){ctx.font='600 14px Nunito, sans-serif';ctx.fillText(`Laat ze niet ontsnappen! ${MAXH} hartjes.`,LW/2,LH/2+4);}
      ctx.globalAlpha=1;
    }
    ctx.restore();
  }
  function loop(now){raf=requestAnimationFrame(loop);const dt=Math.min(.033,(now-(last||now))/1000);last=now;t+=dt;
    if(state==='play'){
      el+=dt;freeze=Math.max(0,freeze-dt);
      spawnT-=dt*(freeze>0?.4:1);
      if(spawnT<=0){spawn();spawnT=Math.max(.3,1.1-el*.009)/Math.sqrt(SPD)*(.75+Math.random()*.5);}
      const v=rise();
      for(const b of bubbles){if(b.dead)continue;b.y-=v*b.sp*dt;if(b.y+R<TOP+6)escape(b);if(state!=='play')break;}
    }
    bubbles=bubbles.filter(b=>!b.dead);
    for(const q of fx)q.t+=dt*1.5;fx=fx.filter(q=>q.t<1);
    shake=Math.max(0,shake-dt);
    if(msgT>0){msgT-=dt;if(msgT<=0&&state==='over')finish();}
    if(state!=='done')draw();
  }
  function finish(){
    state='done';cancelAnimationFrame(raf);raf=0;
    const prev=data.records[g.rk];const isRec=score>0&&(!prev||score>prev);if(isRec)data.records[g.rk]=score;
    stage.innerHTML=finishCommon(g,{score,popped,combo:best},isRec,[`Punten <b>${score}</b>`,`Bubbels gepopt <b>${popped}</b>`,`Langste combo <b>${best}</b>`,`Jouw record <b>${data.records[g.rk]||0}</b>`],isRec?'grin':score>=100?'happy':'sad');
    document.getElementById('again').addEventListener('click',()=>restart());
  }
  raf=requestAnimationFrame(loop);
  // Pauze (tandwiel): de spellus stopt; bij verder gaat alles verder waar het was.
  let wasRunning=false;
  return {cleanup:()=>{cancelAnimationFrame(raf);window.removeEventListener('resize',size);},
    pause(){wasRunning=Boolean(raf);cancelAnimationFrame(raf);raf=0;},
    resume(){if(wasRunning&&!raf){last=0;raf=requestAnimationFrame(loop);}}};
}
