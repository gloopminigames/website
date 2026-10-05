// Korte geluidjes, gemaakt in de browser zelf (Web Audio). Geen geluidsbestanden, niets naar een server.
import {data,save} from './store';
let ctx=null;
function ac(){
  if(typeof window==='undefined')return null;
  if(!ctx){const C=window.AudioContext||window.webkitAudioContext;if(!C)return null;try{ctx=new C();}catch(e){return null;}}
  if(ctx.state==='suspended')ctx.resume().catch(()=>{});
  return ctx;
}
export const soundOn=()=>!data.soundOff;
export function setSound(on){data.soundOff=!on;save();if(on)sfx('click');}
function tone(c,f,{t=0,d=.12,type='sine',v=.14,to=null}={}){
  const o=c.createOscillator(),g=c.createGain(),s=c.currentTime+t;
  o.type=type;o.frequency.setValueAtTime(f,s);if(to)o.frequency.exponentialRampToValueAtTime(to,s+d);
  g.gain.setValueAtTime(.0001,s);g.gain.exponentialRampToValueAtTime(v,s+.01);g.gain.exponentialRampToValueAtTime(.0001,s+d);
  o.connect(g).connect(c.destination);o.start(s);o.stop(s+d+.02);
}
const SOUNDS={
  click:c=>tone(c,660,{d:.06,type:'triangle',v:.08}),
  tap:c=>tone(c,520,{d:.07,type:'triangle',v:.07,to:700}),
  pop:c=>tone(c,380,{d:.12,type:'sine',v:.18,to:900}),
  hit:c=>{tone(c,220,{d:.1,type:'square',v:.08,to:120});tone(c,880,{t:.02,d:.1,type:'triangle',v:.1,to:1300});},
  oops:c=>tone(c,300,{d:.25,type:'sawtooth',v:.07,to:140}),
  good:c=>{tone(c,660,{d:.1,type:'triangle'});tone(c,990,{t:.09,d:.16,type:'triangle'});},
  win:c=>[523,659,784].forEach((f,i)=>tone(c,f,{t:i*.1,d:.18,type:'triangle',v:.12})),
  record:c=>[523,659,784,1047,784,1047].forEach((f,i)=>tone(c,f,{t:i*.09,d:i===5?.4:.15,type:'triangle',v:.13})),
  sticker:c=>[880,1175,1568].forEach((f,i)=>tone(c,f,{t:i*.07,d:.22,type:'sine',v:.12}))
};
export function sfx(name){
  if(!soundOn())return;
  const c=ac();if(!c||!SOUNDS[name])return;
  try{SOUNDS[name](c);}catch(e){}
}

// Eigen toontje per Gloopie (vrolijke toonladder), voor Gloopie Zegt.
const NOTES=[392,440,523,587,659,784];
export function note(i){
  if(!soundOn())return;
  const c=ac();if(!c)return;
  try{tone(c,NOTES[i%NOTES.length],{d:.28,type:'triangle',v:.16});}catch(e){}
}
