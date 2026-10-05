// Gloop game-module. Wordt alleen geladen als iemand deze game speelt.
// Gloop in de Ruimte – bedacht door een jonge Gloop-fan.
import {data} from '../store';
import {finishCommon} from './common';
import {sfx} from '../sfx';
/* ---------- Gloop in de Ruimte ---------- */
// Vlieg met de raket van planeet naar planeet en ontwijk wat er op je af komt.
// Elk level start vanaf de planeet waar je net bent geland; de dingen in de lucht horen bij die planeet.
const EMO='"Apple Color Emoji","Segoe UI Emoji","Noto Color Emoji",sans-serif';
const PLANETS=[
  {n:'de Aarde',k:'aarde',c:'#4FA3FF',c2:'#6BE38A',sky:'#9FD8FF',air:[['🐦',3],['✈️',2],['🎈',1]]},
  {n:'de Maan',k:'maan',c:'#CFCBDD',c2:'#A29EB8',sky:null,air:[['rock',3]]},
  {n:'Mars',k:'mars',c:'#E0603A',c2:'#B53C1E',sky:'#F2A27E',air:[['🌪️',2],['rock',2]]},
  {n:'Jupiter',k:'jupiter',c:'#E7B07A',c2:'#B97A4A',sky:'#F1CFA3',air:[['⚡',2],['☁️',2]]},
  {n:'Saturnus',k:'saturnus',c:'#F2D38A',c2:'#C9A55A',sky:'#F7E3B0',ring:true,air:[['❄️',2],['🧊',2]]},
  {n:'Uranus',k:'uranus',c:'#8FE3E8',c2:'#5CC2CC',sky:'#C2F2F4',air:[['❄️',2],['💨',2]]},
  {n:'Neptunus',k:'neptunus',c:'#4C6CF0',c2:'#2E44B8',sky:'#8EA3FF',air:[['💨',2],['🧊',2]]}
];
// Na Neptunus: verzonnen buitenaardse planeten
const ALIENS=['Slijmonia','Blobulon','Gloopiter','Wiebelwereld','Bubbelia','Plopplaneet','Kwalkosmos','Druppeldonia'];
const ALIEN_COL=[['#FF7AC6','#C94F98','#FFC2E4'],['#B8F25A','#7FB830','#E2FFB0'],['#8B6CFF','#5E44C9','#CFC2FF'],['#FF9F5A','#D06A2A','#FFD2B0']];
function planet(i){
  if(i<PLANETS.length)return PLANETS[i];
  const j=i-PLANETS.length,c=ALIEN_COL[j%ALIEN_COL.length];
  return {n:ALIENS[j%ALIENS.length],k:'alien',c:c[0],c2:c[1],sky:c[2],ring:j%3===1,air:[['🛸',2],['rock',2],['💫',1]]};
}
// In de ruimte; tussen Mars en Jupiter ligt de planetoïdengordel (veel rotsen).
function spaceMix(i){return i===2?[['rock',5],['☄️',2]]:[['🛰️',2],['☄️',2],['rock',2],['🛸',i>0?1:0]];}
const pick=list=>{const tot=list.reduce((a,b)=>a+b[1],0);let r=Math.random()*tot;for(const [k,w] of list){if((r-=w)<0)return k;}return list[0][0];};

