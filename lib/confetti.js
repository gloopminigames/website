// Confetti over het hele scherm, bijvoorbeeld bij een nieuw record. Uit bij "minder beweging".
const COLORS=['#6BE38A','#6A4BEB','#FF7AC6','#FFD84A','#5CC8FF','#FF9F5A'];
export function confetti(n=140){
  if(typeof window==='undefined'||window.matchMedia('(prefers-reduced-motion: reduce)').matches)return;
  const cv=document.createElement('canvas');cv.className='confetti';cv.setAttribute('aria-hidden','true');
  document.body.appendChild(cv);
  const dpr=Math.min(2,window.devicePixelRatio||1),W=innerWidth,H=innerHeight;
  cv.width=W*dpr;cv.height=H*dpr;const c=cv.getContext('2d');c.scale(dpr,dpr);
  const ps=Array.from({length:n},()=>({x:W/2+(Math.random()-.5)*W*.3,y:H*.35,vx:(Math.random()-.5)*11,vy:-Math.random()*13-4,
    r:Math.random()*6.28,vr:(Math.random()-.5)*.3,w:6+Math.random()*7,h:8+Math.random()*8,col:COLORS[Math.floor(Math.random()*COLORS.length)]}));
  let t0=performance.now(),raf=0;
  function step(t){
    const dt=Math.min(32,t-t0)/16;t0=t;c.clearRect(0,0,W,H);let alive=0;
    for(const p of ps){p.vy+=.35*dt;p.vx*=.99;p.x+=p.vx*dt;p.y+=p.vy*dt;p.r+=p.vr*dt;if(p.y<H+20)alive++;
      c.save();c.translate(p.x,p.y);c.rotate(p.r);c.fillStyle=p.col;c.fillRect(-p.w/2,-p.h/2,p.w,p.h);c.restore();}
    if(alive)raf=requestAnimationFrame(step);else cv.remove();
  }
  raf=requestAnimationFrame(step);
  setTimeout(()=>{cancelAnimationFrame(raf);cv.remove();},5000);
}
