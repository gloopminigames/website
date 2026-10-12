// Gloop game-module. Wordt alleen geladen als iemand deze game speelt.
import {data} from '../store';
import {blob} from '../blob';
import {finishCommon} from './common';
import {sfx,soundOn} from '../sfx';
/* ---------- Tik Tak Gloop: leren klokkijken ----------
   10 vragen. Soorten: "Hoe laat is het?" (kies het goede antwoord), "Zet de klok op …" (sleep de wijzers)
   en (Normaal/Moeilijk) "Welke klok hoort bij 15:30?".
   Makkelijk: hele en halve uren. Normaal: + kwart over / kwart voor. Moeilijk: alle 5 minuten. */
const N=['twaalf','één','twee','drie','vier','vijf','zes','zeven','acht','negen','tien','elf'];
const hn=h=>N[((h%12)+12)%12];
// De Nederlandse manier: "tien voor half vier", "kwart over drie", …
export function say(h,m){
  const a=hn(h),b=hn(h+1);
  return m===0?`${a} uur`:m===5?`vijf over ${a}`:m===10?`tien over ${a}`:m===15?`kwart over ${a}`:m===20?`tien voor half ${b}`:
    m===25?`vijf voor half ${b}`:m===30?`half ${b}`:m===35?`vijf over half ${b}`:m===40?`tien over half ${b}`:
    m===45?`kwart voor ${b}`:m===50?`tien voor ${b}`:`vijf voor ${b}`;}
// Uitleg bij een fout antwoord: waar staan de wijzers en waarom heet het zo?
function explain(h,m){
  const big=m===0?12:m/5,H=((h%12)||12),H1=(H%12)+1;
  const grote=`De grote wijzer staat op de ${big}`;
  if(m===0)return `${grote}: dat is een heel uur. De kleine wijzer staat op de ${H}, dus het is ${say(h,m)}.`;
  if(m===30)return `${grote}: dat is half. De kleine wijzer staat tussen de ${H} en de ${H1}. Half betekent: half op weg naar de ${H1}. Dus: ${say(h,m)}.`;
  if(m===15)return `${grote}: een kwartier over het hele uur. De kleine wijzer is net voorbij de ${H}. Dus: ${say(h,m)}.`;
  if(m===45)return `${grote}: nog een kwartier tot het hele uur. De kleine wijzer is bijna bij de ${H1}. Dus: ${say(h,m)}.`;
  if(m<15)return `${grote}: ${m} minuten over het hele uur. De kleine wijzer is net voorbij de ${H}. Dus: ${say(h,m)}.`;
  if(m<30)return `${grote}: nog ${30-m} minuten tot half. Dus: ${say(h,m)}.`;
  if(m<45)return `${grote}: ${m-30} minuten na half. Dus: ${say(h,m)}.`;
  return `${grote}: nog ${60-m} minuten tot de ${H1}. Dus: ${say(h,m)}.`;}
const pad=n=>String(n).padStart(2,'0');
const R=a=>a[Math.floor(Math.random()*a.length)];
const shuffle=a=>{for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]];}return a;};

// Klok als SVG. Kleine wijzer (uur) = paars en kort, grote wijzer (minuten) = roze en lang.
function clockSvg(h,m,{size='',id='',drag=false}={}){
  const ticks=[];for(let i=0;i<60;i++){const a=i*6*Math.PI/180,big=i%5===0,r1=big?84:88;
    ticks.push(`<line x1="${100+Math.sin(a)*r1}" y1="${100-Math.cos(a)*r1}" x2="${100+Math.sin(a)*93}" y2="${100-Math.cos(a)*93}" stroke="#221A48" stroke-width="${big?3.2:1.4}" stroke-linecap="round"/>`);}
  const nums=[];for(let i=1;i<=12;i++){const a=i*30*Math.PI/180;nums.push(`<text x="${100+Math.sin(a)*70}" y="${100-Math.cos(a)*70}" dy=".36em" text-anchor="middle">${i}</text>`);}
  return `<svg class="kk-clock ${size}${drag?' drag':''}" ${id?`id="${id}"`:''} viewBox="0 0 200 200" role="img" aria-label="Klok: ${say(h,m)}">
    <circle cx="100" cy="100" r="97" fill="#fff" stroke="#221A48" stroke-width="5"/>
    <circle cx="100" cy="100" r="78" fill="#FFF8DC"/>
    ${ticks.join('')}<g class="kk-num">${nums.join('')}</g>
    <g class="kk-h" style="transform:rotate(${((h%12)+m/60)*30}deg)"><line x1="100" y1="108" x2="100" y2="54" stroke="#6A4BEB" stroke-width="11" stroke-linecap="round"/></g>
    <g class="kk-m" style="transform:rotate(${m*6}deg)"><line x1="100" y1="112" x2="100" y2="22" stroke="#FF7AC6" stroke-width="7" stroke-linecap="round"/>${drag?'<circle cx="100" cy="24" r="9" fill="#FF7AC6" stroke="#221A48" stroke-width="2.5"/>':''}</g>
    ${drag?'<circle class="kk-hknob" cx="100" cy="58" r="10" fill="#6A4BEB" stroke="#221A48" stroke-width="2.5"/>':''}
    <circle cx="100" cy="100" r="7" fill="#221A48"/></svg>`;}