export default function start(stage,g,restart){
  const LW=360,LH=560,RY=LH-118,SPD=g.speed||1,MAXH=SPD<1?5:3,LEVEL_T=32;
  stage.innerHTML=`<div class="stapel-wrap"><canvas class="stapel ruimte" id="rmc" tabindex="0" role="application" aria-label="Gloop in de Ruimte: sleep of gebruik de pijltjes om de raket te sturen en ontwijk alles wat op je af komt."></canvas>
    <p class="stapel-help">Sleep je vinger (of de muis) naar links en rechts om de raket te sturen. Op een toetsenbord: pijltjes of A en D. Ontwijk vogels, vliegtuigen, satellieten en meteorieten en pak de sterren. Bij elke planeet begint een nieuw level!</p></div>`;
  const cv=document.getElementById('rmc'),ctx=cv.getContext('2d');let sc=1,dpr=1;
  function size(){const wrapW=cv.parentElement.clientWidth;let w=Math.min(wrapW,460),h=w*LH/LW;const maxH=Math.max(380,window.innerHeight*.72);if(h>maxH){h=maxH;w=h*LW/LH;}
    dpr=Math.min(2,window.devicePixelRatio||1);cv.style.width=w+'px';cv.style.height=h+'px';cv.width=Math.round(w*dpr);cv.height=Math.round(h*dpr);sc=w/LW;}
  size();window.addEventListener('resize',size);
  const toLogic=e=>{const r=cv.getBoundingClientRect();return {x:(e.clientX-r.left)/r.width*LW,y:(e.clientY-r.top)/r.height*LH};};

  let state='ready',lvl=0,p=0,x=LW/2,tx=LW/2,hearts=MAXH,inv=0,score=0,stars=0,planets=0,obs=[],pops=[],spawnT=1,starT=2.5,t=0,shake=0,msg='',msgT=0,raf=0,last=0,keys={l:false,r:false},drag=false;
  const field=Array.from({length:70},()=>({x:Math.random()*LW,y:Math.random()*LH,s:Math.random()*1.8+.4,z:Math.random()*.8+.2}));
  const from=()=>planet(lvl),to=()=>planet(lvl+1);
  const speed=()=>(150+lvl*12)*SPD;  // hoe snel alles naar beneden komt

  function spawn(){
    const atm=p<.22&&from().sky,list=atm?from().air:spaceMix(lvl);
    const k=pick(list.filter(l=>l[1]>0));
    const o={k,x:20+Math.random()*(LW-40),y:-30,vx:0,r:16,rot:0,vr:(Math.random()-.5)*2,sz:30};
    if(k==='🐦'||k==='✈️'||k==='🛸'||k==='💨'){o.vx=(Math.random()<.5?-1:1)*(40+Math.random()*60)*SPD;o.x=o.vx>0?-20:LW+20;o.y=40+Math.random()*180;}
    if(k==='✈️'){o.sz=34;o.r=18;}
    if(k==='rock'||k==='☄️'){o.r=12+Math.random()*10;o.sz=o.r*2;o.vy=Math.random()*40;}
    if(k==='🎈'){o.vy=-40;}
    obs.push(o);
  }
  function hit(o){
    if(inv>0)return;
    hearts--;inv=1.6;shake=.35;sfx('oops');pops.push({x,y:RY-30,t:0,txt:'Au!'});
    if(hearts<=0){state='over';msg='Boem! Je raket is kapot.';msgT=1.6;}
  }
  function arrive(){
    planets++;score+=100*(lvl+1);sfx('good');
    state='land';msg=`Welkom op ${to().n}!`;msgT=2.2;
  }
  function nextLevel(){lvl++;p=0;obs=[];spawnT=1.2;state='play';msg=`Level ${lvl+1}: op naar ${to().n}!`;msgT=1.8;}

  // Besturing: slepen/aanraken/muis en toetsen
  cv.addEventListener('pointerdown',e=>{e.preventDefault();cv.focus({preventScroll:true});if(state==='ready'){state='play';msg=`Op naar ${to().n}!`;msgT=1.8;sfx('good');}drag=true;tx=toLogic(e).x;cv.setPointerCapture?.(e.pointerId);});
  cv.addEventListener('pointermove',e=>{if(drag||e.pointerType==='mouse')tx=toLogic(e).x;});
  const up=()=>{drag=false;};cv.addEventListener('pointerup',up);cv.addEventListener('pointercancel',up);
  const kd=e=>{const k=e.key.toLowerCase();
    if(state==='ready'&&(k===' '||k==='enter'||k==='arrowleft'||k==='arrowright'||k==='a'||k==='d')){e.preventDefault();state='play';msg=`Op naar ${to().n}!`;msgT=1.8;}
    if(k==='arrowleft'||k==='a'){keys.l=true;e.preventDefault();}if(k==='arrowright'||k==='d'){keys.r=true;e.preventDefault();}};
  const ku=e=>{const k=e.key.toLowerCase();if(k==='arrowleft'||k==='a')keys.l=false;if(k==='arrowright'||k==='d')keys.r=false;};
  cv.addEventListener('keydown',kd);cv.addEventListener('keyup',ku);

  const mix=(a,b,f)=>{const h=s=>[1,3,5].map(i=>parseInt(s.slice(i,i+2),16));const A=h(a),B=h(b);return `rgb(${A.map((v,i)=>Math.round(v+(B[i]-v)*f)).join(',')})`;};
  function drawPlanet(pl,cx,cy,r){
    ctx.save();
    if(pl.ring){ctx.strokeStyle=pl.c2;ctx.lineWidth=r*.14;ctx.beginPath();ctx.ellipse(cx,cy,r*1.7,r*.42,-.2,Math.PI,2*Math.PI);ctx.stroke();}
    ctx.beginPath();ctx.arc(cx,cy,r,0,7);ctx.fillStyle=pl.c;ctx.fill();
    ctx.save();ctx.clip();
    if(pl.k==='aarde'){ctx.fillStyle=pl.c2;for(const [a,b,s] of [[-.4,-.3,.45],[.35,.1,.38],[-.1,.45,.3]]){ctx.beginPath();ctx.ellipse(cx+a*r,cy+b*r,s*r,s*r*.7,a,0,7);ctx.fill();}}
    else if(pl.k==='jupiter'||pl.k==='saturnus'||pl.k==='neptunus'||pl.k==='uranus'){ctx.fillStyle=pl.c2;for(let i=-3;i<=3;i+=2){ctx.fillRect(cx-r,cy+i*r*.22,r*2,r*.12);}if(pl.k==='jupiter'){ctx.fillStyle='#C2552E';ctx.beginPath();ctx.ellipse(cx+r*.35,cy+r*.3,r*.2,r*.12,0,0,7);ctx.fill();}}
    else{ctx.fillStyle=pl.c2;for(const [a,b,s] of [[-.4,-.2,.18],[.3,.25,.22],[.1,-.5,.12],[-.2,.5,.14]]){ctx.beginPath();ctx.arc(cx+a*r,cy+b*r,s*r,0,7);ctx.fill();}}
    ctx.fillStyle='rgba(255,255,255,.18)';ctx.beginPath();ctx.arc(cx-r*.35,cy-r*.35,r*.5,0,7);ctx.fill();
    ctx.restore();
    ctx.lineWidth=3;ctx.strokeStyle='#221A48';ctx.beginPath();ctx.arc(cx,cy,r,0,7);ctx.stroke();
    if(pl.ring){ctx.strokeStyle=pl.c2;ctx.lineWidth=r*.14;ctx.beginPath();ctx.ellipse(cx,cy,r*1.7,r*.42,-.2,0,Math.PI);ctx.stroke();}
    ctx.restore();
  }
  function drawRocket(cx,cy){
    ctx.save();ctx.translate(cx,cy);
    const tilt=Math.max(-.35,Math.min(.35,(tx-x)/120));ctx.rotate(tilt);
    // vlam
    const f=12+Math.sin(t*40)*4;ctx.fillStyle='#FFD84A';ctx.beginPath();ctx.moveTo(-10,30);ctx.quadraticCurveTo(0,30+f*2.2,10,30);ctx.fill();
    ctx.fillStyle='#FF7A3A';ctx.beginPath();ctx.moveTo(-6,30);ctx.quadraticCurveTo(0,30+f*1.4,6,30);ctx.fill();
    ctx.lineWidth=3;ctx.strokeStyle='#221A48';ctx.lineJoin='round';
    // vinnen
    ctx.fillStyle='#8B6CFF';for(const s of[-1,1]){ctx.beginPath();ctx.moveTo(s*14,8);ctx.lineTo(s*26,28);ctx.lineTo(s*14,28);ctx.closePath();ctx.fill();ctx.stroke();}
    // romp
    ctx.fillStyle='#F4F2FF';ctx.beginPath();ctx.moveTo(0,-42);ctx.bezierCurveTo(18,-26,18,10,14,30);ctx.lineTo(-14,30);ctx.bezierCurveTo(-18,10,-18,-26,0,-42);ctx.closePath();ctx.fill();ctx.stroke();
    // neus
    ctx.fillStyle='#FF4FA8';ctx.beginPath();ctx.moveTo(0,-42);ctx.bezierCurveTo(9,-34,12,-28,13,-24);ctx.lineTo(-13,-24);ctx.bezierCurveTo(-12,-28,-9,-34,0,-42);ctx.closePath();ctx.fill();ctx.stroke();
    // raampje met Gloopie
    ctx.fillStyle='#BFE6FF';ctx.beginPath();ctx.arc(0,-4,11,0,7);ctx.fill();ctx.stroke();
    ctx.fillStyle='#6BE38A';ctx.beginPath();ctx.arc(0,-1,8,Math.PI,0);ctx.lineTo(8,6);ctx.lineTo(-8,6);ctx.closePath();ctx.fill();
    ctx.fillStyle='#221A48';ctx.beginPath();ctx.arc(-3,-2,1.6,0,7);ctx.arc(3,-2,1.6,0,7);ctx.fill();
    ctx.restore();
  }
  function drawRock(o){ctx.save();ctx.translate(o.x,o.y);ctx.rotate(o.rot);ctx.fillStyle='#8A7F9E';ctx.strokeStyle='#221A48';ctx.lineWidth=3;
    ctx.beginPath();for(let i=0;i<8;i++){const a=i/8*6.283,rr=o.r*(.82+((i*37)%5)/20);ctx.lineTo(Math.cos(a)*rr,Math.sin(a)*rr);}ctx.closePath();ctx.fill();ctx.stroke();
    ctx.fillStyle='#6B6280';ctx.beginPath();ctx.arc(-o.r*.3,-o.r*.2,o.r*.22,0,7);ctx.arc(o.r*.3,o.r*.25,o.r*.15,0,7);ctx.fill();ctx.restore();}
  function drawStar(o){ctx.save();ctx.translate(o.x,o.y);ctx.rotate(t*2);ctx.fillStyle='#FFD84A';ctx.strokeStyle='#221A48';ctx.lineWidth=3;ctx.beginPath();
    for(let i=0;i<10;i++){const a=i/10*6.283-Math.PI/2,rr=i%2?7:15;ctx.lineTo(Math.cos(a)*rr,Math.sin(a)*rr);}ctx.closePath();ctx.fill();ctx.stroke();ctx.restore();}

  function draw(){
    ctx.setTransform(sc*dpr,0,0,sc*dpr,0,0);
    const sx=shake?(Math.random()-.5)*shake*20:0;ctx.save();ctx.translate(sx,0);
    // lucht: van de lucht van de vertrekplaneet naar donkere ruimte, en bij aankomst naar de lucht van de nieuwe planeet
    const SPACE='#120C33';let bg=SPACE;
    if(from().sky&&p<.34)bg=mix(from().sky,SPACE,Math.max(0,Math.min(1,(p-.12)/.22)));  // eerst even blauwe lucht
    if(to().sky&&p>.88)bg=mix(SPACE,to().sky,Math.min(1,(p-.88)/.12));
    ctx.fillStyle=bg;ctx.fillRect(-20,0,LW+40,LH);
    const starA=from().sky?Math.max(0,Math.min(1,(p-.14)/.18)):1;ctx.fillStyle=`rgba(255,255,255,${starA*(p>.9&&to().sky?Math.max(0,1-(p-.9)*10):1)})`;
    for(const s of field){ctx.globalAlpha=s.z;ctx.beginPath();ctx.arc(s.x,s.y,s.s,0,7);ctx.fill();}ctx.globalAlpha=1;
    // vertrekplaneet onderin, schuift weg
    if(p<.25){const r=260,cy=LH+r*.55+p*1400;drawPlanet(from(),LW/2,cy,r);}
    // bestemming bovenin, wordt groter
    if(p>.55){const f=(p-.55)/.45,r=20+f*f*240,cy=-r*.35+(1-f)*80+70;drawPlanet(to(),LW/2,cy,r);}  // onder de puntenbalk, zodat je hem goed ziet
    for(const o of obs){
      if(o.k==='star')drawStar(o);
      else if(o.k==='rock')drawRock(o);
      else{ctx.save();ctx.translate(o.x,o.y);
        if(o.k==='☄️'){ctx.rotate(-.6);}else if(o.k==='🐦'&&o.vx>0)ctx.scale(-1,1);else if(o.k==='✈️')ctx.rotate(o.vx>0?.8:-2.4);else if(o.k==='🛰️'||o.k==='❄️'||o.k==='🧊')ctx.rotate(o.rot);
        ctx.font=`${o.sz}px ${EMO}`;ctx.textAlign='center';ctx.textBaseline='middle';
        // Belangrijk: een volledig dekkende kleur. Emoji nemen de doorzichtigheid van fillStyle over;
        // die stond nog op de (onzichtbare) sterrenkleur, waardoor vogels in de blauwe lucht onzichtbaar waren.
        ctx.fillStyle='#221A48';ctx.globalAlpha=1;
        // donkere rand, zodat alles goed te zien is tegen de lucht én de ruimte (de vogel is op Apple ook blauw)
        ctx.shadowColor='rgba(34,26,72,.95)';ctx.shadowBlur=5;ctx.fillText(o.k,0,1);ctx.shadowBlur=2;ctx.fillText(o.k,0,1);ctx.restore();}
    }
    if(!(inv>0&&Math.floor(t*12)%2))drawRocket(x,RY);
    for(const q of pops){ctx.globalAlpha=Math.max(0,1-q.t);ctx.font='700 20px Fredoka, Nunito, sans-serif';ctx.textAlign='center';ctx.lineWidth=5;ctx.strokeStyle='#fff';ctx.strokeText(q.txt,q.x,q.y-q.t*30);ctx.fillStyle='#221A48';ctx.fillText(q.txt,q.x,q.y-q.t*30);}ctx.globalAlpha=1;
    // bovenbalk: punten, hartjes en voortgang naar de volgende planeet
    ctx.fillStyle='rgba(255,255,255,.92)';ctx.beginPath();ctx.roundRect?ctx.roundRect(10,10,LW-20,62,18):ctx.rect(10,10,LW-20,62);ctx.fill();ctx.lineWidth=3;ctx.strokeStyle='#221A48';ctx.stroke();
    ctx.fillStyle='#221A48';ctx.textAlign='left';ctx.textBaseline='alphabetic';ctx.font='700 24px Fredoka, Nunito, sans-serif';ctx.fillText(Math.floor(score),24,40);
    ctx.font='700 12px Nunito, sans-serif';ctx.fillStyle='#4A4270';ctx.fillText(`naar ${to().n}`,24,58);
    ctx.textAlign='right';ctx.font=`18px ${EMO}`;ctx.fillText('💜'.repeat(Math.max(0,hearts))+'🤍'.repeat(Math.max(0,MAXH-hearts)),LW-22,40);
    ctx.fillStyle='#E9E4FF';ctx.fillRect(110,52,LW-140,8);ctx.fillStyle='#6BE38A';ctx.fillRect(110,52,(LW-140)*Math.min(1,p),8);
    ctx.font=`14px ${EMO}`;ctx.textAlign='center';ctx.fillText('🚀',110+(LW-140)*Math.min(1,p),50);
    if(msgT>0||state==='ready'){const txt=state==='ready'?'Tik om op te stijgen!':msg;ctx.globalAlpha=state==='ready'?1:Math.min(1,msgT*2);
      // Startscherm in het midden; meldingen tijdens het vliegen klein bovenin (dan verbergen ze niets op je pad)
      const big=state==='ready'||state==='land'||state==='over',bx=big?30:50,by=big?LH/2-60:86,bw=big?LW-60:LW-100,bh=state==='ready'?96:big?60:36;
      ctx.fillStyle=big?'rgba(34,26,72,.78)':'rgba(34,26,72,.6)';ctx.beginPath();ctx.roundRect?ctx.roundRect(bx,by,bw,bh,16):ctx.rect(bx,by,bw,bh);ctx.fill();
      ctx.fillStyle='#fff';ctx.textAlign='center';ctx.font=big?'700 22px Fredoka, Nunito, sans-serif':'700 16px Fredoka, Nunito, sans-serif';ctx.fillText(txt,LW/2,big?LH/2-24:by+24);
      if(state==='ready'){ctx.font='600 14px Nunito, sans-serif';ctx.fillText(`Vlieg van de Aarde naar de Maan. ${MAXH} hartjes.`,LW/2,LH/2+4);}
      ctx.globalAlpha=1;}
    ctx.restore();
  }
  function loop(now){raf=requestAnimationFrame(loop);const dt=Math.min(.033,(now-(last||now))/1000);last=now;t+=dt;
    // sterrenveld beweegt altijd mee
    const sp=state==='ready'?20:speed();for(const s of field){s.y+=sp*dt*s.z*.6;if(s.y>LH){s.y=-2;s.x=Math.random()*LW;}}
    if(keys.l)tx-=320*dt;if(keys.r)tx+=320*dt;tx=Math.max(22,Math.min(LW-22,tx));x+=(tx-x)*Math.min(1,dt*12);
    if(state==='play'){
      p+=dt/(LEVEL_T/Math.min(1.4,SPD));score+=sp*dt/10;
      if(p<.86){spawnT-=dt;if(spawnT<=0){spawn();spawnT=Math.max(.32,(1.05-lvl*.05)/SPD)*(.7+Math.random()*.6);}
        starT-=dt;if(starT<=0){obs.push({k:'star',x:24+Math.random()*(LW-48),y:-20,vx:0,r:16});starT=2+Math.random()*2.5;}}
      if(p>=1)arrive();
    }
    if(state==='play'||state==='land'||state==='over'){
      for(const o of obs){o.y+=(sp+(o.vy||0))*dt;o.x+=o.vx*dt;o.rot+=(o.vr||0)*dt;
        if(state==='play'&&!o.done){const dx=o.x-x,dy=o.y-(RY-4);const hr=o.k==='star'?o.r+16:o.r*.8+12;if(dx*dx+dy*dy<hr*hr){if(o.k==='star'){o.done=true;stars++;score+=10;sfx('pop');pops.push({x:o.x,y:o.y,t:0,txt:'+10'});}else{o.done=true;hit(o);}}}}
      obs=obs.filter(o=>o.y<LH+50&&o.x>-60&&o.x<LW+60&&!(o.k==='star'&&o.done));
    }
    for(const q of pops)q.t+=dt*1.4;pops=pops.filter(q=>q.t<1);
    inv=Math.max(0,inv-dt);shake=Math.max(0,shake-dt);
    if(msgT>0){msgT-=dt;if(msgT<=0){if(state==='land')nextLevel();else if(state==='over')finish();}}
    if(state!=='done')draw();
  }
  function finish(){
    state='done';cancelAnimationFrame(raf);raf=0;
    const s=Math.floor(score),prev=data.records[g.rk];const isRec=s>0&&(!prev||s>prev);if(isRec)data.records[g.rk]=s;
    const far=planets?planet(planets).n:'de ruimte tussen de Aarde en de Maan';
    stage.innerHTML=finishCommon(g,{score:s,planets},isRec,[`Punten <b>${s}</b>`,`Verste planeet <b>${planets?far.charAt(0).toUpperCase()+far.slice(1):'nog geen'}</b>`,`Sterren gepakt <b>${stars}</b>`,`Jouw record <b>${data.records[g.rk]||0}</b>`],isRec?'grin':planets?'happy':'sad');
    document.getElementById('again').addEventListener('click',()=>restart());
  }
  raf=requestAnimationFrame(loop);
  // Pauze (tandwiel): de spellus stopt; bij verder gaat de tijd verder waar hij was.
  let wasRunning=false;
  return {cleanup:()=>{cancelAnimationFrame(raf);window.removeEventListener('resize',size);},
    pause(){wasRunning=Boolean(raf);cancelAnimationFrame(raf);raf=0;keys.l=keys.r=false;drag=false;},
    resume(){if(wasRunning&&!raf){last=0;raf=requestAnimationFrame(loop);}}};
}
