// Gloop game-module. Wordt alleen geladen als iemand deze game speelt.
import {data,save} from '../store';
import {blob,ICON} from '../blob';
import {finishCommon} from './common';
import {toast} from '../toast';
/* ---------- Mep de Blob ---------- */
export default function start(stage,g,restart){
  const LW=360,LH=560,DUR=45,COLS=3,ROWS=3,HX=[70,180,290],HY=[230,345,460],COLORS=['#8B6CFF','#FF7AC6','#5CC8FF','#FF9F5A'];
  stage.innerHTML=`<div class="stapel-wrap"><canvas class="stapel mep" id="mpc" tabindex="0" role="application" aria-label="Mep de Blob: tik op de blobs die opduiken, niet op Gloopie. Toetsen 1 tot 9 werken ook."></canvas>
    <p class="stapel-help">Tik op elke blob die uit een pot opduikt. <b>Gouden blobs</b> zijn 5 punten waard. Maar mep <b>Gloopie</b> (groen met een hartje) niet, anders verlies je een hartje! Raak je 5 keer achter elkaar, dan loopt je vermenigvuldiger op.</p></div>`;
  const cv=document.getElementById('mpc'),ctx=cv.getContext('2d');let sc=1,dpr=1;
  function size(){const wrapW=cv.parentElement.clientWidth;let w=Math.min(wrapW,460),h=w*LH/LW;const maxH=Math.max(380,window.innerHeight*.72);if(h>maxH){h=maxH;w=h*LW/LH;}
    dpr=Math.min(2,window.devicePixelRatio||1);cv.style.width=w+'px';cv.style.height=h+'px';cv.width=Math.round(w*dpr);cv.height=Math.round(h*dpr);sc=w/LW;}
  size();window.addEventListener('resize',size);
  const BODY=new Path2D('M100 20 C152 20 180 58 180 106 C180 134 174 152 166 162 C160 170 158 184 150 184 C142 184 142 170 134 170 C126 170 126 180 118 180 C110 180 110 168 100 168 C90 168 90 188 80 188 C70 188 72 170 62 170 C52 170 48 180 40 176 C28 168 20 144 20 106 C20 58 48 20 100 20 Z');
  const holes=[];for(let r=0;r<ROWS;r++)for(let c=0;c<COLS;c++)holes.push({x:HX[c],y:HY[r],b:null});
  let state='ready',time=DUR,score=0,hearts=3,streak=0,mult=1,hits=0,best=0,spawnT=.6,pops=[],mallets=[],shake=0,raf=0,last=0,overT=0,endWhy='';
  function el(){return DUR-time;}
  function upTime(){return Math.max(.55,1.15-el()*.014);}
  function spawnGap(){return Math.max(.36,.85-el()*.011);}
  function spawn(){const free=holes.filter(h=>!h.b);if(!free.length)return;const h=free[Math.floor(Math.random()*free.length)];
    const r=Math.random();const kind=r<.08?'gold':r<(el()>10?.27:.18)?'gloopie':'blob';
    h.b={kind,c:kind==='gold'?'#FFD84A':kind==='gloopie'?'#6BE38A':COLORS[Math.floor(Math.random()*COLORS.length)],t:0,up:upTime()*(kind==='gold'?.75:1),hit:false,ht:0};}
  function rr(x,y,w,h,r){ctx.beginPath();ctx.moveTo(x+r,y);ctx.arcTo(x+w,y,x+w,y+h,r);ctx.arcTo(x+w,y+h,x,y+h,r);ctx.arcTo(x,y+h,x,y,r);ctx.arcTo(x,y,x+w,y,r);ctx.closePath();}
  function rise(b){const T=b.up,t=b.t;if(b.hit)return Math.max(0,1-b.ht*4);if(t<.12)return t/.12;if(t>T-.12)return Math.max(0,(T-t)/.12);return 1;}
  function drawBlob(h){const b=h.b;const p=rise(b);if(p<=0)return;const yOff=(1-p)*70;
    ctx.save();ctx.beginPath();ctx.rect(h.x-60,h.y-120,120,120);ctx.clip();
    ctx.translate(h.x,h.y+6+yOff);const sq=b.hit?1+Math.min(.35,b.ht*3):1;ctx.scale(.36*sq,.36/sq);ctx.translate(-100,-188);
    ctx.fillStyle=b.c;ctx.fill(BODY);ctx.lineWidth=10;ctx.strokeStyle='#221A48';ctx.stroke(BODY);
    ctx.beginPath();ctx.ellipse(64,58,17,10,-.55,0,7);ctx.fillStyle='rgba(255,255,255,.7)';ctx.fill();
    if(b.hit){for(const ex of[78,122]){ctx.beginPath();ctx.moveTo(ex-12,88);ctx.lineTo(ex+12,112);ctx.moveTo(ex+12,88);ctx.lineTo(ex-12,112);ctx.lineWidth=8;ctx.stroke();}
      ctx.beginPath();ctx.ellipse(100,138,12,9,0,0,7);ctx.fillStyle='#221A48';ctx.fill();}
    else{for(const ex of[78,122]){ctx.beginPath();ctx.ellipse(ex,100,15,18,0,0,7);ctx.fillStyle='#fff';ctx.fill();ctx.lineWidth=7;ctx.stroke();ctx.beginPath();ctx.arc(ex+3,104,8,0,7);ctx.fillStyle='#221A48';ctx.fill();}
      if(b.kind==='gloopie'){ctx.beginPath();ctx.moveTo(86,128);ctx.quadraticCurveTo(100,148,114,128);ctx.closePath();ctx.fillStyle='#221A48';ctx.fill();
        ctx.save();ctx.translate(100,40);ctx.scale(1.4,1.4);ctx.beginPath();ctx.moveTo(0,8);ctx.bezierCurveTo(-14,-2,-8,-14,0,-6);ctx.bezierCurveTo(8,-14,14,-2,0,8);ctx.fillStyle='#FF4FA8';ctx.fill();ctx.lineWidth=4;ctx.stroke();ctx.restore();}
      else{ctx.beginPath();ctx.moveTo(86,124);ctx.lineTo(114,124);ctx.lineWidth=7;ctx.lineCap='round';ctx.stroke();ctx.beginPath();ctx.moveTo(64,74);ctx.lineTo(90,84);ctx.moveTo(136,74);ctx.lineTo(110,84);ctx.stroke();}
      if(b.kind==='gold'){ctx.fillStyle='#FFFFFF';for(const [sx,sy] of[[40,40],[160,50],[150,140]]){ctx.beginPath();ctx.arc(sx,sy,7,0,7);ctx.fill();}}}
    ctx.restore();}
  function draw(){ctx.setTransform(sc*dpr,0,0,sc*dpr,0,0);const sx=shake?(Math.random()-.5)*shake*12:0;ctx.save();ctx.translate(sx,0);
    ctx.fillStyle='#E3FBEA';ctx.fillRect(-20,0,LW+40,LH);ctx.fillStyle='rgba(47,180,99,.12)';for(let y=0;y<LH;y+=24)for(let x=(y/24)%2*12;x<LW;x+=24){ctx.beginPath();ctx.arc(x,y,2.5,0,7);ctx.fill();}
    ctx.fillStyle='#FFFFFF';rr(10,10,LW-20,82,20);ctx.fill();ctx.lineWidth=3;ctx.strokeStyle='#221A48';ctx.stroke();
    ctx.fillStyle='#221A48';ctx.textAlign='left';ctx.font='700 30px Fredoka, Nunito, sans-serif';ctx.fillText(score,26,52);
    ctx.font='700 13px Nunito, sans-serif';ctx.fillStyle='#4A4270';ctx.fillText(mult>1?`×${mult} vermenigvuldiger`:'punten',26,72);
    ctx.textAlign='right';ctx.font='22px "Apple Color Emoji","Segoe UI Emoji","Noto Color Emoji",sans-serif';ctx.fillText('💜'.repeat(hearts)+'🤍'.repeat(3-hearts),LW-24,50);
    ctx.fillStyle='#E9E4FF';rr(26,78,LW-52,8,4);ctx.fill();ctx.fillStyle=time<10?'#FF4FA8':'#6BE38A';rr(26,78,(LW-52)*Math.max(0,time/DUR),8,4);ctx.fill();
    for(const h of holes){ctx.beginPath();ctx.ellipse(h.x,h.y+8,50,18,0,0,7);ctx.fillStyle='#221A48';ctx.fill();}
    for(const h of holes){ctx.beginPath();ctx.ellipse(h.x,h.y,46,15,0,0,7);ctx.fillStyle='#3A2E73';ctx.fill();}
    for(const h of holes)if(h.b)drawBlob(h);
    for(const h of holes){ctx.beginPath();ctx.ellipse(h.x,h.y+6,50,17,0,0,Math.PI);ctx.lineTo(h.x-50,h.y+28);ctx.ellipse(h.x,h.y+28,50,17,0,Math.PI,0,true);ctx.closePath();ctx.fillStyle='#FFD84A';ctx.fill();ctx.lineWidth=3;ctx.strokeStyle='#221A48';ctx.stroke();
      ctx.beginPath();ctx.ellipse(h.x,h.y+6,50,17,0,0,Math.PI);ctx.stroke();ctx.fillStyle='rgba(255,255,255,.5)';rr(h.x-38,h.y+16,22,5,2.5);ctx.fill();}
    for(const m of mallets){ctx.save();ctx.translate(m.x+20,m.y-30);ctx.rotate(-.9+Math.min(1,m.t*8)*.9);ctx.fillStyle='#FFD84A';rr(-4,0,8,50,4);ctx.fill();ctx.lineWidth=3;ctx.strokeStyle='#221A48';ctx.stroke();
      ctx.fillStyle='#FF7AC6';rr(-24,-18,48,26,10);ctx.fill();ctx.stroke();ctx.restore();}
    for(const p of pops){ctx.globalAlpha=Math.max(0,1-p.t);if(p.star){for(let k=0;k<6;k++){const an=k/6*6.28;ctx.fillStyle=p.c;ctx.beginPath();ctx.arc(p.x+Math.cos(an)*34*p.t,p.y+Math.sin(an)*34*p.t,4,0,7);ctx.fill();}}
      else{ctx.font='700 22px Fredoka, Nunito, sans-serif';ctx.textAlign='center';ctx.lineWidth=5;ctx.strokeStyle='#fff';ctx.strokeText(p.txt,p.x,p.y-p.t*34);ctx.fillStyle=p.bad?'#C02B48':'#221A48';ctx.fillText(p.txt,p.x,p.y-p.t*34);}ctx.globalAlpha=1;}
    ctx.restore();
    if(state==='ready'){ctx.fillStyle='rgba(34,26,72,.62)';rr(40,LH/2-10,LW-80,84,24);ctx.fill();ctx.fillStyle='#fff';ctx.textAlign='center';ctx.font='700 26px Fredoka, Nunito, sans-serif';ctx.fillText('Tik om te starten',LW/2,LH/2+26);ctx.font='700 13px Nunito, sans-serif';ctx.fillText('45 seconden. Laat Gloopie met rust!',LW/2,LH/2+52);}
    if(state==='over'){ctx.fillStyle='rgba(34,26,72,.7)';rr(30,LH/2-30,LW-60,70,24);ctx.fill();ctx.fillStyle='#fff';ctx.textAlign='center';ctx.font='700 24px Fredoka, Nunito, sans-serif';ctx.fillText(endWhy,LW/2,LH/2+12);}}
  function whack(h,px,py){mallets.push({x:px,y:py,t:0});if(!h||!h.b||h.b.hit||rise(h.b)<.35){streak=0;mult=1;return;}
    const b=h.b;b.hit=true;b.ht=0;
    if(b.kind==='gloopie'){hearts--;streak=0;mult=1;shake=1;pops.push({x:h.x,y:h.y-60,txt:'Au! Niet Gloopie!',bad:true,t:0});if(hearts<=0){state='over';endWhy='Gloopie is boos! 😵';overT=0;}return;}
    hits++;streak++;mult=Math.min(4,1+Math.floor(streak/5));best=Math.max(best,streak);const pts=(b.kind==='gold'?5:1)*mult;score+=pts;
    pops.push({x:h.x,y:h.y-60,txt:`+${pts}`,t:0});pops.push({x:h.x,y:h.y-40,star:true,c:b.c,t:0});
    if(streak%5===0)pops.push({x:LW/2,y:130,txt:`Combo ×${mult}!`,t:0});}
  function toLogic(e){const b=cv.getBoundingClientRect();return {x:(e.clientX-b.left)/b.width*LW,y:(e.clientY-b.top)/b.height*LH};}
  function holeAt(p){let best=null,bd=1e9;for(const h of holes){const dx=p.x-h.x,dy=p.y-(h.y-30);if(Math.abs(dx)<58&&dy>-75&&dy<55){const d=dx*dx+dy*dy;if(d<bd){bd=d;best=h;}}}return best;}
  cv.addEventListener('pointerdown',e=>{e.preventDefault();if(state==='ready'){state='play';return;}if(state!=='play')return;const p=toLogic(e);whack(holeAt(p),p.x,p.y);});
  cv.addEventListener('keydown',e=>{const n='789456123'.indexOf(e.key);if(state==='ready'&&(e.key===' '||e.key==='Enter'||n>=0)){e.preventDefault();state='play';return;}
    if(state==='play'&&n>=0&&!e.repeat){e.preventDefault();const h=holes[n];whack(h,h.x,h.y-30);}});
  function loop(now){raf=requestAnimationFrame(loop);const dt=Math.min(.033,(now-(last||now))/1000);last=now;
    if(state==='play'){time-=dt;spawnT-=dt;if(spawnT<=0){spawn();if(el()>20&&Math.random()<.35)spawn();spawnT=spawnGap();}
      for(const h of holes)if(h.b){const b=h.b;if(b.hit){b.ht+=dt;if(b.ht>.3)h.b=null;}else{b.t+=dt;if(b.t>=b.up){if(b.kind!=='gloopie'){streak=0;mult=1;}h.b=null;}}}
      if(time<=0){time=0;state='over';endWhy='Tijd is op! ⏰';overT=0;}}
    else if(state==='over'){overT+=dt;for(const h of holes)if(h.b&&h.b.hit)h.b.ht+=dt;if(overT>1.3){finish();return;}}
    for(const m of mallets)m.t+=dt;mallets=mallets.filter(m=>m.t<.22);
    for(const p of pops)p.t+=dt*(p.star?2.4:1.2);pops=pops.filter(p=>p.t<1);shake=Math.max(0,shake-dt*3);
    draw();}
  function finish(){cancelAnimationFrame(raf);raf=0;state='done';
    const prev=data.records.mepdeblob;const isRec=score>0&&(!prev||score>prev);if(isRec)data.records.mepdeblob=score;
    stage.innerHTML=finishCommon(g,{score},isRec,[`Score <b>${score} punten</b>`,`Blobs gemept <b>${hits}</b>`,`Langste reeks <b>${best}</b>`,`Jouw record <b>${data.records.mepdeblob||0} punten</b>`],isRec?'grin':score<25?'sad':'happy');
    document.getElementById('again').addEventListener('click',()=>restart());}
  raf=requestAnimationFrame(loop);setTimeout(()=>{try{cv.focus({preventScroll:true})}catch(e){}},50);
  return ()=>{cancelAnimationFrame(raf);window.removeEventListener('resize',size);};
}