function setHands(svg,h,m){svg.querySelector('.kk-h').style.transform=`rotate(${((h%12)+m/60)*30}deg)`;svg.querySelector('.kk-m').style.transform=`rotate(${m*6}deg)`;
  const k=svg.querySelector('.kk-hknob');if(k)k.style.transform=`rotate(${((h%12)+m/60)*30}deg)`;svg.setAttribute('aria-label','Klok: '+say(h,m));}

// Voorlezen (als de browser een Nederlandse stem heeft)
function speak(t){try{if(!soundOn()||!window.speechSynthesis)return;speechSynthesis.cancel();const u=new SpeechSynthesisUtterance(t);u.lang='nl-NL';u.rate=.92;
  const v=speechSynthesis.getVoices().find(v=>/^nl/i.test(v.lang));if(v)u.voice=v;speechSynthesis.speak(u);}catch(e){}}

export default function start(stage,g,restart){
  const LV=g.level||'normaal';
  const MINS=LV==='rustig'?[0,30]:LV==='normaal'?[0,15,30,45]:[0,5,10,15,20,25,30,35,40,45,50,55];
  const TOTAL=10;
  // Vragen: afwisselend aflezen, zelf zetten en (niet op Makkelijk) digitaal → klok
  const kinds=LV==='rustig'?['read','read','set','read','set','read','read','set','read','set']
    :['read','set','read','digi','read','set','read','digi','set','read'];
  const used=new Set();
  const qs=kinds.map(kind=>{let h,m,k;do{h=1+Math.floor(Math.random()*12);m=R(MINS);k=h+':'+m;}while(used.has(k)&&used.size<MINS.length*12-1);used.add(k);return {kind,h,m};});
  let qi=0,good=0,streak=0,best=0,timers=[],gone=false,setH=12,setM=0,dragging=null,answered=false;
  const later=(fn,ms)=>{const t=setTimeout(()=>{if(!gone)fn();},ms);timers.push(t);};
  stage.innerHTML=`<div class="kk">
    <div class="kk-bar"><div class="kk-dots" id="kkDots">${qs.map(()=>'<span></span>').join('')}</div><div class="stat"><span>Goed</span><b id="kkGood">0</b></div></div>
    <div class="kk-q"><span class="kk-gloop">${blob(g.blob,'happy','kk-blob')}</span><p id="kkQ" aria-live="polite"></p><button type="button" class="kk-say" id="kkSay" aria-label="Lees de vraag voor">🔊</button></div>
    <div class="kk-main" id="kkMain"></div>
    <div class="kk-fb" id="kkFb" aria-live="polite"></div>
  </div>`;
  const $=s=>stage.querySelector(s),main=$('#kkMain'),fb=$('#kkFb');
  let speakText='';
  $('#kkSay').onclick=()=>speak(speakText);
  function dots(){[...$('#kkDots').children].forEach((d,i)=>{d.className=i<qi?(qs[i].ok?'ok':'no'):i===qi?'on':'';});$('#kkGood').textContent=good;}
  // Foute antwoorden die vaak voorkomen: uur ernaast (half vier ↔ half drie!), wijzers verwisseld, kwart over ↔ kwart voor.
  function options(h,m){const want=say(h,m);const out=new Set([want]);
    const cand=[[h-1,m],[h+1,m],[h,(60-m)%60],[m/5||12,(h%12)*5],[h,(m+30)%60],[h+1,(60-m)%60]].filter(([a,b])=>MINS.includes(b));
    for(const [a,b] of shuffle(cand)){if(out.size>=(LV==='rustig'?3:4))break;out.add(say(a,b));}
    while(out.size<(LV==='rustig'?3:4))out.add(say(1+Math.floor(Math.random()*12),R(MINS)));
    return shuffle([...out]);}
  function ask(){
    answered=false;fb.innerHTML='';fb.className='kk-fb';dots();const q=qs[qi];
    if(q.kind==='read'){
      $('#kkQ').textContent='Hoe laat is het?';speakText='Hoe laat is het?';
      main.innerHTML=`<div class="kk-read">${clockSvg(q.h,q.m)}<div class="kk-opts">${options(q.h,q.m).map(t=>`<button type="button" class="kk-opt" data-t="${t}">${t}</button>`).join('')}</div></div>`;
      main.querySelectorAll('.kk-opt').forEach(b=>b.addEventListener('click',()=>{if(answered)return;answer(b.dataset.t===say(q.h,q.m),b);}));
    }else if(q.kind==='set'){
      setH=12;setM=0;
      $('#kkQ').innerHTML=`Zet de klok op <b>${say(q.h,q.m)}</b>`;speakText='Zet de klok op '+say(q.h,q.m);
      main.innerHTML=`<div class="kk-set">${clockSvg(12,0,{drag:true,id:'kkDrag'})}
        <p class="kk-help"><span><span class="kk-key m"></span> Grote wijzer: minuten</span><span><span class="kk-key h"></span> Kleine wijzer: uur</span></p>
        <div class="kk-setbtns"><button type="button" class="btn btn-plain kk-step" data-d="-1" aria-label="Wijzers 5 minuten terug">−5</button><button type="button" class="btn btn-primary" id="kkCheck">Klaar!</button><button type="button" class="btn btn-plain kk-step" data-d="1" aria-label="Wijzers 5 minuten vooruit">+5</button></div></div>`;
      const svg=$('#kkDrag');
      const ang=e=>{const r=svg.getBoundingClientRect();const x=e.clientX-r.left-r.width/2,y=e.clientY-r.top-r.height/2;return {a:(Math.atan2(x,-y)*180/Math.PI+360)%360,d:Math.hypot(x,y)/(r.width/2)};};
      svg.addEventListener('pointerdown',e=>{if(answered)return;e.preventDefault();svg.setPointerCapture(e.pointerId);const {a,d}=ang(e);
        // Dichtbij het midden of bij de kleine wijzer: uur. Verder naar buiten: minuten.
        const hA=((setH%12)+setM/60)*30,diff=Math.abs(((a-hA+540)%360)-180);dragging=d<.62||(d<.75&&diff<20)?'h':'m';move(a);});
      svg.addEventListener('pointermove',e=>{if(dragging)move(ang(e).a);});
      const end=()=>{if(dragging){dragging=null;sfx('tap');}};svg.addEventListener('pointerup',end);svg.addEventListener('pointercancel',end);
      function move(a){
        if(dragging==='m'){const nm=Math.round(a/6/5)*5%60;
          if(setM>=45&&nm<=15&&nm!==setM)setH=setH%12+1;else if(setM<=15&&nm>=45&&nm!==setM)setH=(setH+10)%12+1;   // over de 12 heen: uur verder of terug
          setM=nm;}
        else{setH=((Math.round(a/30-setM/60)%12)+12)%12||12;}
        setHands(svg,setH,setM);}
      main.querySelectorAll('.kk-step').forEach(b=>b.addEventListener('click',()=>{if(answered)return;let t=(setH%12)*60+setM+5*b.dataset.d;t=(t+720)%720;setH=Math.floor(t/60)||12;setM=t%60;setHands(svg,setH,setM);sfx('tap');}));
      $('#kkCheck').addEventListener('click',()=>{if(answered)return;answer(setH%12===q.h%12&&setM===q.m,null,true);});
    }else{
      const pm=q.h!==12&&Math.random()<.5,dh=pm?q.h+12:q.h;
      $('#kkQ').innerHTML=`Welke klok is <b class="kk-digi">${pad(dh)}:${pad(q.m)}</b>?`;speakText=`Welke klok is ${dh} uur ${q.m||''}?`;
      const opts=[[q.h,q.m]];const cand=shuffle([[q.h+1,q.m],[q.h-1,q.m],[q.m/5||12,(q.h%12)*5],[q.h,(60-q.m)%60],[q.h,(q.m+30)%60]]);
      for(const c of cand){if(opts.length>=3)break;if(!opts.some(o=>o[0]%12===c[0]%12&&o[1]===c[1]))opts.push(c);}
      main.innerHTML=`<p class="kk-tip">${pm?`Na 12 uur 's middags tel je verder: 13 is 1 uur, ${dh} is ${dh-12} uur.`:'Eerst de uren, dan de minuten.'}</p><div class="kk-three">${shuffle(opts).map(([h,m])=>`<button type="button" class="kk-pick" data-ok="${h%12===q.h%12&&m===q.m?1:0}" aria-label="${say(h,m)}">${clockSvg(h,m,{size:'sm'})}</button>`).join('')}</div>`;
      main.querySelectorAll('.kk-pick').forEach(b=>b.addEventListener('click',()=>{if(answered)return;answer(b.dataset.ok==='1',b);}));
    }
  }
  function answer(ok,btn,isSet){
    answered=true;const q=qs[qi];q.ok=ok;
    if(ok){good++;streak++;best=Math.max(best,streak);sfx('good');if(btn)btn.classList.add('right');
      fb.className='kk-fb ok';fb.innerHTML=`<b>${R(['Goed zo!','Super!','Knap hoor!','Helemaal goed!','Jij kunt klokkijken!'])}</b> ${streak>=3?`🔥 ${streak} op rij`:'⭐'}`;
      stage.querySelector('.kk-blob')?.classList.add('hop');later(()=>stage.querySelector('.kk-blob')?.classList.remove('hop'),600);
      later(next,1100);}
    else{streak=0;sfx('oops');if(btn)btn.classList.add('wrong');
      // Laat het goede antwoord zien
      main.querySelectorAll('.kk-opt').forEach(b=>{if(b.dataset.t===say(q.h,q.m))b.classList.add('right');});
      main.querySelectorAll('.kk-pick').forEach(b=>{if(b.dataset.ok==='1')b.classList.add('right');});
      if(isSet){const svg=$('#kkDrag');svg.classList.add('show');setH=q.h;setM=q.m;setHands(svg,q.h,q.m);}
      fb.className='kk-fb no';fb.innerHTML=`<p><b>Bijna!</b> Het is <b>${say(q.h,q.m)}</b>.</p><p class="kk-why">${explain(q.h,q.m)}</p><button type="button" class="btn btn-primary" id="kkNext">Verder</button>`;
      $('#kkNext').addEventListener('click',next);$('#kkNext').focus({preventScroll:true});}
    dots();
  }
  function next(){qi++;if(qi>=TOTAL)finish();else ask();}
  function finish(){
    const score=good;const prev=data.records[g.rk];const isRec=score>0&&(prev==null||score>prev);if(isRec)data.records[g.rk]=score;
    const stars='⭐'.repeat(Math.round(score/2))+'☆'.repeat(5-Math.round(score/2));
    stage.innerHTML=finishCommon(g,{score,streak:best},isRec,[`<span class="kk-stars" aria-label="${Math.round(score/2)} van 5 sterren">${stars}</span>`,`Goed <b>${score} van ${TOTAL}</b>`,`Langste reeks <b>${best} op rij</b>`,`Jouw record <b>${data.records[g.rk]||0} van ${TOTAL}</b>`],score>=8?'grin':score>=5?'happy':'sad');
    document.getElementById('again').addEventListener('click',()=>restart());
  }
  ask();
  return {cleanup:()=>{gone=true;timers.forEach(clearTimeout);try{window.speechSynthesis&&speechSynthesis.cancel();}catch(e){}},pause(){},resume(){}};
}
