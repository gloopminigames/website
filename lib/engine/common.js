import {data,save,challenge,today,statsHtml} from '../store';
import {blob,ICON} from '../blob';
import {esc,SITE} from '../site';
import {toast} from '../toast';
import {sfx} from '../sfx';
import {confetti} from '../confetti';
import {checkStickers} from '../stickers';
import {coinsFor} from '../shop';
import {levelInfo} from '../levels';
export function shareText(g,r){
  if(g.id==='reactie')return `Ik haalde gemiddeld ${r.avg} ms in Reactie Rush op Gloop 🫧 Ben jij sneller?`;
  if(g.id==='memo')return `Ik vond alle paartjes in Memo Mania in ${r.moves} zetten op Gloop 🫧 Lukt het jou in minder?`;
  if(g.id==='mepdeblob')return `Ik mepte ${r.score} punten bij elkaar in Mep de Blob op Gloop 🔨🫧 Ben jij sneller?`;
  if(g.id==='gloopiegolf'){const d=r.score-26;return `Ik speelde 9 holes Gloopie Golf in ${r.score} slagen (${d>0?'+'+d:d===0?'par':d}) op Gloop ⛳ Kun jij beter?`;}
  if(g.id==='blubberblast')return r.solo?`Ik won ${r.score} rondes op rij van Gloopie in Blubber Blast 🫧 Kun jij dat ook?`:`Wij speelden Blubber Blast op Gloop 🫧 Durf jij het tegen mij op te nemen?`;
  if(g.id==='klikkerklok')return `Ik haalde ${r.score} klikken in Klikkerklok op Gloop 🫧 Ben jij preciezer?`;
  if(g.id==='bubbelbots')return `Ik haalde ${r.score.toLocaleString('nl-NL')} punten in Bubbel Bots op Gloop 🫧 Knal jij er meer?`;
  if(g.id==='gloopfusie')return `Ik haalde ${r.score} punten in Gloopfusie op Gloop 🫧 Maak jij de Koning Gloop?`;
  if(g.id==='popper')return `Ik popte ${r.popped} bubbels en haalde ${r.score} punten in Gloop Popper 🫧 Pop jij er meer?`;
  if(g.id==='ruimte')return `Ik vloog ${r.planets} ${r.planets===1?'planeet':'planeten'} ver en haalde ${r.score.toLocaleString('nl-NL')} punten in Gloop in de Ruimte 🚀 Kom jij verder?`;
  if(g.id==='gloopiezegt')return r.solo?`Ik onthield een rij van ${r.score} Gloopies in Gloopie Zegt op Gloop 🫧 Kun jij er meer onthouden?`:`Wij speelden Gloopie Zegt op Gloop 🫧 Wie onthoudt de langste rij?`;
  if(g.id==='stapelslijm')return `Ik bouwde een slijmtoren van ${r.score} lagen in Stapelslijm op Gloop 🫧 Kom jij hoger?`;
  return `Ik speel ${g.title} op Gloop 🫧`;}
export function shareUrl(id){const base=(SITE.url||location.origin).replace(/\/$/,'');return base+'/games/'+id;}
export async function shareClick(e){const b=e.target.closest('[data-share]');if(!b)return;
  const text=b.dataset.share,url=shareUrl(b.dataset.game);
  try{if(navigator.share){await navigator.share({title:'Gloop',text,url});return;}}catch(err){if(err&&err.name==='AbortError')return;}
  try{await navigator.clipboard.writeText(text+' '+url);toast('Gekopieerd! Plak het in een bericht 💬');}catch(err){toast(text);}}
export function finishCommon(g,resultObj,isRecord,lines,face){
  data.played[g.id]=(data.played[g.id]||0)+1;
  if(isRecord)data.recordCount=(data.recordCount||0)+1;
  // De dagelijkse uitdaging telt op Normaal en Moeilijk, niet op Makkelijk.
  const c=challenge();let chMsg='';
  if(c.game===g.id&&g.level!=='rustig'&&data.challengeDone!==today()&&c.check(resultObj)){data.challengeDone=today();data.challengeCount=(data.challengeCount||0)+1;chMsg=`<div class="ch-msg">${ICON.check} Dagelijkse uitdaging gehaald!</div>`}
  const fresh=checkStickers({game:g.id,level:g.level||'normaal',r:resultObj,challenge:Boolean(chMsg)});
  const coins=coinsFor({level:g.level,isRecord,challenge:Boolean(chMsg),stickers:fresh.length});
  data.coins=(data.coins||0)+coins;
  save();
  document.getElementById('stats').innerHTML=statsHtml(g.id,g.rk||g.id);
  // Feestje: geluid en confetti bij een record of een nieuwe sticker.
  if(isRecord||fresh.length){sfx(isRecord?'record':'sticker');confetti(isRecord?160:90);}else sfx('win');
  const lvl=g.level&&g.level!=='normaal'?`<span class="lvl-tag">${levelInfo(g.level).icon} ${levelInfo(g.level).label}</span>`:'';
  const st=fresh.length?`<div class="new-stickers" role="status"><b>Nieuwe ${fresh.length===1?'sticker':'stickers'}!</b><div>${fresh.map(x=>`<span class="sticker-chip"><span class="se" aria-hidden="true">${x.emoji}</span>${esc(x.name)}</span>`).join('')}</div><a href="/profiel#stickers">Bekijk je stickerboek</a></div>`:'';
  return `<div class="result" role="status">
    ${blob(g.blob,face,'result-blob')}
    <h2>${isRecord?'Nieuw record!':'Goed gedaan!'} ${lvl}</h2>
    <ul>${lines.map(l=>`<li>${l}</li>`).join('')}</ul>
    ${chMsg}
    <a class="coin-msg" href="/winkel"><span class="coin" aria-hidden="true">🪙</span> +${coins} Gloopmunten</a>
    ${st}
    <div class="result-btns"><button type="button" class="btn btn-primary" id="again">Opnieuw spelen</button><button type="button" class="btn btn-sun" data-share="${esc(shareText(g,resultObj))}" data-game="${g.id}">${ICON.share} Deel je score</button><a class="btn btn-plain" href="/games">Andere game</a></div>
  </div>`;
}

