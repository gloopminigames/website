// Gloop game-module. Wordt alleen geladen als iemand deze game speelt.
import {data,save} from '../store';
import {blob,ICON} from '../blob';
import {finishCommon} from './common';
import {sfx} from '../sfx';
import {toast} from '../toast';
/* ---------- Bubbel Bots ---------- */
export default function start(stage,g,restart){
  // Niveau: rustig = minder kleuren en rijen komen later, snel = meer kleuren en eerder.
  const NC0=(g.speed||1)<1?3:(g.speed||1)>1?5:4,IV=(g.speed||1)<1?2:(g.speed||1)>1?-1:0;
  const LW=360,LH=560,R=20,D=R*2,RH=R*Math.sqrt(3),TOP=R+4,COLS=9,DEAD=452,SX=180,SY=505,SPEED=950;
  const PAL=['#6BE38A','#FF7AC6','#FFD84A','#8B6CFF','#5CC8FF','#FF9F5A'];
  stage.innerHTML=`<div class="memo-bar"><div class="stat"><span>Score</span><b id="bbS">0</b></div><div class="stat"><span>Level</span><b id="bbL">1</b></div><div class="stat"><span>Nieuwe rij over</span><b id="bbN">7</b></div></div>
    <div class="stapel-wrap"><canvas class="stapel bubbel" id="bbc" tabindex="0" role="application" aria-label="Bubbel Bots: richt met je vinger of muis, laat los om te schieten. Pijltjestoetsen om te richten, spatie om te schieten."></canvas>
    <p class="stapel-help">Richt door te slepen en laat los om te schieten. Raak je 3 of meer bots van dezelfde kleur, dan knallen ze. Bots die los komen te hangen, vallen er ook af. Tik op de kleine bot linksonder om te wisselen.</p></div>`;
  const cv=document.getElementById('bbc'),ctx=cv.getContext('2d');let sc=1,dpr=1;
  function size(){const wrapW=cv.parentElement.clientWidth;let w=Math.min(wrapW,460),h=w*LH/LW;const maxH=Math.max(380,window.innerHeight*.66);if(h>maxH){h=maxH;w=h*LW/LH;}
    dpr=Math.min(2,window.devicePixelRatio||1);cv.style.width=w+'px';cv.style.height=h+'px';cv.width=Math.round(w*dpr);cv.height=Math.round(h*dpr);sc=w/LW;}
  size();window.addEventListener('resize',size);
  const BODY=new Path2D('M100 20 C152 20 180 58 180 106 C180 134 174 152 166 162 C160 170 158 184 150 184 C142 184 142 170 134 170 C126 170 126 180 118 180 C110 180 110 168 100 168 C90 168 90 188 80 188 C70 188 72 170 62 170 C52 170 48 180 40 176 C28 168 20 144 20 106 C20 58 48 20 100 20 Z');
  let rows,ncol,cur,next,shot,aim=-Math.PI/2,score=0,popped=0,level=1,shots=0,interval=7+IV,state='play',pops=[],fall=[],raf=0,last=0,overT=0,down=null,happy=0;
  const $s=id=>document.getElementById(id);
  function cnt(r){return rows[r]&&rows[r].odd?COLS-1:COLS;}
  function oddAt(r){return rows.length?((rows[0].odd?1:0)+r)%2===1:r%2===1;}
  function ensure(r){while(rows.length<=r){const o=oddAt(rows.length);rows.push({odd:o,cells:Array(o?COLS-1:COLS).fill(null)});}}
  function pos(r,c){return {x:R+c*D+(rows[r]&&rows[r].odd?R:0),y:TOP+r*RH};}
  function randRow(o){return {odd:o,cells:Array.from({length:o?COLS-1:COLS},()=>PAL[Math.floor(Math.random()*ncol)])};}
  function fill(n){rows=[];for(let i=0;i<n;i++)rows.push(randRow(i%2===1));}
  function present(){const set=new Set();for(const rw of rows)for(const c of rw.cells)if(c)set.add(c);return [...set];}
  function pick(){const p=present();return p.length?p[Math.floor(Math.random()*p.length)]:PAL[Math.floor(Math.random()*ncol)];}
  function nb(r,c){const o=rows[r]&&rows[r].odd,res=[[r,c-1],[r,c+1]];const a=o?[c,c+1]:[c-1,c];for(const rr of[r-1,r+1])for(const cc of a)res.push([rr,cc]);
    return res.filter(([rr,cc])=>rr>=0&&rr<rows.length&&cc>=0&&cc<cnt(rr));}
  function hud(){$s('bbS').textContent=score.toLocaleString('nl-NL');$s('bbL').textContent=level;$s('bbN').textContent=Math.max(0,interval-shots%interval);}
  function start(){ncol=NC0;fill(6);cur=pick();next=pick();hud();}
  function lowest(){let m=-1;rows.forEach((rw,r)=>{if(rw.cells.some(Boolean))m=r;});return m;}
  function snap(x,y){let r=Math.max(0,Math.round((y-TOP)/RH));ensure(r);const o=rows[r].odd;let c=Math.round((x-R-(o?R:0))/D);c=Math.max(0,Math.min(cnt(r)-1,c));
    if(!rows[r].cells[c])return [r,c];
    let best=null,bd=1e9;const cand=[[r,c],...nb(r,c)];ensure(r+1);for(const [rr,cc] of [...cand,...nb(r,c).flatMap(([a,b])=>nb(a,b))]){ensure(rr);if(cc<0||cc>=cnt(rr)||rows[rr].cells[cc])continue;const p=pos(rr,cc),d=(p.x-x)**2+(p.y-y)**2;if(d<bd){bd=d;best=[rr,cc];}}
    return best||[r,c];}
  function place(x,y,color){const [r,c]=snap(x,y);ensure(r);rows[r].cells[c]=color;
    const grp=[[r,c]],seen=new Set([r+','+c]);for(let i=0;i<grp.length;i++)for(const [a,b] of nb(...grp[i]))if(!seen.has(a+','+b)&&rows[a].cells[b]===color){seen.add(a+','+b);grp.push([a,b]);}
    shots++;let gained=0;
    if(grp.length>=3){for(const [a,b] of grp){const p=pos(a,b);pops.push({x:p.x,y:p.y,c:color,t:0});rows[a].cells[b]=null;}gained+=grp.length*10;popped+=grp.length;happy=1;
      const keep=new Set(),q=[];rows[0]&&rows[0].cells.forEach((v,i)=>{if(v){keep.add('0,'+i);q.push([0,i]);}});
      for(let i=0;i<q.length;i++)for(const [a,b] of nb(...q[i]))if(rows[a].cells[b]&&!keep.has(a+','+b)){keep.add(a+','+b);q.push([a,b]);}
      let fl=0;rows.forEach((rw,a)=>rw.cells.forEach((v,b)=>{if(v&&!keep.has(a+','+b)){const p=pos(a,b);fall.push({x:p.x,y:p.y,c:v,vy:-60-Math.random()*80,vx:(Math.random()-.5)*80});rw.cells[b]=null;fl++;}}));
      gained+=fl*20;popped+=fl;if(fl)pops.push({x:p0.x,y:p0.y,c:'txt',txt:`+${fl*20} vallers!`,t:0});
      shots--;}
    score+=gained;if(gained)sfx('pop');
    if(!rows.some(rw=>rw.cells.some(Boolean))){level++;score+=500*level;ncol=Math.min(PAL.length,NC0-1+level);pops.push({x:180,y:220,c:'txt',txt:`Level ${level}! +${500*level}`,t:0});fill(5);shots=0;interval=Math.max(4+IV,8+IV-level);}
    else if(shots>0&&shots%interval===0)addRow();
    while(rows.length&&!rows[rows.length-1].cells.some(Boolean))rows.pop();
    hud();if(lowest()>=0&&TOP+lowest()*RH+R>DEAD){state='over';overT=0;}}
  let p0={x:180,y:200};
  function addRow(){const o=rows.length?!rows[0].odd:false;rows.unshift(randRow(o));}
  function shoot(){if(state!=='play'||shot)return;const a=Math.max(-Math.PI+.14,Math.min(-.14,aim));shot={x:SX,y:SY,vx:Math.cos(a)*SPEED,vy:Math.sin(a)*SPEED,c:cur};cur=next;next=pick();}
  function swap(){if(state!=='play'||shot)return;[cur,next]=[next,cur];}
  function collide(x,y){if(y-R<=TOP-R)return true;for(let r=0;r<rows.length;r++){const py=TOP+r*RH;if(Math.abs(py-y)>D)continue;for(let c=0;c<rows[r].cells.length;c++){if(!rows[r].cells[c])continue;const p=pos(r,c);if((p.x-x)**2+(p.y-y)**2<(D*.86)**2)return true;}}return false;}
  function bot(x,y,c,rad,face){ctx.save();ctx.translate(x,y);const k=rad/R;ctx.scale(k,k);
    ctx.strokeStyle='#221A48';ctx.lineWidth=2.5;ctx.beginPath();ctx.moveTo(0,-R+2);ctx.lineTo(0,-R-3);ctx.stroke();ctx.beginPath();ctx.arc(0,-R-4,2.6,0,7);ctx.fillStyle='#FFD84A';ctx.fill();ctx.stroke();
    ctx.beginPath();ctx.arc(0,0,R-1.5,0,7);ctx.fillStyle=c;ctx.fill();ctx.lineWidth=3;ctx.stroke();
    ctx.beginPath();ctx.ellipse(-7,-9,5,3,-.6,0,7);ctx.fillStyle='rgba(255,255,255,.65)';ctx.fill();
    ctx.fillStyle='#221A48';rr2(-11,-2,22,9,4.5);ctx.fill();
    for(const ex of[-5.5,5.5]){ctx.beginPath();ctx.arc(ex,2.5,2.6,0,7);ctx.fillStyle=face==='sad'?'#FF7AC6':'#6BE38A';ctx.fill();}
    ctx.restore();}
  function rr2(x,y,w,h,r){ctx.beginPath();ctx.moveTo(x+r,y);ctx.arcTo(x+w,y,x+w,y+h,r);ctx.arcTo(x+w,y+h,x,y+h,r);ctx.arcTo(x,y+h,x,y,r);ctx.arcTo(x,y,x+w,y,r);ctx.closePath();}
  function gloopie(x,y,s){ctx.save();ctx.translate(x,y);const sq=1+happy*.12;ctx.scale(s*sq,s/sq);ctx.translate(-100,-188);ctx.fillStyle='#6BE38A';ctx.fill(BODY);ctx.lineWidth=12;ctx.strokeStyle='#221A48';ctx.stroke(BODY);
    const lx=Math.cos(aim)*5,ly=Math.sin(aim)*5;for(const ex of[78,122]){ctx.beginPath();ctx.ellipse(ex,100,15,18,0,0,7);ctx.fillStyle='#fff';ctx.fill();ctx.lineWidth=8;ctx.stroke();ctx.beginPath();ctx.arc(ex+lx,100+ly+2,8,0,7);ctx.fillStyle='#221A48';ctx.fill();}
    ctx.beginPath();if(state==='over'){ctx.moveTo(88,142);ctx.quadraticCurveTo(100,128,112,142);}else{ctx.moveTo(88,130);ctx.quadraticCurveTo(100,146,112,130);}ctx.lineWidth=9;ctx.lineCap='round';ctx.stroke();ctx.restore();}
  function guide(){const a=Math.max(-Math.PI+.14,Math.min(-.14,aim));let x=SX,y=SY,vx=Math.cos(a),vy=Math.sin(a),b=0;ctx.fillStyle='rgba(34,26,72,.35)';
    for(let i=0;i<70;i++){x+=vx*9;y+=vy*9;if(x<R||x>LW-R){vx=-vx;x=Math.max(R,Math.min(LW-R,x));if(++b>1)break;}if(collide(x,y))break;if(i%2===0){ctx.beginPath();ctx.arc(x,y,2.6,0,7);ctx.fill();}}}
  function draw(){ctx.setTransform(sc*dpr,0,0,sc*dpr,0,0);ctx.fillStyle='#FFF1FA';ctx.fillRect(0,0,LW,LH);
    ctx.fillStyle='rgba(255,122,198,.08)';for(let y=0;y<LH;y+=24)for(let x=(y/24)%2*12;x<LW;x+=24){ctx.beginPath();ctx.arc(x,y,2.5,0,7);ctx.fill();}
    ctx.setLineDash([8,8]);ctx.strokeStyle='rgba(192,43,72,.45)';ctx.lineWidth=2.5;ctx.beginPath();ctx.moveTo(0,DEAD);ctx.lineTo(LW,DEAD);ctx.stroke();ctx.setLineDash([]);
    rows.forEach((rw,r)=>rw.cells.forEach((v,c)=>{if(v){const p=pos(r,c);bot(p.x,p.y,v,R);}}));
    if(state==='play'&&!shot)guide();
    if(shot)bot(shot.x,shot.y,shot.c,R);
    for(const f of fall)bot(f.x,f.y,f.c,R,'sad');
    for(const p of pops){if(p.c==='txt'){ctx.globalAlpha=Math.max(0,1-p.t);ctx.font='700 22px Fredoka, Nunito, sans-serif';ctx.textAlign='center';ctx.lineWidth=5;ctx.strokeStyle='#fff';ctx.strokeText(p.txt,p.x,p.y-p.t*30);ctx.fillStyle='#FF4FA8';ctx.fillText(p.txt,p.x,p.y-p.t*30);ctx.globalAlpha=1;continue;}
      ctx.globalAlpha=Math.max(0,1-p.t);ctx.strokeStyle=p.c;ctx.lineWidth=4;ctx.beginPath();ctx.arc(p.x,p.y,R*(1+p.t*1.2),0,7);ctx.stroke();
      for(let k=0;k<6;k++){const an=k/6*Math.PI*2;ctx.fillStyle=p.c;ctx.beginPath();ctx.arc(p.x+Math.cos(an)*R*1.6*p.t*1.4,p.y+Math.sin(an)*R*1.6*p.t*1.4,3.5,0,7);ctx.fill();}ctx.globalAlpha=1;}
    ctx.fillStyle='#FFFFFF';ctx.strokeStyle='#221A48';ctx.lineWidth=3;rr2(0,DEAD+6,LW,LH-DEAD,0);ctx.fill();ctx.beginPath();ctx.moveTo(0,DEAD+6);ctx.lineTo(LW,DEAD+6);ctx.stroke();
    gloopie(SX,LH-6,.36);if(!shot&&state==='play')bot(SX,SY,cur,R);
    ctx.fillStyle='#F4F2FF';rr2(30,500,80,52,16);ctx.fill();ctx.stroke();bot(70,522,next,13);ctx.fillStyle='#4A4270';ctx.font='700 11px Nunito, sans-serif';ctx.textAlign='center';ctx.fillText('wissel ⇄',70,546);
    ctx.fillStyle='#4A4270';ctx.font='700 12px Nunito, sans-serif';ctx.fillText(`Gloopie`,300,530);ctx.fillText(`schiet!`,300,546);}
  function toLogic(e){const b=cv.getBoundingClientRect();return {x:(e.clientX-b.left)/b.width*LW,y:(e.clientY-b.top)/b.height*LH};}
  function setAim(p){aim=Math.atan2(Math.min(p.y-SY,-8),p.x-SX);}
  function inSwap(p){return p.x>=26&&p.x<=114&&p.y>=496&&p.y<=556;}
  cv.addEventListener('pointerdown',e=>{e.preventDefault();const p=toLogic(e);down={swap:inSwap(p)};if(!down.swap)setAim(p);try{cv.setPointerCapture(e.pointerId)}catch(_){} });
  cv.addEventListener('pointermove',e=>{const p=toLogic(e);if(down&&down.swap)return;if(down||e.pointerType==='mouse')setAim(p);});
  cv.addEventListener('pointerup',e=>{if(!down)return;const p=toLogic(e);if(down.swap&&inSwap(p))swap();else if(!down.swap)shoot();down=null;});
  cv.addEventListener('pointercancel',()=>{down=null;});
  cv.addEventListener('keydown',e=>{if(e.key==='ArrowLeft'){aim-=.06;e.preventDefault();}else if(e.key==='ArrowRight'){aim+=.06;e.preventDefault();}else if(e.key===' '||e.key==='Enter'){e.preventDefault();if(!e.repeat)shoot();}else if(e.key==='s'||e.key==='S')swap();
    aim=Math.max(-Math.PI+.14,Math.min(-.14,aim));});
  function loop(now){raf=requestAnimationFrame(loop);const dt=Math.min(.033,(now-(last||now))/1000);last=now;
    if(shot){const steps=4;for(let i=0;i<steps&&shot;i++){shot.x+=shot.vx*dt/steps;shot.y+=shot.vy*dt/steps;
      if(shot.x<R){shot.x=R;shot.vx=-shot.vx;}if(shot.x>LW-R){shot.x=LW-R;shot.vx=-shot.vx;}
      if(collide(shot.x,shot.y)){p0={x:shot.x,y:shot.y};const s0=shot;shot=null;place(s0.x,s0.y,s0.c);}}}
    for(const p of pops)p.t+=dt*(p.c==='txt'?.8:2.2);pops=pops.filter(p=>p.t<1);
    for(const f of fall){f.vy+=1200*dt;f.y+=f.vy*dt;f.x+=f.vx*dt;}fall=fall.filter(f=>f.y<LH+40);
    happy=Math.max(0,happy-dt*2.5);
    if(state==='over'){overT+=dt;if(overT>1.2){state='done';finish();}}
    draw();}
  function finish(){cancelAnimationFrame(raf);raf=0;
    const prev=data.records[g.rk];const isRec=score>0&&(!prev||score>prev);if(isRec)data.records[g.rk]=score;
    const face=isRec?'grin':score<300?'sad':'happy';
    stage.innerHTML=finishCommon(g,{score},isRec,[`Score <b>${score.toLocaleString('nl-NL')}</b>`,`Bots geknald <b>${popped}</b>`,`Level <b>${level}</b>`,`Jouw record <b>${(data.records[g.rk]||0).toLocaleString('nl-NL')}</b>`],face);
    document.getElementById('again').addEventListener('click',()=>restart());}
  start();raf=requestAnimationFrame(loop);setTimeout(()=>{try{cv.focus({preventScroll:true})}catch(e){}},50);
  return ()=>{cancelAnimationFrame(raf);window.removeEventListener('resize',size);};
}
