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