// Canvas passend maken voor elk scherm. Het speelveld is altijd LW×LH (staand), zodat iedereen dezelfde ruimte heeft
// (eerlijk voor de ranglijst). Op een breed scherm (computer, tablet) wordt het canvas breder en loopt de achtergrond
// links en rechts door; het speelveld staat dan in het midden. Gebruik: V.tf(ctx) bij tekenen, V.xy(e) bij klikken,
// en teken achtergronden van -V.ox tot V.VW breed.
export function fitCanvas(cv,LW,LH,hFrac=.72,maxRatio=1.9){
  const V={sc:1,dpr:1,ox:0,VW:LW};
  V.resize=()=>{
    const availW=cv.parentElement.clientWidth,wide=window.matchMedia('(min-width:761px)').matches;
    // Op een breed scherm: zo hoog dat de hele game in beeld past (de pagina is al naar de spelbalk gescrold).
    const top=Math.max(60,cv.parentElement.getBoundingClientRect().top);
    let h=Math.max(380,wide?Math.min(window.innerHeight*.9,window.innerHeight-top-20,900):window.innerHeight*hFrac),w=h*LW/LH;
    if(w>availW){w=availW;h=w*LH/LW;}
    const cw=wide?Math.max(w,Math.min(availW,h*maxRatio)):w;
    V.sc=h/LH;V.VW=cw/V.sc;V.ox=(V.VW-LW)/2;V.dpr=Math.min(2,window.devicePixelRatio||1);
    cv.style.width=cw+'px';cv.style.height=h+'px';cv.width=Math.round(cw*V.dpr);cv.height=Math.round(h*V.dpr);
    // Genoeg ruimte naast het speelveld? Dan tonen games daar panelen (score, uitleg) in plaats van eronder.
    V.wide=V.ox>=150;cv.parentElement.classList.toggle('is-wide',V.wide);
    const pw=Math.min(250,V.ox-36);V.pw=pw;V.lx=-V.ox+(V.ox-pw)/2;V.rx=LW+(V.ox-pw)/2;
  };
  V.resize();
  V.xy=e=>{const r=cv.getBoundingClientRect();return {x:(e.clientX-r.left)/r.width*V.VW-V.ox,y:(e.clientY-r.top)/r.height*LH};};
  V.tf=ctx=>ctx.setTransform(V.sc*V.dpr,0,0,V.sc*V.dpr,V.ox*V.sc*V.dpr,0);
  // Zijkanten iets waziger en een randje, zodat je ziet waar het speelveld ophoudt (alleen op brede schermen).
  V.sides=(ctx,veil='rgba(34,26,72,.1)')=>{if(V.ox<1)return;V.tf(ctx);ctx.fillStyle=veil;ctx.fillRect(-V.ox,0,V.ox,LH);ctx.fillRect(LW,0,V.ox,LH);
    ctx.strokeStyle='rgba(34,26,72,.5)';ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(0,0);ctx.lineTo(0,LH);ctx.moveTo(LW,0);ctx.lineTo(LW,LH);ctx.stroke();};
  return V;
}

// Bouwstenen voor de zijpanelen op brede schermen (sticker-stijl van Gloop).
export function card(ctx,x,y,w,h,fill='#FFFFFF'){
  ctx.save();ctx.fillStyle='#221A48';rrect(ctx,x,y+5,w,h,20);ctx.fill();
  ctx.fillStyle=fill;rrect(ctx,x,y,w,h,20);ctx.fill();ctx.lineWidth=3;ctx.strokeStyle='#221A48';ctx.stroke();ctx.restore();
}
export function rrect(ctx,x,y,w,h,r){ctx.beginPath();if(ctx.roundRect)ctx.roundRect(x,y,w,h,r);else ctx.rect(x,y,w,h);}
export function label(ctx,txt,x,y,align='left'){ctx.save();ctx.fillStyle='#6A5FA0';ctx.font='800 12px Nunito, sans-serif';ctx.textAlign=align;ctx.textBaseline='alphabetic';ctx.fillText(txt.toUpperCase(),x,y);ctx.restore();}
export function text(ctx,txt,x,y,size=16,align='left',color='#221A48',weight=700){ctx.save();ctx.fillStyle=color;ctx.font=`${weight} ${size}px Fredoka, Nunito, sans-serif`;ctx.textAlign=align;ctx.textBaseline='alphabetic';ctx.fillText(txt,x,y);ctx.restore();}
export const EMOJI_FONT='"Apple Color Emoji","Segoe UI Emoji","Noto Color Emoji",sans-serif';
