// Gloop game-module. Wordt alleen geladen als iemand deze game speelt.
import {data,save} from '../store';
import {blob,ICON} from '../blob';
import {finishCommon} from './common';
import {sfx} from '../sfx';
import {toast} from '../toast';
/* ---------- Gloopie Golf ---------- */
export default function start(stage,g,restart){
  const LW=360,LH=560,FX0=14,FY0=74,FX1=346,FY1=546,BR=9,HR=12,MAXV=820,PULL=140;
  const HOLES=[
    {par:2,s:[180,505],h:[180,140],w:[],wa:[],sa:[],mv:[]},
    {par:2,s:[80,505],h:[280,140],w:[[100,300,160,18]],wa:[],sa:[],mv:[]},
    {par:3,s:[70,505],h:[290,130],w:[[14,250,230,18],[130,385,216,18]],wa:[],sa:[],mv:[]},
    {par:3,s:[180,510],h:[180,130],w:[],wa:[[70,270,220,64]],sa:[[120,96,120,28]],mv:[]},
    {par:3,s:[180,515],h:[180,120],w:[[60,190,50,50],[250,190,50,50],[155,290,50,50],[60,400,50,40],[250,400,50,40]],wa:[],sa:[],mv:[]},
    {par:3,s:[180,510],h:[180,125],w:[],wa:[],sa:[[14,190,332,40]],mv:[[14,310,120,18,212,1.6]]},
    {par:4,s:[60,515],h:[60,120],w:[[14,420,250,18],[96,300,250,18],[14,180,250,18]],wa:[],sa:[],mv:[]},
    {par:3,s:[180,510],h:[180,105],w:[],wa:[[110,145,140,34]],sa:[[14,250,332,56]],mv:[]},
    {par:3,s:[180,515],h:[180,110],w:[],wa:[[14,450,70,40],[276,450,70,40]],sa:[],mv:[[14,380,110,18,222,1.3],[14,240,110,18,222,1.9]]}];
  const PAR=HOLES.reduce((a,h)=>a+h.par,0);
  stage.innerHTML=`<div class="stapel-wrap"><canvas class="stapel golf" id="gfc" tabindex="0" role="application" aria-label="Gloopie Golf: sleep naar achteren en laat los om te slaan. Pijltjes links en rechts om te richten, omhoog en omlaag voor kracht, spatie om te slaan."></canvas>
    <p class="stapel-help">Sleep je vinger <b>weg van de richting</b> waarin je wilt slaan, net als een katapult, en laat los. Hoe verder je sleept, hoe harder. Pas op voor het water (+1 slag) en het zand (remt af).</p></div>`;
  const cv=document.getElementById('gfc'),ctx=cv.getContext('2d');let sc=1,dpr=1;
  function size(){const wrapW=cv.parentElement.clientWidth;let w=Math.min(wrapW,460),h=w*LH/LW;const maxH=Math.max(380,window.innerHeight*.72);if(h>maxH){h=maxH;w=h*LW/LH;}
    dpr=Math.min(2,window.devicePixelRatio||1);cv.style.width=w+'px';cv.style.height=h+'px';cv.width=Math.round(w*dpr);cv.height=Math.round(h*dpr);sc=w/LW;}
  size();window.addEventListener('resize',size);
  const BODY=new Path2D('M100 20 C152 20 180 58 180 106 C180 134 174 152 166 162 C160 170 158 184 150 184 C142 184 142 170 134 170 C126 170 126 180 118 180 C110 180 110 168 100 168 C90 168 90 188 80 188 C70 188 72 170 62 170 C52 170 48 180 40 176 C28 168 20 144 20 106 C20 58 48 20 100 20 Z');
  let hi=0,H,bx,by,vx=0,vy=0,lastX,lastY,strokes=0,total=0,cards=[],aces=0,state='aim',drag=null,kAim=-Math.PI/2,kPow=.5,sink=0,msg='',msgT=0,pops=[],t=0,raf=0,last=0;
  function loadHole(){H=HOLES[hi];bx=lastX=H.s[0];by=lastY=H.s[1];vx=vy=0;strokes=0;state='aim';sink=0;kAim=Math.atan2(H.h[1]-by,H.h[0]-bx);}
  function movers(){return H.mv.map(m=>[m[0]+(m[4]/2)*(1+Math.sin(t*m[5])),m[1],m[2],m[3]]);}
  function rects(){return H.w.concat(movers());}
  function inR(x,y,r){return x>=r[0]&&x<=r[0]+r[2]&&y>=r[1]&&y<=r[1]+r[3];}
  function rr(x,y,w,h,r){ctx.beginPath();ctx.moveTo(x+r,y);ctx.arcTo(x+w,y,x+w,y+h,r);ctx.arcTo(x+w,y+h,x,y+h,r);ctx.arcTo(x,y+h,x,y,r);ctx.arcTo(x,y,x+w,y,r);ctx.closePath();}
  function word(d,st){if(st===1)return 'Hole-in-one!';return d<=-2?'Adelaar!':d===-1?'Birdie!':d===0?'Par':d===1?'Bogey':d===2?'Dubbele bogey':`+${d}`;}
  function collideRect(r){const cx=Math.max(r[0],Math.min(bx,r[0]+r[2])),cy=Math.max(r[1],Math.min(by,r[1]+r[3]));let dx=bx-cx,dy=by-cy,d2=dx*dx+dy*dy;
    if(d2>=BR*BR)return;let d=Math.sqrt(d2);let nx,ny;if(d<1e-4){const l=bx-r[0],ri=r[0]+r[2]-bx,tp=by-r[1],bo=r[1]+r[3]-by,mn=Math.min(l,ri,tp,bo);nx=mn===l?-1:mn===ri?1:0;ny=mn===tp?-1:mn===bo?1:0;d=0;}else{nx=dx/d;ny=dy/d;}
    bx+=nx*(BR-d);by+=ny*(BR-d);const dot=vx*nx+vy*ny;if(dot<0){vx-=1.72*dot*nx;vy-=1.72*dot*ny;}}
  function physics(dt){const sub=4;for(let i=0;i<sub;i++){const h=dt/sub;bx+=vx*h;by+=vy*h;
      if(bx<FX0+BR){bx=FX0+BR;vx=Math.abs(vx)*.72;}if(bx>FX1-BR){bx=FX1-BR;vx=-Math.abs(vx)*.72;}if(by<FY0+BR){by=FY0+BR;vy=Math.abs(vy)*.72;}if(by>FY1-BR){by=FY1-BR;vy=-Math.abs(vy)*.72;}
      for(const r of rects())collideRect(r);
      const sp=Math.hypot(vx,vy),dh=Math.hypot(bx-H.h[0],by-H.h[1]);
      if(dh<HR){if(sp<430){state='sink';vx=vy=0;sink=0;return;}else{vx*=.86;vy*=.86;}}
      for(const w of H.wa)if(inR(bx,by,w)){strokes++;pops.push({x:bx,y:by,txt:'Plons! +1',c:'#5CC8FF',t:0});for(let k=0;k<8;k++)pops.push({x:bx,y:by,dot:true,a:k/8*6.28,c:'#5CC8FF',t:0});bx=lastX;by=lastY;vx=vy=0;state='aim';return;}}
    const sand=H.sa.some(r=>inR(bx,by,r));const k=sand?4.8:1.35;const f=Math.exp(-k*dt);vx*=f;vy*=f;
    const sp=Math.hypot(vx,vy);if(sp<(sand?30:9)){vx=vy=0;if(state==='roll'){state=strokes>=10?'pickup':'aim';if(state==='pickup')holeDone(true);}}}
  function holeDone(pick){const st=pick?10:strokes;total+=st;cards.push(st);if(st===1)aces++;const d=st-H.par;msg=pick?'Maximaal aantal slagen':word(d,st);msgT=0;state='holed';}
  function shoot(ang,pow){if(state!=='aim'||pow<.06)return;lastX=bx;lastY=by;vx=Math.cos(ang)*MAXV*pow;vy=Math.sin(ang)*MAXV*pow;strokes++;state='roll';}
  function drawField(){ctx.fillStyle='#5CC8FF';ctx.fillRect(0,0,LW,LH);
    ctx.fillStyle='#221A48';rr(FX0-6,FY0-6+6,FX1-FX0+12,FY1-FY0+12,22);ctx.fill();
    ctx.fillStyle='#6BE38A';rr(FX0-6,FY0-6,FX1-FX0+12,FY1-FY0+12,22);ctx.fill();ctx.lineWidth=4;ctx.strokeStyle='#221A48';ctx.stroke();
    ctx.save();rr(FX0,FY0,FX1-FX0,FY1-FY0,16);ctx.clip();for(let y=FY0;y<FY1;y+=40){ctx.fillStyle='#62DA81';ctx.fillRect(FX0,y,FX1-FX0,20);}
    for(const s of H.sa){ctx.fillStyle='#FFE9A8';rr(s[0],s[1],s[2],s[3],12);ctx.fill();ctx.fillStyle='rgba(242,193,46,.5)';for(let x=s[0]+6;x<s[0]+s[2];x+=12)for(let y=s[1]+6;y<s[1]+s[3];y+=10){ctx.fillRect(x+((y/10)%2)*5,y,2,2);}}
    for(const w of H.wa){ctx.fillStyle='#3FA6DE';rr(w[0],w[1],w[2],w[3],14);ctx.fill();ctx.lineWidth=3;ctx.strokeStyle='#221A48';ctx.stroke();
      ctx.strokeStyle='rgba(255,255,255,.7)';ctx.lineWidth=2.5;for(let y=w[1]+12;y<w[1]+w[3]-6;y+=14){ctx.beginPath();for(let x=w[0]+8;x<w[0]+w[2]-8;x+=4)ctx.lineTo(x,y+Math.sin(x/6+t*3)*2.5);ctx.stroke();}}
    ctx.restore();
    ctx.fillStyle='rgba(255,255,255,.55)';ctx.beginPath();ctx.ellipse(H.s[0],H.s[1],14,6,0,0,7);ctx.fill();
    ctx.beginPath();ctx.arc(H.h[0],H.h[1],HR+3,0,7);ctx.fillStyle='rgba(34,26,72,.2)';ctx.fill();ctx.beginPath();ctx.arc(H.h[0],H.h[1],HR,0,7);ctx.fillStyle='#221A48';ctx.fill();
    ctx.strokeStyle='#221A48';ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(H.h[0]+1,H.h[1]);ctx.lineTo(H.h[0]+1,H.h[1]-46);ctx.stroke();
    const wv=Math.sin(t*4)*3;ctx.beginPath();ctx.moveTo(H.h[0]+2,H.h[1]-46);ctx.quadraticCurveTo(H.h[0]+16,H.h[1]-42+wv,H.h[0]+30,H.h[1]-38);ctx.lineTo(H.h[0]+2,H.h[1]-30);ctx.closePath();ctx.fillStyle='#FF7AC6';ctx.fill();ctx.lineWidth=2.5;ctx.stroke();
    ctx.fillStyle='#221A48';ctx.font='700 11px Fredoka, sans-serif';ctx.textAlign='center';ctx.fillText(hi+1,H.h[0]+13,H.h[1]-35);
    for(const r of H.w){ctx.fillStyle='#221A48';rr(r[0],r[1]+4,r[2],r[3],7);ctx.fill();ctx.fillStyle='#8B6CFF';rr(r[0],r[1],r[2],r[3],7);ctx.fill();ctx.lineWidth=3;ctx.strokeStyle='#221A48';ctx.stroke();ctx.fillStyle='rgba(255,255,255,.35)';rr(r[0]+4,r[1]+3,Math.max(0,r[2]-8),4,2);ctx.fill();}
    for(const r of movers()){ctx.fillStyle='#221A48';rr(r[0],r[1]+4,r[2],r[3],7);ctx.fill();ctx.fillStyle='#FF7AC6';rr(r[0],r[1],r[2],r[3],7);ctx.fill();ctx.lineWidth=3;ctx.strokeStyle='#221A48';ctx.stroke();
      ctx.fillStyle='#221A48';for(let x=r[0]+10;x<r[0]+r[2]-6;x+=16){ctx.beginPath();ctx.moveTo(x,r[1]+4);ctx.lineTo(x+6,r[1]+9);ctx.lineTo(x,r[1]+14);ctx.fill();}}}
  function drawBall(){const s=state==='sink'?Math.max(0,1-sink*1.6):1;if(s<=0)return;ctx.save();ctx.translate(bx,by);ctx.scale(.11*s,.11*s);ctx.translate(-100,-104);
    ctx.fillStyle='#FFFFFF';ctx.fill(BODY);ctx.lineWidth=16;ctx.strokeStyle='#221A48';ctx.stroke(BODY);
    let la=state==='aim'?(drag&&drag.pow>.04?drag.ang:kAim):Math.atan2(vy,vx);const lx=Math.cos(la)*6,ly=Math.sin(la)*6;
    for(const ex of[78,122]){ctx.beginPath();ctx.ellipse(ex,100,17,20,0,0,7);ctx.fillStyle='#E9FBEF';ctx.fill();ctx.lineWidth=10;ctx.stroke();ctx.beginPath();ctx.arc(ex+lx,100+ly,10,0,7);ctx.fillStyle='#221A48';ctx.fill();}ctx.restore();}
  function drawAim(){if(state!=='aim')return;let ang,pow;if(drag&&drag.active){ang=drag.ang;pow=drag.pow;}else if(kbd){ang=kAim;pow=kPow;}else return;if(pow<.04)return;
    const L=30+pow*110;const col=pow<.5?'#2FB463':pow<.8?'#F2C12E':'#E04CA2';ctx.fillStyle=col;
    for(let i=1;i<=9;i++){const d=L*i/9;ctx.beginPath();ctx.arc(bx+Math.cos(ang)*(BR+4+d),by+Math.sin(ang)*(BR+4+d),2.2+i*.25,0,7);ctx.fill();}
    ctx.save();ctx.translate(bx+Math.cos(ang)*(BR+10+L),by+Math.sin(ang)*(BR+10+L));ctx.rotate(ang);ctx.beginPath();ctx.moveTo(8,0);ctx.lineTo(-6,-7);ctx.lineTo(-6,7);ctx.closePath();ctx.fill();ctx.lineWidth=2;ctx.strokeStyle='#221A48';ctx.stroke();ctx.restore();}
  function drawHud(){ctx.fillStyle='#FFFFFF';rr(10,10,LW-20,48,18);ctx.fill();ctx.lineWidth=3;ctx.strokeStyle='#221A48';ctx.stroke();
    ctx.fillStyle='#221A48';ctx.textAlign='left';ctx.font='700 17px Fredoka, Nunito, sans-serif';ctx.fillText(`Hole ${hi+1}/9`,24,40);
    ctx.textAlign='center';ctx.fillText(`Par ${H.par}`,140,40);ctx.fillText(`Slagen ${strokes}`,228,40);
    const playedPar=HOLES.slice(0,cards.length).reduce((a,h)=>a+h.par,0),diff=total-playedPar;ctx.textAlign='right';ctx.fillStyle=diff>0?'#C02B48':'#1E8A4A';ctx.fillText(cards.length?(diff>0?'+'+diff:diff===0?'E':diff):'E',LW-24,40);}
  function draw(){ctx.setTransform(sc*dpr,0,0,sc*dpr,0,0);drawField();drawAim();drawBall();
    for(const p of pops){ctx.globalAlpha=Math.max(0,1-p.t);if(p.dot){ctx.fillStyle=p.c;ctx.beginPath();ctx.arc(p.x+Math.cos(p.a)*24*p.t,p.y+Math.sin(p.a)*24*p.t,3.5,0,7);ctx.fill();}
      else{ctx.font='700 20px Fredoka, Nunito, sans-serif';ctx.textAlign='center';ctx.lineWidth=5;ctx.strokeStyle='#fff';ctx.strokeText(p.txt,p.x,p.y-20-p.t*26);ctx.fillStyle='#221A48';ctx.fillText(p.txt,p.x,p.y-20-p.t*26);}ctx.globalAlpha=1;}
    drawHud();
    if(state==='holed'){ctx.fillStyle='rgba(34,26,72,.72)';rr(36,LH/2-74,LW-72,148,28);ctx.fill();ctx.textAlign='center';ctx.fillStyle='#FFD84A';ctx.font='700 34px Fredoka, Nunito, sans-serif';ctx.fillText(msg,LW/2,LH/2-18);
      ctx.fillStyle='#fff';ctx.font='700 16px Nunito, sans-serif';ctx.fillText(`${cards[cards.length-1]} slagen op een par ${H.par}`,LW/2,LH/2+14);ctx.font='700 15px Nunito, sans-serif';ctx.fillStyle='#E9E4FF';ctx.fillText(hi<8?'Tik voor de volgende hole':'Tik voor je scorekaart',LW/2,LH/2+48);}}
  let kbd=false;
  function toLogic(e){const b=cv.getBoundingClientRect();return {x:(e.clientX-b.left)/b.width*LW,y:(e.clientY-b.top)/b.height*LH};}
  function next(){if(hi>=8){finish();return;}hi++;loadHole();}
  cv.addEventListener('pointerdown',e=>{e.preventDefault();if(state==='holed'&&msgT>.5){next();return;}if(state!=='aim')return;kbd=false;const p=toLogic(e);drag={x0:p.x,y0:p.y,active:true,ang:0,pow:0};try{cv.setPointerCapture(e.pointerId)}catch(_){} });
  cv.addEventListener('pointermove',e=>{if(!drag||!drag.active)return;const p=toLogic(e),dx=drag.x0-p.x,dy=drag.y0-p.y,d=Math.hypot(dx,dy);drag.pow=Math.min(1,d/PULL);drag.ang=Math.atan2(dy,dx);});
  cv.addEventListener('pointerup',()=>{if(!drag)return;const d=drag;drag=null;if(d.active&&d.pow>=.06){kAim=d.ang;shoot(d.ang,d.pow);}});
  cv.addEventListener('pointercancel',()=>{drag=null;});
  cv.addEventListener('keydown',e=>{const k=e.key;if(state==='holed'&&(k===' '||k==='Enter')){e.preventDefault();if(msgT>.3)next();return;}
    if(k==='ArrowLeft'){kAim-=.06;kbd=true;e.preventDefault();}else if(k==='ArrowRight'){kAim+=.06;kbd=true;e.preventDefault();}
    else if(k==='ArrowUp'){kPow=Math.min(1,kPow+.05);kbd=true;e.preventDefault();}else if(k==='ArrowDown'){kPow=Math.max(.06,kPow-.05);kbd=true;e.preventDefault();}
    else if((k===' '||k==='Enter')&&!e.repeat){e.preventDefault();kbd=true;shoot(kAim,kPow);}});
  function loop(now){raf=requestAnimationFrame(loop);const dt=Math.min(.033,(now-(last||now))/1000);last=now;t+=dt;
    if(state==='roll')physics(dt);
    else if(state==='aim'){for(const r of movers())collideRect(r);}
    else if(state==='sink'){sink+=dt;bx+=(H.h[0]-bx)*Math.min(1,dt*10);by+=(H.h[1]-by)*Math.min(1,dt*10);if(sink>.65){pops.push({x:H.h[0],y:H.h[1],txt:strokes===1?'Hole-in-one!':'In de hole!',t:0});holeDone(false);}}
    else if(state==='holed')msgT+=dt;
    for(const p of pops)p.t+=dt*(p.dot?2.2:.9);pops=pops.filter(p=>p.t<1);
    draw();}
  function finish(){cancelAnimationFrame(raf);raf=0;state='done';
    const prev=data.records[g.rk];const isRec=!prev||total<prev;if(isRec)data.records[g.rk]=total;const d=total-PAR;
    const card=`<div class="golf-card">${cards.map((c,i)=>`<span class="${c<HOLES[i].par?'under':c>HOLES[i].par?'over':''}"><small>${i+1}</small>${c}</span>`).join('')}</div>`;
    stage.innerHTML=finishCommon(g,{score:total},isRec,[`Totaal <b>${total} slagen</b> (par ${PAR})`,`Score <b>${d>0?'+'+d:d===0?'Par':d}</b>`,`Hole-in-ones <b>${aces}</b>`,`Jouw record <b>${data.records[g.rk]} slagen</b>`],isRec?'grin':d>8?'sad':'happy').replace('<ul>',card+'<ul>');
    document.getElementById('again').addEventListener('click',()=>restart());}
  loadHole();raf=requestAnimationFrame(loop);setTimeout(()=>{try{cv.focus({preventScroll:true})}catch(e){}},50);
  // Pauze (tandwiel): de spellus stopt; bij verder gaat de tijd verder waar hij was.
  let wasRunning=false;
  return {cleanup:()=>{cancelAnimationFrame(raf);window.removeEventListener('resize',size);},
    pause(){wasRunning=Boolean(raf);cancelAnimationFrame(raf);raf=0;},
    resume(){if(wasRunning&&!raf){last=0;raf=requestAnimationFrame(loop);}}};
}
